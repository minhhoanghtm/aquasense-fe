import React from "react";
import { CheckCircle2, X } from "lucide-react";

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Thành công!",
  message,
  confirmText = "Đóng",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#03161e]/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl border border-emerald-500/40 bg-[#07242e] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.2)] text-center flex flex-col items-center gap-4 relative animate-scaleUp">
        {/* Close button top right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Success Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>

        {/* Text */}
        <div className="space-y-1.5 px-2">
          <h3 className="text-lg font-bold text-[var(--text-heading)]">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Button */}
        <div className="w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-[#041920] font-bold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;

