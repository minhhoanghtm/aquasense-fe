import React, { useState, useEffect } from "react";
import { X, Cpu, Radio, Layers, Wifi, Activity } from "lucide-react";
import type { Devices } from "../../types/Devices";
import type { Pond } from "../../types/Pond";

interface DeviceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    deviceName: string;
    macAddress: string;
    pondId: string;
    firmwareVersion?: string;
    status?: string;
  }) => Promise<void>;
  initialData?: Devices | null;
  ponds: Pond[];
}

export const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  ponds,
}) => {
  const [deviceName, setDeviceName] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [pondId, setPondId] = useState("");
  const [firmwareVersion, setFirmwareVersion] = useState("v1.2.0");
  const [status, setStatus] = useState("ONLINE");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setDeviceName(initialData.deviceName || initialData.name || "");
      setMacAddress(initialData.macAddress || "");
      setPondId(initialData.pondId || (ponds.length > 0 ? ponds[0].id : ""));
      setFirmwareVersion(initialData.firmwareVersion || "v1.2.0");
      setStatus(initialData.status || "ONLINE");
    } else {
      setDeviceName("");
      setMacAddress("");
      setPondId(ponds.length > 0 ? (ponds[0].pondId || ponds[0].id) : "");
      setFirmwareVersion("v1.2.0");
      setStatus("ONLINE");
    }
    setErrorMsg("");
  }, [initialData, isOpen, ponds]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) {
      setErrorMsg("Vui lòng nhập tên thiết bị.");
      return;
    }
    if (!macAddress.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ MAC của thiết bị.");
      return;
    }
    if (!pondId) {
      setErrorMsg("Vui lòng chọn vuông nuôi để gán thiết bị.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit({
        deviceName: deviceName.trim(),
        macAddress: macAddress.trim(),
        pondId,
        firmwareVersion: firmwareVersion.trim() || "v1.2.0",
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi lưu thông tin thiết bị.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03161e]/85 animate-fadeIn">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[#07242e]/98 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(45,212,195,0.15)] text-left flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[#051c24]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-[var(--accent)] border border-cyan-500/30">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                {isEditing ? "Chỉnh sửa thiết bị cảm biến" : "Đăng ký thiết bị mới"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {isEditing
                  ? `Cập nhật thông tin node ${initialData?.deviceName || initialData?.name}`
                  : "Thêm gateway hoặc trạm đo cảm biến IoT vào hệ thống"}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Row 1: Device Name & MAC Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
                Tên thiết bị <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                <Radio size={15} className="text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Ví dụ: Trạm đo pH & DO Vuông 01"
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none placeholder:text-[var(--text-muted)]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
                Địa chỉ MAC <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                <Wifi size={15} className="text-teal-400 shrink-0" />
                <input
                  type="text"
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value)}
                  placeholder="24:6F:28:AB:CD:EF"
                  className="w-full font-mono bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none placeholder:text-[var(--text-muted)]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 2: Assigned Pond */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
              Vuông nuôi gắn kết <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
              <Layers size={15} className="text-amber-400 shrink-0" />
              <select
                value={pondId}
                onChange={(e) => setPondId(e.target.value)}
                className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none cursor-pointer"
                required
              >
                {ponds.map((p) => {
                  const pId = p.pondId || p.id;
                  return (
                    <option key={pId} value={pId} className="bg-[#07242e]">
                      {p.name || p.pondName} ({p.areaM2 ? `${p.areaM2.toLocaleString()} m²` : `${p.area || 0.5} ha`})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Row 3: Firmware & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
                Phiên bản Firmware
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                <Cpu size={15} className="text-purple-400 shrink-0" />
                <input
                  type="text"
                  value={firmwareVersion}
                  onChange={(e) => setFirmwareVersion(e.target.value)}
                  placeholder="v1.2.0"
                  className="w-full font-mono bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
                Trạng thái hoạt động
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                <Activity size={15} className="text-emerald-400 shrink-0" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none cursor-pointer"
                >
                  <option value="ONLINE" className="bg-[#07242e]">Trực tuyến</option>
                  <option value="OFFLINE" className="bg-[#07242e]">Ngoại tuyến</option>
                  <option value="MAINTENANCE" className="bg-[#07242e]">Bảo trì</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[var(--divider)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#2dd4c3] to-[#159d96] text-[#041920] text-xs sm:text-sm font-bold hover:brightness-110 shadow-lg shadow-[#2dd4c3]/20 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : isEditing ? "Cập nhật thiết bị" : "Đăng ký thiết bị"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceFormModal;
