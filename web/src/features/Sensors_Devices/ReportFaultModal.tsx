import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Send } from "lucide-react";
import type { Devices as DeviceType } from "../../types/Devices";

interface ReportFaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: DeviceType | null;
  onSubmit: (deviceId: string, reason: string) => Promise<void>;
}

export const ReportFaultModal: React.FC<ReportFaultModalProps> = ({
  isOpen,
  onClose,
  device,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const deviceId = device.deviceId || device.id || "";
  const deviceName = device.name || device.deviceName || "Thiết bị";
  const deviceCode = device.macAddress || device.node_code || device.serialNumber || deviceId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) {
      setErrorMsg("Không xác định được ID thiết bị.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit(deviceId, reason.trim());
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Không thể gửi báo cáo sự cố thiết bị."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03161e]/85 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-[#07242e]/98 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(244,63,94,0.15)] text-left flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[#051c24]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-heading)]">
                Báo cáo thiết bị hỏng
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Gửi thông báo sự cố & chuyển sang Bảo trì
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <p className="text-xs text-rose-300 font-semibold p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40">
              {errorMsg}
            </p>
          )}

          {/* Device Info Summary */}
          <div className="p-3.5 rounded-2xl bg-[#041920] border border-[var(--panel-border)] space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium">
              Thiết bị gặp sự cố:
            </div>
            <div className="text-sm font-bold text-white flex items-center justify-between">
              <span>{deviceName}</span>
              <span className="text-xs font-mono text-cyan-400 font-normal">
                {deviceCode}
              </span>
            </div>
          </div>

          {/* Incident Reason / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Mô tả sự cố / hư hỏng (tùy chọn)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Cảm biến pH hiển thị giá trị bất thường, mất kết nối liên tục, hỏng đầu dò, hoặc chập nguồn..."
              rows={4}
              maxLength={500}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#03151d] border border-[var(--panel-border)] text-xs text-white placeholder-[var(--text-subtle)] focus:border-rose-400 focus:outline-none transition resize-none custom-scrollbar"
            />
            <div className="flex justify-between text-[11px] text-[var(--text-subtle)]">
              <span>Hệ thống sẽ cập nhật trạng thái thiết bị sang Bảo trì và gửi cảnh báo.</span>
              <span>{reason.length}/500</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] text-xs font-semibold text-[var(--text-muted)] hover:text-white hover:border-[var(--panel-border-strong)] transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/40 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Đang gửi...</span>
              ) : (
                <>
                  <Send size={13} />
                  <span>Xác nhận báo hỏng</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFaultModal;
