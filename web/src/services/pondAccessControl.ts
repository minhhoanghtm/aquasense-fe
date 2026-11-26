import { ApiError } from "./api";

export const SELECTED_POND_STORAGE_KEY = "dashboard:selectedPondId";

const ACTION_FORBIDDEN_PHRASES = [
  "chỉ admin",
  "chỉ manager",
  "không có quyền tạo",
  "không có quyền chỉnh sửa",
  "không có quyền xóa",
  "không được gỡ",
  "chỉ có quyền phân công",
  "chỉ có quyền thu hồi",
  "vai trò người dùng không được phép",
  "không có quyền xử lý cảnh báo",
];

const RESOURCE_REVOCATION_PHRASES = [
  "bạn không được phân công cho ao nuôi này",
  "bạn không có quyền truy cập ao nuôi này",
  "bạn không có quyền truy cập thiết bị này",
  "thiết bị chưa được gán vào ao nuôi được phép truy cập",
  "không được phân công cho ao nuôi này",
  "không có quyền truy cập đầm tôm này",
];

const revokedPondIds = new Set<string>();
let pendingPondsRefreshTimer: number | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("auth-cleared", () => {
    clearRevokedPonds();
  });
}

export const isAbortError = (error: unknown): boolean =>
  (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") ||
  (error instanceof Error && error.name === "AbortError");

export type ErrorCategory =
  | "AUTH_401"
  | "RESOURCE_REVOKED_403"
  | "ACTION_FORBIDDEN_403"
  | "NOT_FOUND_404"
  | "NETWORK"
  | "SERVER_5XX"
  | "OTHER";

export const getErrorStatus = (error: unknown): number | undefined => {
  if (error instanceof ApiError) return error.status;
  if (typeof error === "object" && error !== null && "status" in error && typeof error.status === "number") {
    return error.status;
  }
  return undefined;
};

export const getErrorMessage = (error: unknown, fallback = "Đã xảy ra lỗi."): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
};

export const isPondResourceRevocationError = (
  error: unknown,
  context: "http" | "ws-subscribe" = "http",
): boolean => {
  const message = getErrorMessage(error, "").trim().toLowerCase();
  if (!message) return false;

  if (ACTION_FORBIDDEN_PHRASES.some((phrase) => message.includes(phrase))) {
    return false;
  }

  if (context === "http") {
    if (getErrorStatus(error) !== 403) return false;
  }

  return RESOURCE_REVOCATION_PHRASES.some((phrase) => message.includes(phrase));
};

export const classifyApiError = (error: unknown): ErrorCategory => {
  if (error instanceof TypeError) return "NETWORK";
  const status = getErrorStatus(error);
  if (status === 401) return "AUTH_401";
  if (status === 403) {
    return isPondResourceRevocationError(error, "http") ? "RESOURCE_REVOKED_403" : "ACTION_FORBIDDEN_403";
  }
  if (status === 404) return "NOT_FOUND_404";
  if (status === 0) return "NETWORK";
  if (typeof status === "number" && status >= 500) return "SERVER_5XX";
  return "OTHER";
};

export const isPondRevoked = (pondId?: string | null): boolean =>
  Boolean(pondId && revokedPondIds.has(pondId));

export const syncAuthorizedPonds = (pondIds: Array<string | undefined | null>): void => {
  for (const pondId of pondIds) {
    if (pondId) revokedPondIds.delete(pondId);
  }
};

export const clearRevokedPonds = (): void => {
  revokedPondIds.clear();
  if (pendingPondsRefreshTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(pendingPondsRefreshTimer);
    pendingPondsRefreshTimer = null;
  }
};

const schedulePondsRefresh = () => {
  if (typeof window === "undefined") return;
  if (pendingPondsRefreshTimer !== null) return;
  pendingPondsRefreshTimer = window.setTimeout(() => {
    pendingPondsRefreshTimer = null;
    window.dispatchEvent(new Event("ponds-updated"));
  }, 0);
};

/**
 * Central pond-revocation cleanup:
 * 1) Records the revoked pondId (without clearing unrelated authorized ponds).
 * 2) Removes persisted selectedPondId only if it points to the revoked pond.
 * 3) Synchronously notifies pond-scoped hooks to abort fetches, stop timers, and clear state.
 * 4) Schedules a coalesced `ponds-updated` refresh for MainLayout / usePonds / device & alert lists.
 */
export const reportRevokedPond = (pondId: string, reason?: string): void => {
  if (!pondId) return;
  revokedPondIds.add(pondId);

  if (typeof window === "undefined") return;

  if (localStorage.getItem(SELECTED_POND_STORAGE_KEY) === pondId) {
    localStorage.removeItem(SELECTED_POND_STORAGE_KEY);
  }

  const message = reason?.trim() || "Bạn không được phân công cho ao nuôi này!";
  window.dispatchEvent(
    new CustomEvent("pond-access-revoked", {
      detail: { pondId, message },
    }),
  );

  schedulePondsRefresh();
};
