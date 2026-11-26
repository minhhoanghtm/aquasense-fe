import React, { useState } from "react";
import {
  Waves,
  Building2,
  PhoneCall,
  Mail,
  RefreshCw,
  LogOut,
  User as UserIcon,
  Clock,
  ShieldAlert,
  Info,
  X,
  Sparkles,
} from "lucide-react";
import { logout } from "../services/authApi";
import { useNavigate } from "react-router-dom";
import { useModalZIndex } from "../utils/modalStack";

export interface UnassignedNoticeModalProps {
  isOpen: boolean;
  role?: string;
  fullName?: string;
  onRefresh?: () => Promise<boolean>;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const UnassignedNoticeModal: React.FC<UnassignedNoticeModalProps> = ({
  isOpen,
  role = "FARMER",
  fullName,
  onRefresh,
  onClose,
  canDismiss = false,
}) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "info" | "warning" | "success";
  } | null>(null);

  const zIndex = useModalZIndex(isOpen, 100);

  if (!isOpen) return null;

  const isManager = role?.toUpperCase() === "MANAGER";

  const handleRefresh = async () => {
    if (!onRefresh || isChecking) return;
    try {
      setIsChecking(true);
      setFeedback(null);
      const isAssignedNow = await onRefresh();
      if (!isAssignedNow) {
        setFeedback({
          text: "Chưa ghi nhận phân công mới. Cấp trên chưa cập nhật hoặc đang xử lý.",
          type: "warning",
        });
        setTimeout(() => setFeedback(null), 4500);
      }
    } catch {
      setFeedback({
        text: "Không thể kiểm tra vào lúc này. Vui lòng thử lại sau.",
        type: "warning",
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setFeedback({
        text: error instanceof Error ? error.message : "Không thể đăng xuất. Vui lòng thử lại.",
        type: "warning",
      });
    }
  };

  const handleGoToProfile = () => {
    if (onClose) onClose();
    navigate("/profile");
  };

  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center p-4 bg-[#03161e]/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--panel-border-strong)] bg-[var(--panel-bg-dark)]/95 p-6 sm:p-7 shadow-2xl text-left flex flex-col gap-5 relative overflow-hidden backdrop-blur-xl">
        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon + Role Pill + Optional Close Button */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg ${
                isManager
                  ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                  : "bg-teal-500/15 border-teal-500/30 text-teal-400"
              }`}
            >
              {isManager ? (
                <Building2 className="w-6 h-6 animate-pulse" />
              ) : (
                <Waves className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${
                  isManager
                    ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                    : "bg-teal-500/10 text-teal-300 border-teal-500/30"
                }`}
              >
                <Sparkles size={11} />
                {isManager ? "Vai trò: Quản lý trạm" : "Vai trò: Kỹ thuật viên / Nông dân"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-heading)] tracking-tight leading-snug mt-1">
                {isManager ? "Chưa được phân công trạm nuôi" : "Chưa được phân công vuông nuôi"}
              </h3>
            </div>
          </div>

          {canDismiss && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Đóng tạm thời"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Explanation message */}
        <div className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed relative z-10">
          {fullName && (
            <span className="font-semibold text-[var(--text-body)]">
              Xin chào {fullName},{" "}
            </span>
          )}
          {isManager
            ? "Tài khoản quản lý của bạn hiện chưa được liên kết với trạm nuôi hoặc trang trại nào trong hệ thống. Vui lòng liên hệ Quản trị viên (Admin) để được bàn giao cơ sở nuôi và phân quyền quản lý."
            : "Tài khoản của bạn hiện chưa được phân công phụ trách bất kỳ vuông nuôi nào. Để bắt đầu theo dõi chất lượng nước và nhận cảnh báo, vui lòng liên hệ Ban quản trị hoặc Quản lý trạm để được cấp quyền theo dõi ao nuôi."}
        </div>

        {/* Contact Information Card */}
        <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/80 p-4 space-y-3 relative z-10">
          <div className="flex items-center justify-between border-b border-[var(--divider)] pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <ShieldAlert size={13} className="text-amber-400" />
              Thông tin liên hệ cấp trên & hỗ trợ
            </span>
            <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <Clock size={12} className="text-teal-400" />
              24/7
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
            {/* Person in charge */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <UserIcon size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[var(--text-muted)]">Cấp quản lý</div>
                <div className="font-medium text-[var(--text-body)] truncate">
                  {isManager ? "Ban Quản trị Hệ thống (Admin)" : "Ban Quản lý & Điều hành"}
                </div>
              </div>
            </div>

            {/* Hotline */}
            <a
              href="tel:0900000000"
              className="flex items-center justify-between p-2 rounded-xl bg-teal-500/[0.06] hover:bg-teal-500/[0.12] border border-teal-500/20 text-teal-300 transition group"
              title="Bấm để gọi hotline hỗ trợ"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                  <PhoneCall size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-[var(--text-muted)]">Hotline hỗ trợ</div>
                  <div className="font-bold text-teal-200 truncate">0900.000.000</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-teal-500/20 text-teal-200 group-hover:bg-teal-500/30 transition shrink-0">
                Gọi ngay
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:support@aquasense.vn?subject=Yêu%20cầu%20phân%20công%20ao%20nuôi&body=Xin%20chào%20Ban%20Quản%20trị,%20tài%20khoản%20của%20tôi%20chưa%20được%20phân%20công%20ao%20nuôi.%20Vui%20lòng%20hỗ%20trợ%20phân%20công."
              className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/[0.06] hover:bg-cyan-500/[0.12] border border-cyan-500/20 text-cyan-300 transition group sm:col-span-2"
              title="Gửi email cho bộ phận hỗ trợ"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                  <Mail size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-[var(--text-muted)]">Email hỗ trợ kỹ thuật</div>
                  <div className="font-semibold text-cyan-200 truncate">support@aquasense.vn</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-200 group-hover:bg-cyan-500/30 transition shrink-0">
                Gửi email
              </span>
            </a>
          </div>

          <div className="flex items-start gap-2 pt-1 text-[11px] text-[var(--text-muted)] leading-relaxed">
            <Info size={13} className="text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Sau khi cấp trên hoàn tất phân công trên hệ thống, bạn chỉ cần bấm nút{" "}
              <strong className="text-[var(--text-body)]">Kiểm tra lại</strong> bên dưới để truy cập
              dữ liệu ngay mà không cần đăng nhập lại.
            </span>
          </div>
        </div>

        {/* Feedback alert (if refresh checked) */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn relative z-10 ${
              feedback.type === "warning"
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-200"
                : "bg-teal-500/15 border border-teal-500/30 text-teal-200"
            }`}
          >
            <Info size={14} className="shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-3 border-t border-[var(--divider)] flex flex-wrap items-center justify-between gap-3 relative z-10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoToProfile}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--text-body)] hover:text-white hover:bg-[var(--panel-highlight)] transition cursor-pointer"
            >
              <UserIcon size={14} />
              Xem hồ sơ
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isChecking}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 transition shadow-lg shadow-teal-900/30 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={14} className={isChecking ? "animate-spin" : ""} />
              {isChecking ? "Đang kiểm tra..." : "Kiểm tra lại"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnassignedNoticeModal;
