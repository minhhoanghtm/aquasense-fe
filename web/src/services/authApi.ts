import type { User, AuthResponse } from "../types/User";
import { ApiError, api, clearAuthStorage, getRefreshToken, forceRefreshToken } from "./api";

const AUTH_USER_KEY = "aquasense_user";
const AUTH_TOKEN_KEY = "accessToken";
const AUTH_REFRESH_TOKEN_KEY = "refreshToken";

export interface BackendLoginResponse {
  userId: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  tokenVersion: number;
  mustChangePassword: boolean;
  accessToken: string;
  refreshToken: string;
}

interface BackendProfileResponse {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  gender: "MALE" | "FEMALE" | null;
  dateOfBirth: string | null;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  tokenVersion: number;
}

const normalizePhoneNumber = (phoneNumber: string): string =>
  phoneNumber.replace(/\s+/g, "").trim();

type RecoveryIdentifier = { phoneNumber: string } | { email: string };

const toRecoveryIdentifier = (identifier: string): RecoveryIdentifier => {
  const normalized = identifier.trim();
  return normalized.includes("@")
    ? { email: normalized.toLowerCase() }
    : { phoneNumber: normalizePhoneNumber(normalized) };
};

const persistSession = (session: BackendLoginResponse): AuthResponse => {
  localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, session.refreshToken);

  const user: User = {
    id: session.userId,
    userId: session.userId,
    fullName: session.fullName,
    phoneNumber: session.phoneNumber,
    role: session.role,
    isActive: true,
    mustChangePassword: session.mustChangePassword,
    tokenVersion: session.tokenVersion,
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));
  return { user, token: session.accessToken };
};

/**
 * Login
 * POST /auth/login
 */
export const login = async (
  phoneNumber: string,
  password: string,
): Promise<AuthResponse> => {
  // A fresh Password Login must not inherit access/refresh credentials from
  // the expired session. This also makes in-flight refresh requests stale.
  clearAuthStorage();

  const res = await api<BackendLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      phoneNumber,
      password,
    }),
  });

  return persistSession(res);
};

/**
 * Get current profile
 * GET /auth/me
 */
export const getProfile = async (): Promise<User | null> => {
  try {
    const res = await api<BackendProfileResponse>("/auth/me");

    if (res?.userId) {
      const user: User = {
        id: res.userId,
        userId: res.userId,
        fullName: res.fullName,
        phoneNumber: res.phoneNumber,
        email: res.email || undefined,
        gender: res.gender || undefined,
        dateOfBirth: res.dateOfBirth ? String(res.dateOfBirth).split('T')[0] : undefined,
        role: res.role,
        isActive: res.isActive,
        mustChangePassword: res.mustChangePassword,
        tokenVersion: res.tokenVersion,
      };

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event("storage"));
      return user;
    }
  } catch (err) {
    console.warn("Không thể lấy dữ liệu /auth/me:", err);
  }

  return getCurrentUser();
};



export const getCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export interface BackendUpdateProfileResponse {
  message: string;
  user: {
    userId: string;
    fullName: string;
    phoneNumber: string;
    email?: string | null;
    gender?: "MALE" | "FEMALE" | null;
    dateOfBirth?: string | null;
    role: string;
    isActive: boolean;
    fcmToken?: string | null;
    tokenVersion?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

/**
 * Cập nhật thông tin cá nhân (Profile)
 * PATCH /users/profile
 */
export const updateProfile = async (
  _userId: string,
  updatedData: { fullName?: string; phoneNumber?: string; email?: string; gender?: string; dateOfBirth?: string; fcmToken?: string }
): Promise<User> => {
  const payload: Record<string, string> = {};
  if (updatedData.fullName !== undefined && updatedData.fullName !== "") {
    payload.fullName = updatedData.fullName.trim();
  }
  if (updatedData.phoneNumber !== undefined && updatedData.phoneNumber !== "") {
    payload.phoneNumber = updatedData.phoneNumber.trim();
  }
  if (updatedData.email !== undefined) {
    payload.email = updatedData.email.trim();
  }
  if (updatedData.gender !== undefined) {
    payload.gender = updatedData.gender;
  }
  if (updatedData.dateOfBirth !== undefined) {
    payload.dateOfBirth = updatedData.dateOfBirth;
  }

  const res = await api<BackendUpdateProfileResponse>("/users/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (updatedData.fcmToken !== undefined) {
    try {
      await api("/users/fcm-token", {
        method: "PATCH",
        body: JSON.stringify({ fcmToken: updatedData.fcmToken.trim() || null }),
      });
    } catch (e) {
      console.warn("Cập nhật FCM Token:", e);
    }
  }

  const current = getCurrentUser();
  const rawUser = res.user;
  const user: User = {
    ...(current || {}),
    id: rawUser.userId,
    userId: rawUser.userId,
    fullName: rawUser.fullName,
    phoneNumber: rawUser.phoneNumber,
    email: rawUser.email || undefined,
    gender: rawUser.gender || undefined,
    dateOfBirth: rawUser.dateOfBirth ? String(rawUser.dateOfBirth).split('T')[0] : undefined,
    role: rawUser.role,
    isActive: rawUser.isActive,
    fcmToken: updatedData.fcmToken !== undefined ? updatedData.fcmToken : rawUser.fcmToken || undefined,
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));

  return user;
};

export interface BackendChangePasswordResponse {
  userId: string;
  tokenVersion: number;
  mustChangePassword: boolean;
  accessToken: string;
  refreshToken: string;
}

/**
 * Đổi mật khẩu tài khoản
 * POST /auth/change-password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  otp: string,
): Promise<{ success: boolean; message: string }> => {
  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || undefined;

  const res = await api<BackendChangePasswordResponse>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({
      currentPassword,
      newPassword,
      otp,
      refreshToken,
    }),
  });

  localStorage.setItem(AUTH_TOKEN_KEY, res.accessToken);
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, res.refreshToken);

  const currentUser = getCurrentUser();
  if (currentUser) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
      ...currentUser,
      mustChangePassword: res.mustChangePassword,
      tokenVersion: res.tokenVersion,
    }));
    window.dispatchEvent(new Event("storage"));
  }

  return {
    success: true,
    message: "Thay đổi mật khẩu thành công!",
  };
};

export const logout = async (): Promise<void> => {
  const storedRefreshToken = getRefreshToken();
  if (!storedRefreshToken) {
    clearAuthStorage();
    return;
  }

  try {
    await api<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });
    clearAuthStorage();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      try {
        // Trigger the central auto-refresh queue directly without fake requests
        await forceRefreshToken();
      } catch (refreshError) {
        // If api.ts cleared storage (e.g. 401), just return. Otherwise, rethrow (e.g. network error)
        if (!getRefreshToken()) {
          return;
        }
        throw refreshError;
      }

      const rotatedRefreshToken = getRefreshToken();
      if (rotatedRefreshToken) {
        await api<void>("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: rotatedRefreshToken }),
        });
        clearAuthStorage();
        return;
      }
      clearAuthStorage();
      return;
    }
    throw error;
  }
};

export const logoutAll = async (): Promise<void> => {
  await api<void>("/auth/logout-all", {
    method: "POST",
  });
  clearAuthStorage();
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

export interface SendOtpResponse {
  phoneNumber?: string;
  email?: string;
  otp?: string;
  expiresIn?: string;
}

export interface VerifyOtpResponse {
  phoneNumber?: string;
  isValid?: boolean;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  fullName?: string;
  role?: string;
  tokenVersion?: number;
  mustChangePassword?: boolean;
}

export type OtpPurpose = "REGISTER" | "RESET_PASSWORD" | "CHANGE_PASSWORD" | "LOGIN";

export interface BackendRegisterResponse {
  message?: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: string;
  tokenVersion?: number;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Gửi mã OTP xác thực (qua SĐT hoặc Email)
 * POST /auth/send-otp
 */
export const sendOtp = async (phoneNumber: string, purpose: OtpPurpose = "LOGIN"): Promise<SendOtpResponse> => {
  return api<SendOtpResponse>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phoneNumber: normalizePhoneNumber(phoneNumber), purpose }),
  });
};

/** POST /auth/forgot-password — accepts exactly one: phoneNumber or email. */
export const forgotPassword = async (identifier: string): Promise<SendOtpResponse> => {
  return api<SendOtpResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(toRecoveryIdentifier(identifier)),
  });
};

/**
 * Xác thực mã OTP
 * POST /auth/verify-otp
 */
export const verifyOtp = async (
  identifier: string,
  otp: string,
  purpose: OtpPurpose = "LOGIN",
): Promise<VerifyOtpResponse> => {
  return api<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ ...toRecoveryIdentifier(identifier), otp, purpose }),
  });
};

/**
 * Đăng ký tài khoản (Dành cho Quản trị viên khởi tạo tài khoản nhân viên / nông hộ)
 * POST /auth/register
 */
export const register = async (
  fullName: string,
  phoneNumber: string,
  email: string,
  role: string = "FARMER"
): Promise<{ message: string; user: Partial<User> }> => {
  const res = await api<BackendRegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      fullName,
      phoneNumber,
      email,
      role,
    }),
  });

  const user: User = {
    id: res.userId,
    userId: res.userId,
    fullName: res.fullName,
    phoneNumber: res.phoneNumber,
    email: res.email,
    role: res.role,
    isActive: true,
  };

  return {
    message: res.message || "Đăng ký tài khoản thành công. Mật khẩu đã được gửi về email.",
    user,
  };
};

export interface RegisterData {
  fullName: string;
  phoneNumber: string;
  email: string;
  role?: string;
}

export const registerUser = async (
  data: RegisterData
): Promise<{ success: boolean; message: string }> => {
  const res = await register(data.fullName, data.phoneNumber, data.email, data.role || "FARMER");
  return {
    success: true,
    message: res.message,
  };
};

/**
 * Đặt lại mật khẩu tài khoản
 * OTP RESET_PASSWORD must have been verified before this call.
 */
export const resetPassword = async (
  identifier: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> => {
  await api<null>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ ...toRecoveryIdentifier(identifier), newPassword }),
  });
  return { success: true, message: "Đặt lại mật khẩu thành công!" };
};

/**
 * Đăng nhập bằng OTP qua Backend (SMS Gateway)
 * POST /auth/verify-otp với purpose: "LOGIN"
 */
export const loginWithOtp = async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
  const result = await verifyOtp(phoneNumber, otp, "LOGIN");
  if (
    typeof result.accessToken !== "string" ||
    typeof result.refreshToken !== "string" ||
    typeof result.userId !== "string" ||
    typeof result.fullName !== "string" ||
    typeof result.phoneNumber !== "string" ||
    typeof result.role !== "string" ||
    typeof result.tokenVersion !== "number" ||
    typeof result.mustChangePassword !== "boolean"
  ) {
    throw new Error("Phản hồi đăng nhập OTP không hợp lệ.");
  }

  return persistSession(result as BackendLoginResponse);
};
