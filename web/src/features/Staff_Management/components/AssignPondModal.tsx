import React, { useState, useEffect } from "react";
import { X, Layers, Check, Save } from "lucide-react";
import type { User } from "../../../types/User";
import type { Pond } from "../../../types/Pond";

interface AssignPondModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: User | null;
  ponds: Pond[];
  onSave: (staffId: string, pondIds: string[]) => Promise<void>;
}

export const AssignPondModal: React.FC<AssignPondModalProps> = ({
  isOpen,
  onClose,
  staff,
  ponds,
  onSave,
}) => {
  const [selectedPondIds, setSelectedPondIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setSelectedPondIds(staff.assignedPondIds || []);
    }
  }, [staff, isOpen]);

  if (!isOpen || !staff) return null;

  const togglePond = (id: string) => {
    setSelectedPondIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPondIds.length === ponds.length) {
      setSelectedPondIds([]);
    } else {
      setSelectedPondIds(ponds.map((p) => p.pondId || p.id));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(staff.userId || staff.id, selectedPondIds);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03161e]/85 animate-fadeIn">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[#07242e]/98 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(45,212,195,0.15)] text-left flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[#051c24]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-[var(--accent)] border border-cyan-500/30">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-heading)]">
                Phân công vuông nuôi
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Nhân sự: <span className="text-[var(--accent)] font-semibold">{staff.fullName}</span>
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
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-body)] font-medium">
              Chọn danh sách các vuông nuôi phụ trách:
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[var(--accent)] hover:underline cursor-pointer"
            >
              {selectedPondIds.length === ponds.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {ponds.map((pond) => {
              const pondKey = pond.pondId || pond.id;
              const isSelected =
                selectedPondIds.includes(pondKey) ||
                selectedPondIds.includes(pond.id);
              return (
                <div
                  key={pondKey}
                  onClick={() => togglePond(pondKey)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? "bg-cyan-950/80 border-[var(--accent)] text-white shadow-sm"
                      : "bg-[#051c24] border-cyan-900/40 text-[var(--text-muted)] hover:border-cyan-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-bold ${
                        isSelected
                          ? "bg-[var(--accent)] text-[#062621] border-[var(--accent)]"
                          : "border-cyan-800 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">
                        {pond.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-subtle)]">
                        {pond.location} · {pond.density || "Mật độ chuẩn"}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      pond.status === "NORMAL"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : pond.status === "WARNING"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {pond.status === "NORMAL" ? "Ổn định" : pond.status === "WARNING" ? "Cảnh báo" : "Nguy hiểm"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--divider)] bg-[#051c24] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#2dd4c3] to-[#159d96] text-[#041920] text-xs font-bold hover:brightness-110 shadow-lg shadow-[#2dd4c3]/20 transition cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? "Đang lưu..." : "Lưu phân công"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignPondModal;
