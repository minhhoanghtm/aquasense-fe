import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
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
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "Khu vực Cà Mau · Đồng bằng sông Cửu Long",
    department: user?.department || "Bộ phận Quản lý & Nuôi trồng Thủy sản AquaSense",
    bio: user?.bio || "Phụ trách theo dõi chất lượng nước, giám sát hệ thống cảm biến IoT và quy trình cấp khí ao tôm công nghệ cao.",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "Khu vực Cà Mau · Đồng bằng sông Cửu Long",
        department: user.department || "Bộ phận Quản lý & Nuôi trồng Thủy sản AquaSense",
        bio: user.bio || "Phụ trách theo dõi chất lượng nước, giám sát hệ thống cảm biến IoT và quy trình cấp khí ao tôm công nghệ cao.",
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "Khu vực Cà Mau · Đồng bằng sông Cửu Long",
        department: user.department || "Bộ phận Quản lý & Nuôi trồng Thủy sản AquaSense",
        bio: user.bio || "Phụ trách theo dõi chất lượng nước, giám sát hệ thống cảm biến IoT và quy trình cấp khí ao tôm công nghệ cao.",
      });
      setMessage(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setMessage({ type: "error", text: "Vui lòng đăng nhập để cập nhật thông tin." });
      return;
    }

    if (!formData.fullName.trim()) {
      setMessage({ type: "error", text: "Họ và tên không được để trống." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const updated = await updateProfile(user.id, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        department: formData.department.trim(),
        bio: formData.bio.trim(),
      });

      onUserUpdated(updated);
      setMessage({ type: "success", text: "Cập nhật hồ sơ cá nhân thành công!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const roleLabel =
    user?.role === "ADMIN"
      ? "Quản trị viên"
      : user?.role === "TECHNICIAN"
      ? "Kỹ thuật viên"
      : "Chủ vuông / Nông dân";

  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 sm:p-7 backdrop-blur-xl shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[var(--divider)] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-heading)]">Thông tin cá nhân</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Quản lý thông tin định danh và thông tin liên lạc của bạn trên AquaSense
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
          className={`mt-5 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            message.type === "success"
              ? "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]/30"
              : "bg-[var(--critical-bg)] text-[var(--critical)] border border-[var(--critical)]/30"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Section 1: Thông tin cơ bản */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-3 flex items-center gap-1.5">
            <Sparkles size={13} />
            Thông tin định danh & Liên lạc
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Họ và tên */}
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

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center gap-1.5">
                <Mail size={13} className="text-[var(--accent)]" />
                Địa chỉ Email <span className="text-[var(--critical)]">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                required
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-[var(--panel-border-strong)]"
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center gap-1.5">
                <Phone size={13} className="text-[var(--accent)]" />
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="0901234567"
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-[var(--panel-border-strong)]"
              />
            </div>

            {/* Địa chỉ / Khu vực */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center gap-1.5">
                <MapPin size={13} className="text-[var(--accent)]" />
                Địa chỉ / Khu vực quản lý
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Tỉnh/Thành phố, Khu vực nuôi"
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-[var(--panel-border-strong)]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Đơn vị & Giới thiệu */}
        <div className="pt-2 border-t border-[var(--divider)]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-3 flex items-center gap-1.5">
            <Building size={13} />
            Đơn vị công tác & Mô tả
          </h4>

          <div className="space-y-4">
            {/* Đơn vị / Cơ sở */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center gap-1.5">
                <Building size={13} className="text-[var(--accent)]" />
                Cơ sở / Trang trại nuôi trồng
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Tên trang trại / Cơ quan phụ trách"
                className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-[var(--panel-border-strong)]"
              />
            </div>

            {/* Giới thiệu / Ghi chú */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-body)] flex items-center gap-1.5">
                <FileText size={13} className="text-[var(--accent)]" />
                Mô tả công việc & Kinh nghiệm nuôi trồng
              </label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Mô tả tóm tắt kinh nghiệm hoặc ghi chú quản lý..."
                className="w-full resize-none rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-[var(--panel-border-strong)]"
              />
            </div>
          </div>
        </div>

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
