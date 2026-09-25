import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import {
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Lock,
} from "lucide-react";
import type { User as UserType } from "../../types/User";
import { updateProfile } from "../../services/authApi";

interface PersonalInfoTabProps {
  user: UserType | null;
  onUserUpdated: (updatedUser: UserType) => void;
}

export default function PersonalInfoTab({ user, onUserUpdated }: PersonalInfoTabProps) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    role: user?.role || "FARMER",
    fcmToken: user?.fcmToken || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "FARMER",
        fcmToken: user.fcmToken || "",
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "FARMER",
        fcmToken: user.fcmToken || "",
      });
      setMessage(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const currentUserId = user?.userId || user?.id;
    if (!currentUserId) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập để cập nhật thông tin." });
      return;
    }

    if (!formData.fullName.trim()) {
      setMessage({ type: "error", text: "Họ và tên không được để trống." });
      return;
    }

    if (formData.phoneNumber.trim()) {
      const phoneClean = formData.phoneNumber.trim();
      const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
      if (!phoneRegex.test(phoneClean)) {
        setMessage({
          type: "error",
          text: "Số điện thoại không hợp lệ (gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).",
        });
        return;
      }
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const updated = await updateProfile(currentUserId, {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        fcmToken: formData.fcmToken.trim(),
      });

      onUserUpdated(updated);
      setMessage({ type: "success", text: "Cập nhật thông tin tài khoản thành công!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Không thể cập nhật thông tin. Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const roleLabel =
    formData.role === "MANAGER" || formData.role === "ADMIN"
      ? "Quản lý"
      : "Nông dân";

  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 sm:p-7 backdrop-blur-xl shadow-lg text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[var(--divider)] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-heading)]">Thông tin tài khoản</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Quản lý thông tin họ tên và số điện thoại liên hệ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)] bg-[var(--panel-bg)] px-3.5 py-1.5 rounded-xl border border-[var(--panel-border)] self-start sm:self-auto">
          <ShieldCheck size={14} className="text-[var(--accent)]" />
          <span>Vai trò:</span>
          <span className="font-bold text-[var(--accent-bright)]">{roleLabel}</span>
        </div>
      </div>

      {/* Alert Notification */}
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Section: Thông tin cá nhân */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-3.5 flex items-center gap-1.5">
            <Sparkles size={13} />
            Thông tin người dùng
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* 1. Họ và tên */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center gap-1.5">
                <User size={13} className="text-[var(--accent)]" />
                Họ và tên <span className="text-[var(--critical)]">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên đầy đủ"
                required
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-[var(--panel-border-strong)]"
              />
            </div>

            {/* 2. Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center gap-1.5">
                <Phone size={13} className="text-[var(--accent)]" />
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Ví dụ: 0912345678"
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-[var(--panel-border-strong)]"
              />
            </div>

            {/* 3. Vai trò (Cố định, không được thay đổi quyền) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[var(--accent)]" />
                  Vai trò
                </span>
                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                  <Lock size={10} /> Không thể thay đổi
                </span>
              </label>
              <div className="flex items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--bg-primary)]/50 px-3.5 py-2.5">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {roleLabel}
                </span>
                <span className="text-xs font-medium text-[var(--accent-bright)]">
                  Cố định
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 
        {/* ========================================================= */}
        {/* THÔNG BÁO ĐẨY THIẾT BỊ DI ĐỘNG (FCM TOKEN) - TẠM THỜI ẨN   */}
        {/* ========================================================= */}
        {/* 
        <div className="pt-2 border-t border-[var(--divider)]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-3 flex items-center gap-1.5">
            <BellRing size={13} />
            Thông báo đẩy thiết bị di động
          </h4>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-body)]">
              Mã nhận cảnh báo tức thì
            </label>
            <input
              type="text"
              name="fcmToken"
              value={formData.fcmToken}
              onChange={handleChange}
              placeholder="fcm_token_device_abc123xyz..."
              className="w-full font-mono text-xs rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none"
            />
          </div>
        </div>
        */}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[var(--divider)]">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-body)] hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)] transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw size={14} />
            Khôi phục
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] text-[var(--text-on-accent)] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:brightness-105 active:scale-[0.98] transition duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--text-on-accent)] border-t-transparent"></span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
