import React, { useState, useEffect } from "react";
import { X, Droplets, Layers, Ruler, Users } from "lucide-react";
import type { Pond, PondStatus } from "../../../types/Pond";
import type { CreatePondPayload } from "../../../services/pondApi";

interface PondFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePondPayload) => Promise<void>;
  initialData?: Pond | null;
}

export const PondFormModal: React.FC<PondFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [pondName, setPondName] = useState("");
  const [areaM2, setAreaM2] = useState<number | "">("");
  const [depthM, setDepthM] = useState<number | "">("");
  const [shrimpDensity, setShrimpDensity] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [status, setStatus] = useState<PondStatus | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setPondName(initialData.pondName || initialData.name || "");
      setAreaM2(initialData.areaM2 ?? (initialData.area !== undefined ? initialData.area * 10000 : ""));
      setDepthM(initialData.depthM ?? "");
      setShrimpDensity(
        typeof initialData.shrimpDensity === "number"
          ? initialData.shrimpDensity
          : Number(initialData.density?.replace(/[^0-9]/g, "")) || ""
      );
      setStatus(initialData.status === "ACTIVE" || initialData.status === "HARVESTED" || initialData.status === "EMPTY" ? initialData.status : "");
      setLocation(initialData.location ?? "");
      setCapacity(initialData.capacity ?? "");
    } else {
      setPondName("");
      setAreaM2("");
      setDepthM("");
      setShrimpDensity("");
      setStatus("");
      setLocation("");
      setCapacity("");
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pondName.trim().length < 2 || pondName.trim().length > 100) {
      setErrorMsg("Vui lòng nhập tên vuông nuôi.");
      return;
    }
    if (!areaM2 || Number(areaM2) <= 0) {
      setErrorMsg("Diện tích vuông nuôi phải lớn hơn 0 m².");
      return;
    }
    if (!depthM || Number(depthM) <= 0) {
      setErrorMsg("Độ sâu mực nước phải lớn hơn 0 m.");
      return;
    }
    if (!shrimpDensity || !Number.isInteger(Number(shrimpDensity)) || Number(shrimpDensity) <= 0) {
      setErrorMsg("Mật độ tôm phải lớn hơn 0 con/m².");
      return;
    }
    if (capacity !== "" && (!Number.isInteger(Number(capacity)) || Number(capacity) < 0)) {
      setErrorMsg("Sức chứa phải là số nguyên không âm.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit({
        pondName: pondName.trim(),
        areaM2: Number(areaM2),
        depthM: Number(depthM),
        shrimpDensity: Number(shrimpDensity),
        ...(location.trim() ? { location: location.trim() } : {}),
        ...(capacity !== "" ? { capacity: Number(capacity) } : {}),
        ...(status ? { status } : {}),
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu thông tin ao nuôi.");
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
              <Droplets size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                {isEditing ? "Chỉnh sửa vuông nuôi" : "Thêm vuông nuôi mới"}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {isEditing ? `Cập nhật thông số vuông ${initialData?.name}` : "Đăng ký vuông nuôi tôm công nghệ cao vào hệ thống giám sát"}
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

          {/* Pond Name */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
              Tên vuông nuôi <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
              <Droplets size={15} className="text-cyan-400 shrink-0" />
              <input
                type="text"
                value={pondName}
                onChange={(e) => setPondName(e.target.value)}
                placeholder="Nhập tên vuông nuôi"
                className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none placeholder:text-[var(--text-muted)]"
                required
              />
            </div>
          </div>

          {/* Area & Depth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
                Diện tích mặt nước (m²) <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                <Layers size={15} className="text-amber-400 shrink-0" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={areaM2}
                  onChange={(e) => setAreaM2(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Nhập diện tích"
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none"
                  required
                />
                <span className="text-[11px] text-[var(--text-muted)] font-mono">m²</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
                Độ sâu mực nước (m) <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                <Ruler size={15} className="text-teal-400 shrink-0" />
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={depthM}
                  onChange={(e) => setDepthM(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Nhập độ sâu"
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none"
                  required
                />
                <span className="text-[11px] text-[var(--text-muted)] font-mono">m</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-[var(--text-body)]">Vị trí
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5 w-full rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 text-xs text-[var(--text-primary)]" />
            </label>
            <label className="text-xs font-semibold text-[var(--text-body)]">Sức chứa (m³)
              <input type="number" min="0" step="1" value={capacity} onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 text-xs text-[var(--text-primary)]" />
            </label>
          </div>

          {/* Shrimp Density & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
                Mật độ thả giống (con/m²) <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                <Users size={15} className="text-purple-400 shrink-0" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={shrimpDensity}
                  onChange={(e) => setShrimpDensity(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Nhập mật độ"
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none"
                  required
                />
                <span className="text-[11px] text-[var(--text-muted)] font-mono">PL/m²</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
                Trạng thái hoạt động
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-800/80 bg-[#051c24] px-3 py-2.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PondStatus | "")}
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none cursor-pointer"
                >
                  <option value="" className="bg-[#07242e]">Chọn trạng thái</option>
                  <option value="ACTIVE" className="bg-[#07242e]">Đang nuôi</option>
                  <option value="HARVESTED" className="bg-[#07242e]">Đã thu hoạch</option>
                  <option value="EMPTY" className="bg-[#07242e]">Ao trống</option>
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
              {submitting ? "Đang lưu..." : isEditing ? "Cập nhật vuông" : "Tạo vuông nuôi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PondFormModal;
