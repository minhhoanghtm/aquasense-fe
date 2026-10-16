import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  WavesHorizontal,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Shield,
  KeyRound,
  CheckCircle2,
  Info,
  Clock,
  RotateCw,
  Headphones,
} from "lucide-react";
import { verifyOtp, resetPassword, forgotPassword } from "../../services/authApi";
import { ApiError } from "../../services/api";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export const ForgotPassword: React.FC = () => {
  useDocumentTitle("Khôi phục mật khẩu · AquaSense IoT");

  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password, 4: Success
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const sendRequestInFlightRef = useRef(false);
  const genericSuccessMessage = "Nếu Email hoặc số điện thoại đã đăng ký, mã OTP sẽ được gửi. Vui lòng kiểm tra hộp thư hoặc tin nhắn.";
  const getErrorMessage = (error: unknown, fallback: string): string =>
    error instanceof Error && error.message ? error.message : fallback;

  // A countdown only exists when the backend confirms a Retry-After value.
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleSendError = (error: unknown, fallback: string) => {
    if (error instanceof ApiError && error.status === 429) {
      if (error.retryAfterSeconds !== undefined) {
        setCountdown(error.retryAfterSeconds);
        setErrorMessage(`Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${error.retryAfterSeconds} giây.`);
      } else {
        setCountdown(0);
        setErrorMessage("Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
      }
      return;
    }
    setErrorMessage(getErrorMessage(error, fallback));
  };

  // Mask phone or email for Step 2 display
  const getMaskedTarget = (val: string) => {
    const clean = val.trim();
    if (clean.includes("@")) {
      const [name, domain] = clean.split("@");
      if (name.length <= 3) return `${name.slice(0, 1)}***@${domain || ""}`;
      return `${name.slice(0, 3)}***@${domain || ""}`;
    }
    const cleanedPhone = clean.replace(/\s+/g, "");
    if (cleanedPhone.length >= 7) {
      const p1 = cleanedPhone.slice(0, 4);
      const p2 = cleanedPhone.slice(4, 7);
      return `${p1} ${p2} ***`;
    }
    return clean;
  };

  const isPhoneValid = /^(03|05|07|08|09)[0-9]{8}$/.test(identifier.trim().replace(/\s+/g, ""));
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const isTargetValid = method === "phone" ? isPhoneValid : isEmailValid;

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendRequestInFlightRef.current) return;
    const cleanVal = method === "email"
      ? identifier.trim().toLowerCase()
      : identifier.trim().replace(/\s+/g, "");
    if (!cleanVal) {
      setErrorMessage(method === "phone" ? "Vui lòng nhập số điện thoại." : "Vui lòng nhập địa chỉ email.");
      return;
    }
    if (method === "phone" && !isPhoneValid) {
      setErrorMessage("Số điện thoại không đúng định dạng (10 số, đầu 03/05/07/08/09).");
      return;
    }
    if (method === "email" && !isEmailValid) {
      setErrorMessage("Địa chỉ email không hợp lệ.");
      return;
    }

    try {
      sendRequestInFlightRef.current = true;
      setLoading(true);
      setErrorMessage(null);
      await forgotPassword(cleanVal);
      setIdentifier(cleanVal);
      setSuccessMessage(genericSuccessMessage);
      setCountdown(0);
      setStep(2);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (error: unknown) {
      handleSendError(error, "Không thể gửi OTP. Vui lòng kiểm tra lại thông tin.");
    } finally {
      sendRequestInFlightRef.current = false;
      setLoading(false);
    }
  };

  // Step 2: Handle OTP box input changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6 && /^[0-9]$/.test(char)) {
          newDigits[i] = char;
        }
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    if (/^[0-9]?$/.test(value)) {
      const newDigits = [...otpDigits];
      newDigits[index] = value;
      setOtpDigits(newDigits);

      if (value && index < 5) {
        otpInputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) {
      setErrorMessage("Vui lòng nhập đủ 6 chữ số mã OTP.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await verifyOtp(identifier.trim(), otpCode, "RESET_PASSWORD");
      setStep(3);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Mã OTP không chính xác hoặc đã hết hạn."));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || sendRequestInFlightRef.current) return;
    try {
      sendRequestInFlightRef.current = true;
      setLoading(true);
      setErrorMessage(null);
      await forgotPassword(identifier.trim());
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMessage(genericSuccessMessage);
      setTimeout(() => setSuccessMessage(null), 4000);
      otpInputsRef.current[0]?.focus();
    } catch (error: unknown) {
      handleSendError(error, "Không thể gửi lại OTP.");
    } finally {
      sendRequestInFlightRef.current = false;
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setErrorMessage("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await resetPassword(identifier.trim(), newPassword);
      setStep(4);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Đã xảy ra lỗi khi đổi mật khẩu."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full flex flex-col justify-between overflow-hidden relative bg-transparent text-white font-sans selection:bg-(--accent) selection:text-(--text-on-accent)">
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-[var(--accent)]/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-[var(--accent-bright)]/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-teal-500/5 blur-[150px] pointer-events-none" />

      {/* Top Brand & Status Bar */}
      <header className="w-full px-6 sm:px-10 lg:px-14 py-3 shrink-0 flex items-center justify-between z-20">
        {/* Left Brand */}
        <Link to="/" className="shrink-0">
          <div className="flex shrink-0 items-center gap-2">
            <WavesHorizontal className="h-5 w-5 text-[var(--leaf-highlight)]" />

            <span className="text-base font-bold text-[var(--text-primary)] sm:text-lg">AquaSense</span>

            <span className="text-[8px] font-bold text-[#2dd4c3] sm:text-[9px]">IoT</span>
          </div>
        </Link>

        {/* Right Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--success)] text-xs font-semibold backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]" />
          <span className="tracking-wide text-[11px]">Hệ thống hoạt động</span>
        </div>
      </header>

      {/* Center Main Form Card (No Scroll) */}
      <main className="flex-1 flex items-center justify-center px-4 py-1 z-10 overflow-hidden">
        <div className="w-full max-w-[430px] rounded-[28px] border border-[var(--panel-border-strong)] bg-[#051c23]/92 backdrop-blur-2xl px-6 py-5 sm:px-7 sm:py-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-center transition-all my-auto">

          {/* ========================================================
              STEP 1: KHÔI PHỤC MẬT KHẨU (GỬI OTP)
             ======================================================== */}
          {step === 1 && (
            <div>
              {/* Centered Shield Icon Badge */}
              <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border-strong)] text-[var(--accent)] shadow-[0_0_15px_rgba(45,212,195,0.2)]">
                <Shield size={24} />
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-xl sm:text-2xl font-bold text-(--text-heading) tracking-tight mb-0.5">
                Khôi phục mật khẩu
              </h1>
              <p className="text-xs text-(--text-muted) mb-3 leading-tight">
                Chọn phương thức nhận mã xác thực OTP
              </p>

              {/* Method Switcher Tabs: Phone vs Email */}
              <div className="grid grid-cols-2 gap-1 p-1 mb-3 rounded-full bg-[#03151c] border border-cyan-900/50">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("phone");
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${method === "phone"
                    ? "bg-[var(--accent)] text-[var(--text-on-accent)] shadow-[0_0_12px_rgba(45,212,195,0.35)]"
                    : "text-(--text-muted) hover:text-white"
                    }`}
                >
                  <Phone size={13} />
                  <span>Số điện thoại</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod("email");
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${method === "email"
                    ? "bg-[var(--accent)] text-[var(--text-on-accent)] shadow-[0_0_12px_rgba(45,212,195,0.35)]"
                    : "text-(--text-muted) hover:text-white"
                    }`}
                >
                  <Mail size={13} />
                  <span>Email</span>
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-2.5 flex items-center gap-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-left animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSendOtp} className="space-y-2.5 text-left">
                {/* Identifier Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold tracking-wider text-(--text-body)">
                    {method === "phone" ? "Số điện thoại đã đăng ký" : "Địa chỉ Email đã đăng ký"}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                      {method === "phone" ? <Phone size={15} /> : <Mail size={15} />}
                    </div>
                    <input
                      type={method === "phone" ? "tel" : "email"}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={method === "phone" ? "Ví dụ: 0912 345 678" : "Ví dụ: nguyenvanan@gmail.com"}
                      className="w-full rounded-full border border-white bg-white py-2 pl-9 pr-9 text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent)]/50 shadow-inner"
                      autoFocus
                    />
                    {isTargetValid && (
                      <div className="absolute right-3.5 text-emerald-500 pointer-events-none">
                        <CheckCircle2 size={15} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-[var(--panel-bg)]/80 border border-[var(--panel-border)] text-[10.5px] text-(--text-muted) leading-snug">
                  <Info size={13} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <span>
                    {method === "phone"
                      ? "Nếu số điện thoại đã đăng ký, bạn có thể nhận mã OTP 6 chữ số qua SMS."
                      : "Nếu email đã đăng ký, bạn có thể nhận mã OTP 6 chữ số trong hộp thư."}
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || countdown > 0}
                  className="w-full mt-1 group relative flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-bright)] active:scale-[0.99] py-2.5 px-5 font-bold text-[var(--text-on-accent)] text-xs sm:text-sm shadow-[0_0_16px_rgba(45,212,195,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-[var(--text-on-accent)] border-t-transparent animate-spin" />
                      <span>Đang gửi mã...</span>
                    </div>
                  ) : (
                    <>
                      <span>{countdown > 0 ? `Thử lại sau ${countdown}s` : "Nhận mã OTP"}</span>
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-3 pt-0.5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Quay lại trang đăng nhập</span>
                </Link>
              </div>

              {/* Support Hotline */}
              <div className="mt-2.5 text-[10px] text-(--text-subtle)">
                Hỗ trợ kỹ thuật 24/7: <span className="font-semibold text-(--text-body)">1900 6868</span>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: XÁC THỰC MÃ OTP (VERIFY OTP)
             ======================================================== */}
          {step === 2 && (
            <div>
              {/* Centered Lock Icon Badge */}
              <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border-strong)] text-[var(--accent)] shadow-[0_0_15px_rgba(45,212,195,0.2)]">
                <Lock size={24} />
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-xl sm:text-2xl font-bold text-(--text-heading) tracking-tight mb-0.5">
                Xác thực mã OTP
              </h1>
              <p className="text-xs text-(--text-muted) mb-3 leading-tight">
                Nhập mã 6 chữ số nếu bạn nhận được tại <span className="font-semibold text-(--text-primary)">{getMaskedTarget(identifier)}</span>
              </p>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="mb-2.5 flex items-center gap-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-left animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-2.5 flex items-center gap-2 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-left animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-2.5 text-left">
                <div>
                  <label className="block text-[10.5px] font-bold tracking-wider text-(--text-body) uppercase mb-1.5">
                    MÃ OTP (6 CHỮ SỐ)
                  </label>

                  {/* 6 OTP Box Inputs */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-full h-10 rounded-xl border border-white bg-white text-gray-900 font-bold text-center text-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent)] shadow-inner"
                      />
                    ))}
                  </div>
                </div>

                {/* Countdown & Resend Row */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center gap-1 text-(--text-muted) text-[11px]">
                    <Clock size={13} className="text-[var(--accent)]" />
                    <span>{countdown > 0 ? <>Có thể gửi lại sau: <strong className="text-(--text-primary)">{countdown}s</strong></> : "Có thể yêu cầu gửi lại"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    className={`flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${countdown > 0
                      ? "text-(--text-subtle) opacity-60 cursor-not-allowed"
                      : "text-[var(--accent)] hover:text-[var(--accent-bright)]"
                      }`}
                  >
                    <RotateCw size={12} className={loading ? "animate-spin" : ""} />
                    <span>Gửi lại mã</span>
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || otpDigits.join("").length !== 6}
                  className="w-full mt-1 group relative flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-bright)] active:scale-[0.99] py-2.5 px-5 font-bold text-[var(--text-on-accent)] text-xs sm:text-sm shadow-[0_0_16px_rgba(45,212,195,0.35)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-[var(--text-on-accent)] border-t-transparent animate-spin" />
                      <span>Đang xác thực...</span>
                    </div>
                  ) : (
                    <>
                      <span>Xác thực</span>
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Step 1 or Login */}
              <div className="mt-3 pt-0.5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Quay lại</span>
                </button>
                <span className="text-(--text-subtle)">|</span>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
                >
                  Đăng nhập
                </Link>
              </div>

              {/* Support Hotline */}
              <div className="mt-2.5 pt-2 border-t border-[var(--divider)] flex items-center justify-center gap-1.5 text-[10px] text-(--text-subtle)">
                <Headphones size={12} className="text-[var(--accent)]" />
                <span>Hỗ trợ kỹ thuật: <strong className="text-(--text-body)">1900 6868</strong></span>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 3: ĐẶT LẠI MẬT KHẨU (RESET PASSWORD)
             ======================================================== */}
          {step === 3 && (
            <div>
              {/* Centered Key Icon Badge */}
              <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border-strong)] text-[var(--accent)] shadow-[0_0_15px_rgba(45,212,195,0.2)]">
                <KeyRound size={24} />
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-xl sm:text-2xl font-bold text-(--text-heading) tracking-tight mb-0.5">
                Đặt lại mật khẩu
              </h1>
              <p className="text-xs text-(--text-muted) mb-3 leading-tight">
                Tạo mật khẩu mới cho tài khoản <span className="font-semibold text-(--text-primary)">{getMaskedTarget(identifier)}</span>
              </p>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-2.5 flex items-center gap-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-left animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleResetPassword} className="space-y-2.5 text-left">
                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold tracking-wider text-(--text-body) uppercase">
                    MẬT KHẨU MỚI
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full rounded-full border border-white bg-white py-2 pl-9 pr-9 text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent)]/50 shadow-inner"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-(--text-muted) pl-2">
                    Tối thiểu 8 ký tự.
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold tracking-wider text-(--text-body) uppercase">
                    XÁC NHẬN MẬT KHẨU
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="w-full rounded-full border border-white bg-white py-2 pl-9 pr-9 text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent)]/50 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 group relative flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-bright)] active:scale-[0.99] py-2.5 px-5 font-bold text-[var(--text-on-accent)] text-xs sm:text-sm shadow-[0_0_16px_rgba(45,212,195,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-[var(--text-on-accent)] border-t-transparent animate-spin" />
                      <span>Đang cập nhật...</span>
                    </div>
                  ) : (
                    <>
                      <span>Đổi mật khẩu</span>
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-3 pt-0.5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Quay lại trang đăng nhập</span>
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 4: THÀNH CÔNG (SUCCESS)
             ======================================================== */}
          {step === 4 && (
            <div className="py-2">
              <div className="mx-auto mb-3 flex h-13 w-13 items-center justify-center rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={28} />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                Đổi mật khẩu thành công!
              </h1>
              <p className="text-xs text-(--text-muted) mb-4 leading-relaxed">
                Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại với mật khẩu mới.
              </p>
              <p className="text-[11px] text-(--text-subtle) mb-4 leading-relaxed">
                Nếu tài khoản đang bị khóa thủ công, việc đặt lại mật khẩu không tự mở khóa. Vui lòng liên hệ ADMIN/MANAGER.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full group relative flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-bright)] active:scale-[0.99] py-2.5 px-5 font-bold text-[var(--text-on-accent)] text-xs sm:text-sm shadow-[0_0_16px_rgba(45,212,195,0.35)] transition-all duration-200 cursor-pointer"
              >
                <span>Đăng nhập ngay</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer Fixed to Bottom Edge */}
      <footer className="fixed bottom-0 left-0 right-0 w-full px-6 sm:px-10 lg:px-14 py-3 z-20 border-t border-[var(--divider)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--text-muted) backdrop-blur-md bg-(--bg-primary)/40">
        <div>
          © 2026 AquaSense Smart AgriTech &nbsp;–&nbsp; Chuẩn bảo mật SSL 256-bit
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="hover:text-(--text-primary) transition-colors cursor-pointer"
          >
            Quy định bảo mật
          </a>
          <span className="text-(--text-subtle)">|</span>
          <a
            href="#support"
            onClick={(e) => e.preventDefault()}
            className="hover:text-(--text-primary) transition-colors cursor-pointer"
          >
            Hỗ trợ kỹ thuật
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;

