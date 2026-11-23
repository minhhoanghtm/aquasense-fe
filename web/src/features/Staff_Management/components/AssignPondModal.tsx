import React, { useState, useEffect } from "react";
import { X, Layers, Check, Save, UserMinus, Plus, RotateCcw, Search } from "lucide-react";
import type { User } from "../../../types/User";
import type { Pond } from "../../../types/Pond";
import { matchVietnamese } from "../../../utils/textUtils";
import { useModalZIndex } from "../../../utils/modalStack";

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
  const [initialPondIds, setInitialPondIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (staff) {
      const staffId = staff.userId || staff.id;
      const assigned = ponds
        .filter(
          (pond) =>
            pond.userId === staffId ||
            pond.farmerAssignments?.some((a) => a.farmerId === staffId)
        )
        .map((pond) => pond.pondId || pond.id || "")
        .filter(Boolean);
      setSelectedPondIds(assigned);
      setInitialPondIds(assigned);
      setSearchQuery("");
    }
  }, [staff, isOpen, ponds]);

  const zIndex = useModalZIndex(isOpen, 100);

  if (!isOpen || !staff) return null;

  const togglePond = (id: string) => {
    setSelectedPondIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPondIds(ponds.map((p) => p.pondId || p.id || "").filter(Boolean));
  };

  const handleDeselectAll = () => {
    setSelectedPondIds([]);
  };

  const handleReset = () => {
    setSelectedPondIds(initialPondIds);
  };

  const unassignedCount = initialPondIds.filter((id) => !selectedPondIds.includes(id)).length;
  const addedCount = selectedPondIds.filter((id) => !initialPondIds.includes(id)).length;

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg("");
      const staffId = staff.userId || staff.id;
      if (!staffId) throw new Error("Không xác định được nhân viên.");
      await onSave(staffId, selectedPondIds);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể cập nhật phân công ao nuôi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center p-4 bg-[#03161e]/85 animate-fadeIn">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[#07242e]/98 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(45,212,195,0.15)] text-left flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[#051c24]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-[var(--accent)] border border-cyan-500/30">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-heading)]">
                Phân công & Bỏ gán vuông nuôi
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
          {errorMsg && (
            <p className="text-xs text-rose-300 font-semibold p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40">
              {errorMsg}
            </p>
          )}

          {/* Quick Actions & Counter */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-body)]">
              <span className="font-medium">
                Đã gán: <strong className="text-[var(--accent)] font-semibold">{selectedPondIds.length}</strong> / {ponds.length} ao
              </span>
              {unassignedCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium">
                  Bỏ gán: {unassignedCount}
                </span>
              )}
              {addedCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
                  Gán thêm: {addedCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[var(--accent)] hover:underline cursor-pointer font-medium"
              >
                Chọn tất cả
              </button>
              <span className="text-gray-600">·</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-medium"
              >
                Bỏ chọn tất cả
              </button>
              {unassignedCount > 0 || addedCount > 0 ? (
                <>
                  <span className="text-gray-600">·</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Khôi phục trạng thái ban đầu"
                    className="text-[var(--text-muted)] hover:text-white hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    <span>Đặt lại</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* Search box */}
          <div className="flex items-center gap-2 rounded-xl border border-cyan-800 bg-[#07252f] px-3 py-2 transition-all hover:border-cyan-600 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40">
            <Search size={14} className="shrink-0 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc vị trí ao..."
              className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none placeholder:text-[var(--text-muted)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[var(--text-muted)] hover:text-white cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Pond List */}
          <div className="grid grid-cols-1 gap-2.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {(() => {
              const q = searchQuery.trim().toLowerCase();
              const sorted = [...ponds].sort((a, b) => {
                const aKey = a.pondId || a.id || "";
                const bKey = b.pondId || b.id || "";
                const aAssigned = initialPondIds.includes(aKey) ? 0 : 1;
                const bAssigned = initialPondIds.includes(bKey) ? 0 : 1;
                return aAssigned - bAssigned;
              });
              const filtered = q
                ? sorted.filter(
                    (p) =>
                      matchVietnamese(p.name || p.pondName, q) ||
                      matchVietnamese(p.location, q)
                  )
                : sorted;
              if (filtered.length === 0) {
                return (
                  <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                    Không tìm thấy ao nào phù hợp với &ldquo;<span className="text-[var(--accent)]">{searchQuery}</span>&rdquo;
                  </div>
                );
              }
              return filtered.map((pond) => {
                const pondKey = pond.pondId || pond.id || "";
                const isSelected = selectedPondIds.includes(pondKey);
                const wasInitiallyAssigned = initialPondIds.includes(pondKey);

                return (
                <div
                  key={pondKey}
                  onClick={() => togglePond(pondKey)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer select-none ${
                    isSelected
                      ? "bg-cyan-950/70 border-[var(--accent)]/80 text-white shadow-sm"
                      : wasInitiallyAssigned
                      ? "bg-rose-950/20 border-rose-900/40 text-[var(--text-muted)] hover:border-rose-700"
                      : "bg-[#051c24] border-cyan-900/40 text-[var(--text-muted)] hover:border-cyan-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition ${
                        isSelected
                          ? "bg-[var(--accent)] text-[#062621] border-[var(--accent)]"
                          : wasInitiallyAssigned
                          ? "border-rose-800 bg-rose-950/30 text-rose-400"
                          : "border-cyan-800 bg-transparent"
                      }`}
                    >
                      {isSelected ? <Check size={14} /> : wasInitiallyAssigned ? <X size={12} /> : null}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <span>{pond.name || pond.pondName}</span>
                        {wasInitiallyAssigned && !isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-normal">
                            Đang bỏ gán
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-subtle)]">
                        {pond.location || "Vị trí chưa cập nhật"} · {pond.density || "Mật độ chưa cập nhật"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        pond.status === "ACTIVE"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : pond.status === "HARVESTED"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                      }`}
                    >
                      {pond.status === "ACTIVE" ? "Đang nuôi" : pond.status === "HARVESTED" ? "Đã thu hoạch" : "Ao trống"}
                    </span>

                    {/* Quick Button inside item */}
                    {isSelected ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePond(pondKey);
                        }}
                        title="Bỏ gán ao này"
                        className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition cursor-pointer"
                      >
                        <UserMinus size={12} />
                        <span>Bỏ gán</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePond(pondKey);
                        }}
                        title="Gán ao này"
                        className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-500/30 text-cyan-300 transition cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Gán ao</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            });
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--divider)] bg-[#051c24] flex items-center justify-between">
          <span className="text-xs text-[var(--text-subtle)]">
            {unassignedCount > 0 ? (
              <span className="text-rose-300 font-medium">Sẽ thu hồi {unassignedCount} ao nuôi</span>
            ) : addedCount > 0 ? (
              <span className="text-emerald-300 font-medium">Sẽ gán mới {addedCount} ao nuôi</span>
            ) : (
              <span>Chưa có thay đổi</span>
            )}
          </span>

          <div className="flex items-center gap-3">
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
              <span>
                {saving
                  ? "Đang lưu..."
                  : unassignedCount > 0 && selectedPondIds.length === 0
                  ? "Lưu (Bỏ gán tất cả)"
                  : unassignedCount > 0
                  ? `Lưu phân công (Bỏ gán ${unassignedCount} ao)`
                  : "Lưu phân công"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPondModal;
