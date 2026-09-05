import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  WavesHorizontal,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Droplets,
  Thermometer,
} from "lucide-react";
import { login } from "../../services/authApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export const Login: React.FC = () => {
  useDocumentTitle("Đăng nhập · AquaSense IoT");

  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage("Vui lòng nhập Email hoặc Số điện thoại.");
      return;
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await login(identifier, password);
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(err?.message || "Đăng nhập không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full flex items-center justify-center p-3 sm:p-5 lg:p-6 relative overflow-hidden bg-(--bg-primary)">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-900/5 blur-[160px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl rounded-3xl border border-(--panel-border) bg-[#061d24]/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 z-10 max-h-[calc(100vh-24px)] my-auto">
        
        {/* Left Form Section (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col justify-between text-left overflow-y-auto custom-scrollbar">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 text-(--text-on-accent) shadow-[0_0_16px_rgba(45,212,195,0.4)]">
                <WavesHorizontal className="h-5 w-5 text-[#041d24]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                  AquaSense
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-500/30 tracking-wider uppercase">
                  IoT Farm
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-3.5">
              <h1 className="text-xl sm:text-2xl font-bold text-(--text-heading) m-0 tracking-tight leading-snug">
                Chào mừng trở lại 👋
              </h1>
              <p className="text-xs text-(--text-muted) mt-1 leading-relaxed">
                Đăng nhập vào hệ thống giám sát và quản lý vuông nuôi tôm thông minh
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-3 flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Identifier Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-(--text-body)">
                  Email hoặc Số điện thoại
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-(--text-muted) pointer-events-none">
                    <Mail size={15} />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="farmer@example.com hoặc 0900000001"
                    className="w-full rounded-xl border border-(--panel-border) bg-(--panel-bg-dark) py-2.5 pl-9 pr-3.5 text-xs sm:text-sm text-white placeholder:text-(--text-subtle) outline-none transition-all duration-200 focus:border-cyan-400 focus:bg-[#06242e] focus:shadow-[0_0_12px_rgba(45,212,195,0.2)]"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-(--text-body)">
                    Mật khẩu
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Vui lòng liên hệ quản trị viên hoặc sử dụng tài khoản mẫu để đăng nhập.");
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-(--text-muted) pointer-events-none">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-(--panel-border) bg-(--panel-bg-dark) py-2.5 pl-9 pr-10 text-xs sm:text-sm text-white placeholder:text-(--text-subtle) outline-none transition-all duration-200 focus:border-cyan-400 focus:bg-[#06242e] focus:shadow-[0_0_12px_rgba(45,212,195,0.2)]"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-(--text-muted) hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded-md border-(--panel-border) bg-(--panel-bg-dark) text-cyan-500 focus:ring-cyan-500/30 accent-cyan-500 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs text-(--text-muted) cursor-pointer select-none"
                >
                  Ghi nhớ phiên đăng nhập này
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1.5 group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-400 py-2.5 px-5 font-semibold text-[#041d24] text-xs sm:text-sm shadow-[0_0_18px_rgba(45,212,195,0.35)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(45,212,195,0.55)] hover:scale-[1.008] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-[#041d24] border-t-transparent animate-spin" />
                    <span>Đang xác thực...</span>
                  </div>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Footer note */}
          <div className="mt-4 flex items-center justify-between text-[10px] text-(--text-muted)">
            <span>© 2026 AquaSense Smart Shrimp Farm</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck size={12} />
              <span>Bảo mật 256-bit</span>
            </span>
          </div>
        </div>

        {/* Right Feature Showcase Side (5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0a303b] to-[#041920] p-6 lg:p-7 border-l border-(--panel-border) flex-col justify-between relative overflow-hidden text-left">
          {/* Subtle decoration lines */}
          <div className="absolute -right-20 -top-20 w-52 h-52 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

          {/* Top badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              <Sparkles size={11} className="animate-pulse" />
              <span>Nền tảng IoT & AI</span>
            </span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Hệ thống Hoạt động</span>
            </div>
          </div>

          {/* Mid visual: Live mini dashboard telemetry preview */}
          <div className="my-3 space-y-2.5">
            <div className="rounded-2xl border border-(--panel-border) bg-[#061e27]/80 p-3.5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity size={13} className="text-cyan-400" />
                  <span>Vuông Tôm Thẻ 01 · Trực tiếp</span>
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
                  ONLINE
                </span>
              </div>

              {/* 3 mini stats */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="p-2 rounded-xl bg-[#04151c] border border-cyan-950">
                  <div className="flex items-center gap-1 text-[9px] text-(--text-muted) mb-0.5">
                    <Droplets size={10} className="text-cyan-400" />
                    <span>DO</span>
                  </div>
                  <p className="text-xs font-bold font-mono text-cyan-300">5.8 <span className="text-[8px] font-normal text-(--text-muted)">mg/L</span></p>
                </div>

                <div className="p-2 rounded-xl bg-[#04151c] border border-cyan-950">
                  <div className="flex items-center gap-1 text-[9px] text-(--text-muted) mb-0.5">
                    <Thermometer size={10} className="text-amber-400" />
                    <span>Nhiệt độ</span>
                  </div>
                  <p className="text-xs font-bold font-mono text-amber-300">28.5 <span className="text-[8px] font-normal text-(--text-muted)">°C</span></p>
                </div>

                <div className="p-2 rounded-xl bg-[#04151c] border border-cyan-950">
                  <div className="flex items-center gap-1 text-[9px] text-(--text-muted) mb-0.5">
                    <Cpu size={10} className="text-teal-400" />
                    <span>pH</span>
                  </div>
                  <p className="text-xs font-bold font-mono text-teal-300">7.8</p>
                </div>
              </div>
            </div>

            {/* Feature Checkpoints */}
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2 text-xs text-(--text-body)">
                <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                <span>Giám sát 6 thông số nước tự động 24/7 qua cảm biến IoT</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-(--text-body)">
                <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                <span>AI dự báo rủi ro môi trường nước và khuyến nghị tự động</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-(--text-body)">
                <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                <span>Cảnh báo tức thì đa ngưỡng giúp phòng ngừa dịch bệnh</span>
              </div>
            </div>
          </div>

          {/* Bottom quote */}
          <div className="p-3 rounded-2xl bg-[#03151c]/60 border border-cyan-900/30">
            <p className="text-[11px] text-cyan-200/90 italic leading-relaxed">
              "Giải pháp tự động hóa thông minh giúp nâng cao sản lượng nuôi tôm và tối ưu chi phí vận hành."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
