import React, { useState, useEffect } from "react";
import { X, UserPlus, Phone, Contact, Mail, ArrowRight, AlertCircle } from "lucide-react";
import type { User as UserType, Role, UserStatus } from "../../../types/User";
import type { Pond } from "../../../types/Pond";

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<UserType>) => Promise<void>;
  initialData?: UserType | null;
  ponds: Pond[];
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("FARMER");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || "");
      setPhoneNumber(initialData.phoneNumber || "");
      setEmail(initialData.email || "");
      setRole((initialData.role as Role) || "FARMER");
    } else {
      setFullName("");
      setPhoneNumber("");
      setEmail("");
      setRole("FARMER");
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, "");
    if (!cleanPhone) {
      setErrorMsg("Vui lòng nhập số điện thoại nhân viên.");
      return;
    }
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(cleanPhone)) {
      setErrorMsg("Số điện thoại không đúng định dạng (10 số, đầu 03/05/07/08/09).");
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên nhân viên.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ email nhân viên.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Địa chỉ email không đúng định dạng (ví dụ: ten@gmail.com).");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit({
        fullName: fullName.trim(),
        phoneNumber: cleanPhone,
        email: email.trim(),
        role: role,
        password: initialData ? undefined : "password123",
        isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
        status: (initialData?.status as UserStatus) || "ACTIVE",
        position: role === "MANAGER" ? "Quản lý trạm" : "Kỹ thuật viên ao",
        department: "Quản lý & Nuôi trồng Thủy sản",
        assignedPondIds: initialData?.assignedPondIds || [],
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Đã xảy ra lỗi khi lưu thông tin nhân viên.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03161e]/85 animate-fadeIn">
      <div className="w-full max-w-[500px] rounded-[24px] border border-[#134958] bg-[#07242e] shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-left flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-cyan-900/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#092d37] border border-[#144b58] text-[#1AD1B9] shadow-[0_0_15px_rgba(26,209,185,0.2)] shrink-0">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                {isEditing ? "Chỉnh sửa thông tin nhân viên" : "Thêm nhân viên mới"}
              </h3>
              <p className="text-xs text-(--text-muted) leading-tight mt-0.5">
                Nhập thông tin nhân sự để khởi tạo tài khoản hệ thống.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Field 1: Số điện thoại */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-white">
                Số điện thoại <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-(--text-muted)">Bắt buộc</span>
            </div>
            <p className="text-[11px] text-(--text-muted)">
              Dùng để đăng nhập và nhận cảnh báo SMS/Zalo
            </p>
            <div className="flex items-center gap-2.5 mt-1 rounded-xl border border-cyan-800/80 bg-[#04151c] px-3.5 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-[#1AD1B9] focus-within:ring-1 focus-within:ring-[#1AD1B9]/40 shadow-sm">
              <Phone size={16} className="text-emerald-400 shrink-0" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ví dụ: 0912 345 678"
                className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Field 2: Họ và tên */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-white">
                Họ và tên <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-(--text-muted)">Bắt buộc</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1 rounded-xl border border-cyan-800/80 bg-[#04151c] px-3.5 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-[#1AD1B9] focus-within:ring-1 focus-within:ring-[#1AD1B9]/40 shadow-sm">
              <Contact size={16} className="text-[#1AD1B9] shrink-0" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none"
                required
              />
            </div>
          </div>

          {/* Field 3: Email */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-white">
                Email liên hệ <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-(--text-muted)">Bắt buộc</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1 rounded-xl border border-cyan-800/80 bg-[#04151c] px-3.5 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-[#1AD1B9] focus-within:ring-1 focus-within:ring-[#1AD1B9]/40 shadow-sm">
              <Mail size={16} className="text-cyan-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: nguyenvanan@gmail.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-cyan-900/40 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer px-3.5 py-2"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-[#1AD1B9] hover:bg-[#17c2ab] active:scale-[0.99] py-2.5 px-6 font-bold text-[#03151b] text-xs sm:text-sm shadow-[0_0_18px_rgba(26,209,185,0.3)] transition cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <span>{isEditing ? "Cập nhật nhân viên" : "Thêm nhân viên"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;
