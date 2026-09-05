import { useState, type FormEvent } from "react";
import {
  KeyRound,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Check,
  Lock,
  ShieldAlert,
  Info,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import type { User as UserType } from "../../types/User";
import { changePassword } from "../../services/authApi";

interface SecurityTabProps {
  user: UserType | null;
}

export default function SecurityTab({ user }: SecurityTabProps) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password criteria check
  const hasMinLength = passwordData.newPassword.length >= 6;
  const hasNumber = /\d/.test(passwordData.newPassword);
  const isMatching =
    passwordData.newPassword &&
    passwordData.confirmPassword &&
    passwordData.newPassword === passwordData.confirmPassword;

  // Password strength score (0 to 3)
  const strengthScore = [
    hasMinLength,
    hasNumber,
    passwordData.newPassword.length >= 8,
  ].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!passwordData.newPassword) return { text: "Chưa nhập", color: "text-[var(--text-subtle)]", width: "0%" };
    if (strengthScore === 1) return { text: "Yếu", color: "text-[var(--critical)]", width: "33%" };
    if (strengthScore === 2) return { text: "Trung bình", color: "text-[var(--warning)]", width: "66%" };
    return { text: "Mạnh", color: "text-[var(--success)]", width: "100%" };
  };

  const strength = getStrengthLabel();

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập để đổi mật khẩu." });
      return;
    }

    if (!passwordData.currentPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại." });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới và xác nhận mật khẩu không khớp." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await changePassword(user.id, passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Đổi mật khẩu (Grid 2 cột cân đối) */}
      <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 sm:p-7 backdrop-blur-xl shadow-lg">
        {/* Header */}
        <div className="flex flex-col gap-1 pb-5 border-b border-[var(--divider)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
              <KeyRound size={18} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-heading)]">Đổi mật khẩu</h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] pl-10.5">
            Cập nhật mật khẩu định kỳ để bảo vệ tài khoản quản trị hệ thống nuôi trồng AquaSense
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mt-5 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm transition-all animate-in fade-in slide-in-from-top-2 ${message.type === "success"
                ? "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]/30"
                : "bg-[var(--critical-bg)] text-[var(--critical)] border border-[var(--critical)]/30"
              }`}
          >
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Cột trái: Form nhập mật khẩu (7 cột) */}
          <form onSubmit={handlePasswordSubmit} className="lg:col-span-7 space-y-4.5">
            {/* Mật khẩu hiện tại */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock size={13} className="text-[var(--accent)]" />
                  Mật khẩu hiện tại <span className="text-[var(--critical)]">*</span>
                </span>
              </label>
              <div className="relative group">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="Nhập mật khẩu đang sử dụng"
                  required
                  className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 pr-11 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 group-hover:border-[var(--panel-border-strong)]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-subtle)] hover:text-[var(--accent)] transition cursor-pointer"
                  title={showCurrent ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound size={13} className="text-[var(--accent)]" />
                  Mật khẩu mới <span className="text-[var(--critical)]">*</span>
                </span>
                {passwordData.newPassword && (
                  <span className={`text-[11px] font-medium ${strength.color}`}>
                    Độ mạnh: {strength.text}
                  </span>
                )}
              </label>
              <div className="relative group">
                <input
                  type={showNew ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  required
                  className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 pr-11 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 group-hover:border-[var(--panel-border-strong)]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-subtle)] hover:text-[var(--accent)] transition cursor-pointer"
                  title={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength Bar */}
              {passwordData.newPassword && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80 mt-1">
                  <div
                    className={`h-full transition-all duration-300 ${strengthScore === 1
                        ? "bg-[var(--critical)]"
                        : strengthScore === 2
                          ? "bg-[var(--warning)]"
                          : "bg-[var(--success)]"
                      }`}
                    style={{ width: strength.width }}
                  ></div>
                </div>
              )}
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-[var(--accent)]" />
                  Xác nhận mật khẩu mới <span className="text-[var(--critical)]">*</span>
                </span>
                {passwordData.confirmPassword && (
                  <span
                    className={`text-[11px] flex items-center gap-1 ${isMatching ? "text-[var(--success)]" : "text-[var(--critical)]"
                      }`}
                  >
                    {isMatching ? <Check size={11} /> : <AlertCircle size={11} />}
                    {isMatching ? "Trùng khớp" : "Chưa khớp"}
                  </span>
                )}
              </label>
              <div className="relative group">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  className={`w-full rounded-xl border bg-[var(--panel-bg)] px-3.5 pr-11 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:ring-2 group-hover:border-[var(--panel-border-strong)] ${passwordData.confirmPassword
                      ? isMatching
                        ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                        : "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-[var(--panel-border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-subtle)] hover:text-[var(--accent)] transition cursor-pointer"
                  title={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] text-[var(--text-on-accent)] px-6 py-2.5 text-sm font-bold shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:brightness-105 active:scale-[0.98] transition duration-200 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Cập nhật mật khẩu</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                }
                disabled={isSaving || (!passwordData.currentPassword && !passwordData.newPassword)}
                className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-2.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--panel-highlight)] transition disabled:opacity-30 cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </form>

          {/* Cột phải: Tiêu chuẩn an toàn & Hướng dẫn (5 cột) */}
          <div className="lg:col-span-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4.5 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-bright)] uppercase tracking-wider">
              <Info size={14} />
              <span>Tiêu chuẩn bảo mật mật khẩu</span>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Để bảo vệ dữ liệu đo đạc và quyền điều khiển các thiết bị IoT tại vuông tôm, mật khẩu mới cần đáp ứng:
            </p>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                {hasMinLength ? (
                  <CheckCircle size={15} className="text-[var(--success)] shrink-0" />
                ) : (
                  <XCircle size={15} className="text-slate-500 shrink-0" />
                )}
                <span className={hasMinLength ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
                  Độ dài tối thiểu 6 ký tự (khuyến nghị từ 8 ký tự)
                </span>
              </li>

              <li className="flex items-center gap-2">
                {hasNumber ? (
                  <CheckCircle size={15} className="text-[var(--success)] shrink-0" />
                ) : (
                  <XCircle size={15} className="text-slate-500 shrink-0" />
                )}
                <span className={hasNumber ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
                  Bao gồm ít nhất một chữ số (0-9)
                </span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle size={15} className="text-[var(--accent)] shrink-0" />
                <span className="text-[var(--text-muted)]">
                  Không dùng ngày sinh hoặc số điện thoại làm mật khẩu
                </span>
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle size={15} className="text-[var(--accent)] shrink-0" />
                <span className="text-[var(--text-muted)]">
                  Nên thay đổi mật khẩu định kỳ mỗi 90 ngày
                </span>
              </li>
            </ul>

            <div className="pt-3 border-t border-[var(--divider)] flex items-center gap-2 text-[11px] text-[var(--text-subtle)]">
              <Shield size={13} className="text-emerald-400 shrink-0" />
              <span>Mật khẩu được mã hóa an toàn theo tiêu chuẩn SHA-256.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Xác thực 2 yếu tố (2FA) */}
      <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 sm:p-6 backdrop-blur-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--divider)]">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <Shield size={18} />
              </div>
              Xác thực 2 yếu tố (2FA)
            </h3>
            <p className="text-xs text-[var(--text-muted)] pl-10.5">
              Tăng cường bảo vệ tài khoản bằng mã xác thực gửi qua SMS
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIs2FAEnabled(!is2FAEnabled)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${is2FAEnabled ? "bg-[var(--accent)]" : "bg-slate-700"
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${is2FAEnabled ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-body)]">
          <span className="text-[var(--text-muted)]">Trạng thái bảo mật 2 lớp:</span>
          <span
            className={`font-semibold px-2.5 py-0.5 rounded-full text-xs border ${is2FAEnabled
                ? "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/30"
                : "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/30"
              }`}
          >
            {is2FAEnabled ? "Đang kích hoạt (An toàn)" : "Chưa kích hoạt"}
          </span>
        </div>
      </div>

      {/* 3. Thiết bị & Phiên đăng nhập */}
      <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 sm:p-6 backdrop-blur-xl shadow-md">
        <div className="pb-4 border-b border-[var(--divider)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
              <Laptop size={18} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-heading)]">Phiên đăng nhập & Thiết bị</h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] pl-10.5 mt-0.5">
            Các thiết bị đã đăng nhập vào hệ thống giám sát vuông tôm AquaSense
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {/* Phiên hiện tại */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
                <Laptop size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Windows PC · Google Chrome
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)] border border-[var(--success)]/30">
                    <Check size={10} /> Phiên hiện tại
                  </span>
                </div>
                <p className="text-xs text-[var(--text-subtle)] mt-0.5">
                  IP: 113.161.xx.xx · TP. Cà Mau, Việt Nam
                </p>
              </div>
            </div>
            <span className="text-xs text-[var(--success)] font-medium">Hoạt động ngay bây giờ</span>
          </div>

          {/* Thiết bị di động */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] gap-3 opacity-80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  iPhone 15 Pro · Safari Mobile
                </p>
                <p className="text-xs text-[var(--text-subtle)] mt-0.5">
                  IP: 14.232.xx.xx · TP. Cà Mau, Việt Nam
                </p>
              </div>
            </div>
            <span className="text-xs text-[var(--text-muted)]">2 giờ trước</span>
          </div>
        </div>
      </div>
    </div>
  );
}
