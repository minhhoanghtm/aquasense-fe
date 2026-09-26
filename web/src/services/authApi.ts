import type { User, AuthResponse } from "../types/User";
import { api } from "./api";

const AUTH_USER_KEY = "aquasense_user";
const AUTH_TOKEN_KEY = "accessToken";
const AUTH_REFRESH_TOKEN_KEY = "refreshToken";

export interface BackendLoginResponse {
  userId: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  tokenVersion?: number;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Login
 * POST /auth/login
 */
export const login = async (
  phoneNumber: string,
  password: string,
): Promise<AuthResponse> => {
  const res = await api<BackendLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      phoneNumber,
      password,
    }),
  });

  localStorage.setItem(AUTH_TOKEN_KEY, res.accessToken);
  if (res.refreshToken) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, res.refreshToken);
  }

  const user: User = {
    id: res.userId,
    userId: res.userId,
    fullName: res.fullName,
    phoneNumber: res.phoneNumber,
    role: res.role,
    isActive: true,
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));

  return {
    user,
    token: res.accessToken,
  };
};

/**
 * Get current profile
 * GET /auth/me
 */
export const getProfile = async (): Promise<User | null> => {
  try {
    const res = await api<any>("/auth/me");

    if (res?.userId) {
      const user: User = {
        id: res.userId,
        userId: res.userId,
        fullName: res.fullName,
        phoneNumber: res.phoneNumber,
        role: res.role,
        isActive: res.isActive,
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

/**
 * Refresh JWT token
 * POST /auth/refresh
 */
export const refreshToken = async (): Promise<string | null> => {
  const currentRefresh = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
  if (!currentRefresh) return null;

  try {
    const res = await api<{ accessToken?: string; refreshToken?: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: currentRefresh }),
    });

    if (res?.accessToken && res?.refreshToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, res.accessToken);
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, res.refreshToken);
      return res.accessToken;
    }
  } catch (err) {
    console.error("Làm mới token thất bại:", err);
    logout();
  }

  return null;
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
  message: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  tokenVersion: number;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Đổi mật khẩu tài khoản
 * POST /auth/change-password
 */
export const changePassword = async (
  currentPasswordOrUserId: string,
  newOrCurrentPassword: string,
  possibleNewPassword?: string
): Promise<{ success: boolean; message: string }> => {
  const currentPassword = possibleNewPassword ? newOrCurrentPassword : currentPasswordOrUserId;
  const newPassword = possibleNewPassword ? possibleNewPassword : newOrCurrentPassword;
  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || undefined;

  const res = await api<BackendChangePasswordResponse>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({
      currentPassword,
      newPassword,
      refreshToken,
    }),
  });

  if (res?.accessToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, res.refreshToken);
    }
  }

  return {
    success: true,
    message: res?.message || "Thay đổi mật khẩu thành công!",
  };
};

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event("storage"));
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

export interface SendOtpResponse {
  message: string;
  phoneNumber: string;
  otp: string;
  expiresIn?: string;
}

export interface VerifyOtpResponse {
  message: string;
  phoneNumber: string;
  isValid: boolean;
}

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
export const sendOtp = async (identifier: string, purpose: string = "LOGIN"): Promise<SendOtpResponse> => {
  const clean = identifier.trim();
  const isEmail = clean.includes("@");
  const payload: Record<string, any> = isEmail
    ? { email: clean, identifier: clean, purpose }
    : { phoneNumber: clean.replace(/\s+/g, ""), identifier: clean.replace(/\s+/g, ""), purpose };

  const res = await api<SendOtpResponse>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
};

/**
 * Xác thực mã OTP
 * POST /auth/verify-otp
 */
export const verifyOtp = async (
  identifier: string,
  otp: string,
  purpose: string = "LOGIN"
): Promise<VerifyOtpResponse> => {
  const clean = identifier.trim();
  const isEmail = clean.includes("@");
  const payload: Record<string, any> = isEmail
    ? { email: clean, identifier: clean, otp, purpose }
    : { phoneNumber: clean.replace(/\s+/g, ""), identifier: clean.replace(/\s+/g, ""), otp, purpose };

  const res = await api<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
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
    role: res.role as any,
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
 * POST /auth/reset-password hoặc POST /auth/forgot-password
 */
export const resetPassword = async (
  identifier: string,
  newPassword: string,
  otp?: string
): Promise<{ success: boolean; message: string }> => {
  const clean = identifier.trim();
  const isEmail = clean.includes("@");
  const payload: Record<string, any> = isEmail
    ? { email: clean, identifier: clean, newPassword, otp }
    : { phoneNumber: clean.replace(/\s+/g, ""), identifier: clean.replace(/\s+/g, ""), newPassword, otp };

  try {
    const res = await api<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return {
      success: true,
      message: res?.message || "Đặt lại mật khẩu thành công!",
    };
  } catch (err: any) {
    try {
      const res = await api<{ message?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return {
        success: true,
        message: res?.message || "Đặt lại mật khẩu thành công!",
      };
    } catch {
      throw err;
    }
  }
};

/**
 * Đăng nhập bằng OTP qua Backend (SMS Gateway)
 * POST /auth/verify-otp với purpose: "LOGIN"
 */
export const loginWithOtp = async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
  const res = await api<BackendLoginResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      phoneNumber: phoneNumber.replace(/\s+/g, ""),
      purpose: "LOGIN",
      otp,
    }),
  });

  localStorage.setItem(AUTH_TOKEN_KEY, res.accessToken);
  if (res.refreshToken) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, res.refreshToken);
  }

  const user: User = {
    id: res.userId,
    userId: res.userId,
    fullName: res.fullName,
    phoneNumber: res.phoneNumber,
    role: res.role,
    isActive: true,
  };

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));

  return {
    user,
    token: res.accessToken,
    refreshToken: res.refreshToken,
  };
};
