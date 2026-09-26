import sys
import re

with open("src/services/authApi.ts", "r", encoding="utf-8") as f:
    code = f.read()

# Replace sendOtp
old_send_otp = '''export const sendOtp = async (identifier: string): Promise<SendOtpResponse> => {
  const clean = identifier.trim();
  const isEmail = clean.includes("@");
  const payload: Record<string, any> = isEmail
    ? { email: clean, identifier: clean }
    : { phoneNumber: clean.replace(/\s+/g, ""), identifier: clean.replace(/\s+/g, "") };

  const res = await api<SendOtpResponse>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
};'''

new_send_otp = '''export const sendOtp = async (identifier: string, purpose: string = "LOGIN"): Promise<SendOtpResponse> => {
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
};'''

code = code.replace(old_send_otp, new_send_otp)

# Replace verifyOtp
old_verify_otp = '''export const verifyOtp = async (
  identifier: string,
  otp: string
): Promise<VerifyOtpResponse> => {
  const clean = identifier.trim();
  const isEmail = clean.includes("@");
  const payload: Record<string, any> = isEmail
    ? { email: clean, identifier: clean, otp }
    : { phoneNumber: clean.replace(/\s+/g, ""), identifier: clean.replace(/\s+/g, ""), otp };

  const res = await api<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
};'''

new_verify_otp = '''export const verifyOtp = async (
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
};'''

code = code.replace(old_verify_otp, new_verify_otp)

login_with_otp = '''

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
'''

code += login_with_otp

with open("src/services/authApi.ts", "w", encoding="utf-8") as f:
    f.write(code)

print("Done")
