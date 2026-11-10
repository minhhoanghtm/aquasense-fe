import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  WavesHorizontal,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { login, loginWithOtp, sendOtp } from "../../services/authApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export const Login: React.FC = () => {
  useDocumentTitle("Đăng nhập · AquaSense IoT");

  const navigate = useNavigate();
  const [searchParams] = React.useMemo(() => [new URLSearchParams(window.location.search)], []);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get("expired") === "1" ? "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại." : null
  );
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const [loginMethod, setLoginMethod] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [otpStep, setOtpStep] = useState<"PHONE" | "OTP">("PHONE");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = otpCode.split('');
    newOtp[index] = value.slice(-1); // Take only the last typed char
    const updatedOtp = newOtp.join('');
    setOtpCode(updatedOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpCode[index] && index > 0) {
        // If current box is empty and press backspace, go to previous and clear it
        const newOtp = otpCode.split('');
        newOtp[index - 1] = '';
        setOtpCode(newOtp.join(''));
        otpInputRefs.current[index - 1]?.focus();
      } else {
        // If current box has value, just let it be cleared by onChange, or clear it here
        const newOtp = otpCode.split('');
        newOtp[index] = '';
        setOtpCode(newOtp.join(''));
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      // pad with empty string if less than 6 to replace properly
      const newOtp = (pasted + otpCode.slice(pasted.length)).slice(0, 6);
      setOtpCode(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      // Gọi API Backend để gửi OTP qua SMS Gateway
      await sendOtp(identifier);

      setOtpStep("OTP");
      setCountdown(60);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Lỗi khi gửi mã OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage("Vui lòng nhập đủ 6 số OTP.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Gọi API Backend xác thực OTP và lấy Session/Token
      await loginWithOtp(identifier, otpCode);
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Đăng nhập không thành công. Vui lòng kiểm tra lại mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loginMethod === "OTP") {
      if (otpStep === "PHONE") {
        await handleSendOtp(e);
      } else {
        await handleVerifyOtp(e);
      }
      return;
    }

    if (!identifier.trim()) {
      setErrorMessage("Vui lòng nhập Số điện thoại đăng nhập.");
      return;
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setErrorCode(null);
      if (loginMethod === "PASSWORD") {
        setCountdown(0);
      }
      await login(identifier, password);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.name === 'ApiError') {
        const { code, message, retryAfterSeconds, status } = err;
        if (status === 429) {
          setErrorCode("RATE_LIMITED");
          setCountdown(retryAfterSeconds || 30);
        }
        else if (code === 'LOGIN_TEMPORARILY_LOCKED' || (status === 401 && message?.toLowerCase().includes('tạm khóa'))) {
          setErrorCode('LOGIN_TEMPORARILY_LOCKED');
          setCountdown(retryAfterSeconds || 30);
        }
        else if (code === 'LOGIN_PERMANENTLY_LOCKED' || (status === 401 && message?.toLowerCase().includes('bị khóa'))) {
          setErrorCode('LOGIN_PERMANENTLY_LOCKED');
          setPassword("");
        }
        else if (code === 'INVALID_CREDENTIALS') {
          setErrorMessage("Số điện thoại hoặc mật khẩu không chính xác.");
        }
        else if (code === 'ACCOUNT_INACTIVE') {
          setErrorMessage("Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ quản trị viên.");
        }
        else {
          setErrorMessage(message || "Đã xảy ra lỗi. Vui lòng thử lại.");
        }
      } else {
        setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-y-auto bg-transparent text-white font-sans selection:bg-[var(--accent)] selection:text-[var(--text-on-accent)]">
      {/* Background Glow Effects using App Color Tokens */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[var(--accent)]/10 blur-[160px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--accent-bright)]/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[160px] pointer-events-none" />

      {/* Top Brand & Status Bar */}
      <header className="w-full px-6 sm:px-10 lg:px-14 py-4 flex items-center justify-between z-20 shrink-0">
        {/* Left Brand */}
        <Link to="/" className="shrink-0">
          <div className="flex shrink-0 items-center gap-2">
            <WavesHorizontal className="h-5 w-5 text-[var(--leaf-highlight)]" />

            <span className="text-base font-bold text-[var(--text-primary)] sm:text-lg">AquaSense</span>

            <span className="text-[8px] font-bold text-[#2dd4c3] sm:text-[9px]">IoT</span>
          </div>
        </Link>

        {/* Right Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--success)] text-xs font-semibold backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]" />
          <span className="tracking-wide">Hệ thống hoạt động</span>
        </div>
      </header>

      {/* Center Main Form Card */}
      <main className="flex-1 flex items-center justify-center p-4 py-8 z-10">
        <div className="w-full max-w-[400px] rounded-[32px] border border-[var(--panel-border-strong)] bg-[#051c23]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-center transition-all">

          {/* Centered Wave Icon Badge */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border-strong)] text-[var(--accent)] shadow-[0_0_20px_rgba(45,212,195,0.25)]">
            <WavesHorizontal size={28} />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-(--text-heading) tracking-tight mb-2">
            Đăng nhập hệ thống
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-(--text-muted) mb-5 leading-relaxed">
            Nhập thông tin tài khoản để truy cập trạm giám sát
          </p>

          {/* Error Message */}
          {(errorMessage || errorCode) && (
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs text-left">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                {errorCode === 'LOGIN_TEMPORARILY_LOCKED'
                  ? (countdown > 0 ? `Bạn đã nhập sai mật khẩu nhiều lần. Vui lòng thử lại sau ${countdown} giây.` : 'Bạn đã nhập sai mật khẩu nhiều lần. Vui lòng thử lại.')
                  : errorCode === 'RATE_LIMITED'
                    ? `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau${countdown > 0 ? ` ${countdown} giây.` : '.'}`
                    : errorCode === 'LOGIN_PERMANENTLY_LOCKED'
                      ? 'Tài khoản đã bị khóa đăng nhập do nhập sai mật khẩu quá nhiều lần. Vui lòng đặt lại mật khẩu để tiếp tục.'
                      : errorMessage}
              </span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex bg-[#04151c] p-1 rounded-xl mb-5 border border-[var(--panel-border-strong)] relative z-20">
            <button
              type="button"
              onClick={() => { setLoginMethod("PASSWORD"); setErrorMessage(null); setErrorCode(null); }}
              className={`flex-1 text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer ${loginMethod === "PASSWORD" ? "bg-[var(--accent)] text-[var(--text-on-accent)]" : "text-(--text-muted) hover:text-white"
                }`}
            >
              Mật khẩu
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod("OTP"); setErrorMessage(null); setErrorCode(null); }}
              className={`flex-1 text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer ${loginMethod === "OTP" ? "bg-[var(--accent)] text-[var(--text-on-accent)]" : "text-(--text-muted) hover:text-white"
                }`}
            >
              Mã OTP (SMS)
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left relative z-20">
            {/* Phone Input */}
            {(loginMethod === "PASSWORD" || (loginMethod === "OTP" && otpStep === "PHONE")) && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-[11px] font-bold tracking-wider text-(--text-body) uppercase">
                  SỐ ĐIỆN THOẠI
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-400 pointer-events-none">
                    <Phone size={18} />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full rounded-full border border-white bg-white py-3 pl-12 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent)]/50 shadow-inner"
                    autoComplete="username"
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            {loginMethod === "PASSWORD" && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold tracking-wider text-(--text-body) uppercase">
                    MẬT KHẨU
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-bright)] transition-colors cursor-pointer"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-400 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-full border border-white bg-white py-3 pl-12 pr-12 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent)]/50 shadow-inner"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP Input */}
            {loginMethod === "OTP" && otpStep === "OTP" && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold tracking-wider text-(--text-body) uppercase">
                    MÃ OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (countdown === 0) handleSendOtp();
                    }}
                    className={`text-xs font-semibold transition-colors ${countdown === 0 ? "text-[var(--accent)] hover:text-[var(--accent-bright)] cursor-pointer" : "text-gray-500 cursor-not-allowed"}`}
                  >
                    {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại OTP"}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={otpCode[index] || ""}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-white bg-white text-gray-900 outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent)]/50 shadow-inner"
                      maxLength={2}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep("PHONE");
                    setOtpCode("");
                    setErrorMessage(null);
                    setErrorCode(null);
                  }}
                  className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer mt-1"
                >
                  ← Quay lại đổi số điện thoại
                </button>
              </div>
            )}

            {/* Checkbox and Help Link */}
            <div className="flex items-center justify-between pt-1.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]/30 accent-[var(--accent)] cursor-pointer"
                />
                <span className="text-xs font-semibold text-(--text-primary)">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <a
                href="#help"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Vui lòng liên hệ bộ phận hỗ trợ kỹ thuật.");
                }}
                className="text-xs font-medium text-(--text-muted) hover:text-(--text-primary) transition-colors"
              >
                Cần trợ giúp?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (loginMethod === "PASSWORD" && countdown > 0)}
              className="w-full mt-2 group relative flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-bright)] active:scale-[0.99] py-3 px-6 font-bold text-[var(--text-on-accent)] text-sm shadow-[0_0_20px_rgba(45,212,195,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-[var(--text-on-accent)] border-t-transparent animate-spin" />
                  <span>Đang xác thực...</span>
                </div>
              ) : (
                <>
                  <span>
                    {loginMethod === "PASSWORD"
                      ? "Đăng nhập"
                      : (otpStep === "PHONE" ? "Gửi mã OTP" : "Xác nhận & Đăng nhập")
                    }
                  </span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer Fixed to Bottom Edge */}
      <footer className="absolute bottom-0 left-0 right-0 w-full px-6 sm:px-10 lg:px-14 py-3 z-20 border-t border-[var(--divider)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-(--text-muted) backdrop-blur-md bg-(--bg-primary)/40">
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

export default Login;
