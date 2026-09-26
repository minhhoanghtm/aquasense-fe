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
