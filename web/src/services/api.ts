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

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

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
  window.dispatchEvent(new Event("storage"));
};

let refreshPromise: Promise<string> | null = null;

const processTokenRefresh = async (): Promise<string> => {
  const refreshTokenValue = getRefreshToken();
  const token = getAccessToken();

  if (!refreshTokenValue || typeof refreshTokenValue !== "string" || refreshTokenValue.trim() === "" || refreshTokenValue === "undefined" || refreshTokenValue === "null") {
    clearAuthStorage();
    if (window.location.pathname !== "/login" && window.location.pathname !== "/forgot-password") {
      window.location.href = "/login?expired=1";
    }
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const isCurrentAuthSession = () => getAccessToken() === token && getRefreshToken() === refreshTokenValue;

      if (refreshRes.ok) {
        const data = unwrapSuccess<{ accessToken?: string; refreshToken?: string }>(await refreshRes.json());
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        if (!isCurrentAuthSession()) {
          return getAccessToken() || "";
        }

        if (!newAccessToken || typeof newAccessToken !== "string" || !newRefreshToken || typeof newRefreshToken !== "string") {
          clearAuthStorage();
          if (window.location.pathname !== "/login" && window.location.pathname !== "/forgot-password") {
            window.location.href = "/login?expired=1";
          }
          throw new Error("Phản hồi làm mới token không hợp lệ!");
        }

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        return newAccessToken;
      } else {
        if (!isCurrentAuthSession()) {
          return getAccessToken() || "";
        }
        if (refreshRes.status >= 400 && refreshRes.status < 500) {
          clearAuthStorage();
          if (window.location.pathname !== "/login" && window.location.pathname !== "/forgot-password") {
            window.location.href = "/login?expired=1";
          }
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
        throw new Error("Lỗi máy chủ khi làm mới token. Vui lòng thử lại sau.");
      }
    } catch (e) {
      const isCurrentAuthSession = () => getAccessToken() === token && getRefreshToken() === refreshTokenValue;
      if (!isCurrentAuthSession()) {
        return getAccessToken() || "";
      }
      // If it's a network error (TypeError from fetch), don't log the user out
      if (e instanceof TypeError) {
        throw new Error("Lỗi mạng khi làm mới token. Vui lòng thử lại sau.", { cause: e });
      }
      clearAuthStorage();
      if (window.location.pathname !== "/login" && window.location.pathname !== "/forgot-password") {
        window.location.href = "/login?expired=1";
      }
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
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

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

    const retryResponse = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: retryHeaders,
    });

    if (!retryResponse.ok) {
      let errorMessage = `Lỗi yêu cầu API (${retryResponse.status})`;
      let errorCode: string | undefined;
      let retryAfter = parseRetryAfter(retryResponse);

      try {
        const errorData: unknown = await retryResponse.json();
        if (isErrorEnvelope(errorData)) {
          errorMessage = errorData.message;
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
        errorMessage = errorData.message;
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
