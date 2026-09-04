import { api } from "./api";
import type { User, AuthResponse } from "../types/User";

const AUTH_USER_KEY = "aquasense_user";
const AUTH_TOKEN_KEY = "accessToken";

export const login = async (
  emailOrPhone: string,
  password?: string
): Promise<AuthResponse> => {
  const users = await api<User[]>("/users");

  const normalizedInput = emailOrPhone.trim().toLowerCase();

  const matchedUser = users.find(
    (u) =>
      u.email?.toLowerCase() === normalizedInput ||
      u.phoneNumber?.trim() === emailOrPhone.trim()
  );

  if (!matchedUser) {
    throw new Error("Tài khoản hoặc số điện thoại không tồn tại.");
  }

  if (matchedUser.password && password && matchedUser.password !== password) {
    throw new Error("Mật khẩu không chính xác.");
  }

  const token = `mock_jwt_token_${matchedUser.id}_${Date.now()}`;

  // Store in localStorage
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matchedUser));

  return {
    user: matchedUser,
    token,
  };
};

export const getCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const updateProfile = async (
  userId: string,
  updatedData: Partial<User>
): Promise<User> => {
  const current = getCurrentUser();
  const updatedUser: User = {
    ...(current || { id: userId, fullName: "", email: "", role: "FARMER" }),
    ...updatedData,
    updatedAt: new Date().toISOString(),
  };

  try {
    // Attempt to update backend DB via json-server
    await api<User>(`/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });
  } catch (err) {
    console.warn("Could not patch user on backend, saving locally:", err);
  }

  // Update local storage
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
  // Dispatch custom storage event for header update
  window.dispatchEvent(new Event("storage"));

  return updatedUser;
};

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<boolean> => {
  const users = await api<User[]>("/users");
  const user = users.find((u) => u.id === userId);

  if (!user) {
    throw new Error("Không tìm thấy thông tin tài khoản.");
  }

  if (user.password && user.password !== oldPassword) {
    throw new Error("Mật khẩu hiện tại không chính xác.");
  }

  try {
    await api<User>(`/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: newPassword,
        updatedAt: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn("Could not patch password on backend:", err);
  }

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    currentUser.password = newPassword;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
  }

  return true;
};

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event("storage"));
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

