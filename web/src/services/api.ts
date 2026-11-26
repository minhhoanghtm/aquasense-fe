import { getEnv } from "../config/env";

export interface ApiSuccessEnvelope<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  message: string;
  errorCode: string;
  timestamp: string;
  path: string;
  errors?: string[];
  retryAfter?: number;
  retryAfterSeconds?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isSuccessEnvelope = <T>(value: unknown): value is ApiSuccessEnvelope<T> =>
  isRecord(value) && value.success === true && "data" in value;

const isErrorEnvelope = (value: unknown): value is ApiErrorEnvelope =>
  isRecord(value) && value.success === false && typeof value.message === "string";

const unwrapSuccess = <T>(value: unknown): T =>
  isSuccessEnvelope<T>(value) ? value.data : value as T;

const parseRetryAfter = (response: Response): number | undefined => {
  const value = response.headers.get("Retry-After")?.trim();
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);

  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) return undefined;
  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
};

export class ApiError extends Error {
  code?: string;
  retryAfterSeconds?: number;
  status: number;

  constructor(message: string, status: number, code?: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// The backend exposes REST controllers at the origin (Swagger alone is under
// /api/docs). Endpoint configuration is validated centrally in src/config/env.ts.
export const getApiBaseUrl = (): string => getEnv().apiBaseUrl;

const getApiTimeoutMs = (): number => getEnv().apiTimeout;

const fetchWithTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> => {
  const callerSignal = init.signal;
  const controller = new AbortController();
  let timedOut = false;

  const onCallerAbort = () => {
    controller.abort(callerSignal?.reason);
  };

  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort(callerSignal.reason);
    } else {
      callerSignal.addEventListener("abort", onCallerAbort, { once: true });
    }
  }

  const timerId = globalThis.setTimeout(() => {
    timedOut = true;
    const timeoutError =
      typeof DOMException !== "undefined"
        ? new DOMException(`Request timed out after ${timeoutMs}ms`, "TimeoutError")
        : new Error(`Request timed out after ${timeoutMs}ms`);
    controller.abort(timeoutError);
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (timedOut) {
      throw new ApiError(
        `Yêu cầu quá thời gian chờ (${timeoutMs}ms). Vui lòng thử lại sau.`,
        408,
        "REQUEST_TIMEOUT",
      );
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timerId);
    callerSignal?.removeEventListener("abort", onCallerAbort);
  }
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

export const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("aquasense_user");
  localStorage.removeItem("dashboard:selectedPondId");
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event("auth-cleared"));
};

let refreshPromise: Promise<string> | null = null;

const invalidateAccessToken = () => {
  localStorage.removeItem("accessToken");
  window.dispatchEvent(new Event("auth-cleared"));
};

const clearInvalidSession = () => {
  clearAuthStorage();
  if (window.location.pathname !== "/login" && window.location.pathname !== "/forgot-password") {
    window.location.href = "/login?expired=1";
  }
};

const processTokenRefresh = async (): Promise<string> => {
  const refreshTokenValue = getRefreshToken();
  const token = getAccessToken();

  if (!refreshTokenValue || typeof refreshTokenValue !== "string" || refreshTokenValue.trim() === "" || refreshTokenValue === "undefined" || refreshTokenValue === "null") {
    clearInvalidSession();
    throw new ApiError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401, "REFRESH_MISSING");
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    let invalidatedByResponse = false;
    try {
      const apiBaseUrl = getApiBaseUrl();
      const refreshRes = await fetchWithTimeout(
        `${apiBaseUrl}/auth/refresh`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        },
        getApiTimeoutMs(),
      );

      const isCurrentAuthSession = () => getAccessToken() === token && getRefreshToken() === refreshTokenValue;

      if (refreshRes.ok) {
        const data = unwrapSuccess<{ accessToken?: string; refreshToken?: string }>(await refreshRes.json());
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken;

        if (!isCurrentAuthSession()) {
          return getAccessToken() || "";
        }

        if (!data || !newAccessToken || typeof newAccessToken !== "string" || !newRefreshToken || typeof newRefreshToken !== "string") {
          invalidatedByResponse = true;
          clearInvalidSession();
          throw new ApiError("Phản hồi làm mới token không hợp lệ!", 502, "REFRESH_RESPONSE_INVALID");
        }

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("auth-token-refreshed", { detail: { accessToken: newAccessToken } }));
        return newAccessToken;
      } else {
        if (!isCurrentAuthSession()) {
          return getAccessToken() || "";
        }
        if ([400, 401, 403].includes(refreshRes.status)) {
          invalidatedByResponse = true;
          clearInvalidSession();
          throw new ApiError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", refreshRes.status, "REFRESH_INVALID");
        }
        throw new ApiError(
          refreshRes.status === 405
            ? "Máy chủ chưa cho phép làm mới token. Vui lòng thử lại sau."
            : "Lỗi máy chủ khi làm mới token. Vui lòng thử lại sau.",
          refreshRes.status,
          refreshRes.status === 405 ? "AUTH_ROUTE_UNAVAILABLE" : "REFRESH_SERVER_ERROR",
        );
      }
    } catch (e) {
      if (invalidatedByResponse) throw e;
      const isCurrentAuthSession = () => getAccessToken() === token && getRefreshToken() === refreshTokenValue;
      if (!isCurrentAuthSession()) {
        return getAccessToken() || "";
      }
      if (e instanceof TypeError || (e instanceof ApiError && e.code === "REQUEST_TIMEOUT")) {
        invalidateAccessToken();
        if (e instanceof ApiError) throw e;
        throw new ApiError("Lỗi mạng khi làm mới token. Vui lòng thử lại sau.", 0, "NETWORK_ERROR");
      }
      if (e instanceof ApiError && (e.status === 405 || e.status >= 500)) {
        invalidateAccessToken();
        throw e;
      }
      clearInvalidSession();
      throw e instanceof Error ? e : new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const forceRefreshToken = async (): Promise<string> => {
  return processTokenRefresh();
};

export const api = async <T>(
  endpoint: string,
  options?: RequestInit,
  isRetry: boolean = false
): Promise<T> => {
  const apiBaseUrl = getApiBaseUrl();
  const timeoutMs = getApiTimeoutMs();
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetchWithTimeout(
    `${apiBaseUrl}${endpoint}`,
    {
      ...options,
      headers,
    },
    timeoutMs,
  );

  // Tự động xử lý khi Token hết hạn (401 Unauthorized)
  if (
    response.status === 401 &&
    !isRetry &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh") &&
    !endpoint.includes("/auth/register") &&
    !endpoint.includes("/auth/send-otp") &&
    !endpoint.includes("/auth/verify-otp") &&
    !endpoint.includes("/auth/reset-password") &&
    endpoint !== "/auth/logout"
  ) {
    let newAccessToken = getAccessToken();
    if (newAccessToken === token) {
      newAccessToken = await processTokenRefresh();
    } else if (refreshPromise) {
      newAccessToken = await refreshPromise;
    }

    const retryHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(newAccessToken ? { Authorization: `Bearer ${newAccessToken}` } : {}),
      ...(options?.headers as Record<string, string>),
    };

    const retryResponse = await fetchWithTimeout(
      `${apiBaseUrl}${endpoint}`,
      {
        ...options,
        headers: retryHeaders,
      },
      timeoutMs,
    );

    if (!retryResponse.ok) {
      let errorMessage = `Lỗi yêu cầu API (${retryResponse.status})`;
      let errorCode: string | undefined;
      let retryAfter = parseRetryAfter(retryResponse);

      try {
        const errorData: unknown = await retryResponse.json();
        if (isErrorEnvelope(errorData)) {
          errorMessage =
            Array.isArray(errorData.errors) && errorData.errors.length > 0
              ? errorData.errors.join("; ")
              : errorData.message;
          errorCode = errorData.errorCode;
          retryAfter ??= errorData.retryAfterSeconds ?? errorData.retryAfter;
        }
      } catch {
        // ignore error
      }
      throw new ApiError(errorMessage, retryResponse.status, errorCode, retryAfter);
    }
    return unwrapSuccess<T>(await retryResponse.json());
  }

  if (!response.ok) {
    let errorMessage = `Lỗi yêu cầu API (${response.status})`;
    let errorCode: string | undefined;
    let retryAfter = parseRetryAfter(response);

    try {
      const errorData: unknown = await response.json();
      if (isErrorEnvelope(errorData)) {
        errorMessage =
          Array.isArray(errorData.errors) && errorData.errors.length > 0
            ? errorData.errors.join("; ")
            : errorData.message;
        errorCode = errorData.errorCode;
        retryAfter ??= errorData.retryAfterSeconds ?? errorData.retryAfter;
      }
    } catch {
      // ignore error
    }
    throw new ApiError(errorMessage, response.status, errorCode, retryAfter);
  }

  return unwrapSuccess<T>(await response.json());
};
