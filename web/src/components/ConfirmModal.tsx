import React from "react";
import { AlertTriangle, CheckCircle2, Trash2, X, Info } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "warning",
  loading = false,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-400" />,
          iconBg: "bg-rose-500/15 border-rose-500/30",
          btnColor: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
          iconBg: "bg-emerald-500/15 border-emerald-500/30",
          btnColor: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30",
        };
      case "info":
        return {
          icon: <Info className="w-6 h-6 text-cyan-400" />,
          iconBg: "bg-cyan-500/15 border-cyan-500/30",
          btnColor: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/30",
        };
      case "warning":
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          iconBg: "bg-amber-500/15 border-amber-500/30",
          btnColor: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30",
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03161e]/85 animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl border border-[#134958] bg-[#07242e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-left flex flex-col gap-4 relative overflow-hidden">
        {/* Header Icon + Close */}
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${style.iconBg} shadow-md`}>
            {style.icon}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 -mr-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
            {title}
          </h3>
          <div className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
            {description}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-cyan-900/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition cursor-pointer disabled:opacity-60 flex items-center gap-2 ${style.btnColor}`}
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
