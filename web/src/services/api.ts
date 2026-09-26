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

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
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
    !endpoint.includes("/auth/forgot-password")
  ) {
    const refreshTokenValue = getRefreshToken();
    const isValidRefreshToken =
      Boolean(refreshTokenValue) &&
      typeof refreshTokenValue === "string" &&
      refreshTokenValue.trim() !== "" &&
      refreshTokenValue !== "undefined" &&
      refreshTokenValue !== "null";

    // 1. Nếu có refreshToken hợp lệ, tự động làm mới access token (Silent Refresh)
    if (isValidRefreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refreshTokenValue }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newAccessToken = data?.accessToken;
            const newRefreshToken = data?.refreshToken;

            if (
              !newAccessToken ||
              typeof newAccessToken !== "string" ||
              !newRefreshToken ||
              typeof newRefreshToken !== "string"
            ) {
              isRefreshing = false;
              refreshSubscribers = [];
              clearAuthStorage();
              if (window.location.pathname !== "/login" && window.location.pathname !== "/forgot-password") {
                window.location.href = "/login?expired=1";
              }
              throw new Error("Phản hồi làm mới token không hợp lệ!");
            }

            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            isRefreshing = false;
            onRefreshed(newAccessToken);

            // Thử lại yêu cầu ban đầu với token mới
            return api<T>(endpoint, options, true);
          } else {
            // Refresh token cũng đã hết hạn -> Tự động logout
            isRefreshing = false;
            refreshSubscribers = [];
            clearAuthStorage();
            if (window.location.pathname !== "/login" && window.location.pathname !== "/forgot-password") {
              window.location.href = "/login?expired=1";
            }
          }
        } catch {
          isRefreshing = false;
          refreshSubscribers = [];
          clearAuthStorage();
          if (window.location.pathname !== "/login" && window.location.pathname !== "/forgot-password") {
            window.location.href = "/login?expired=1";
          }
        }
      } else {
        // Chờ lượt refresh đang chạy và thử lại
        return new Promise<T>((resolve) => {
          refreshSubscribers.push(() => {
            resolve(api<T>(endpoint, options, true));
          });
        });
      }
    } else {
      // 2. Không có refreshToken -> Tự động đăng xuất và điều hướng về trang đăng nhập
      clearAuthStorage();
      if (window.location.pathname !== "/login" && window.location.pathname !== "/forgot-password") {
        window.location.href = "/login?expired=1";
      }
    }
  }

  if (response.status === 403) {
    if (window.location.pathname !== "/403") {
      window.location.href = "/403";
    }
    throw new Error("Không có quyền truy cập");
  }

  if (!response.ok) {
    let errorMessage = `Lỗi yêu cầu API (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message;
      }
    } catch {
      // response body was not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
};