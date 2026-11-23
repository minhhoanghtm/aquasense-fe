import React, { useState, useMemo } from "react";
import { X, Layers, Search, Droplet, ArrowUpRight } from "lucide-react";
import type { User } from "../../../types/User";
import type { Pond } from "../../../types/Pond";
import { useModalZIndex } from "../../../utils/modalStack";

interface StaffAssignedPondsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: User;
  assignedPonds: Pond[];
  onAssignPond?: () => void;
}

export const StaffAssignedPondsModal: React.FC<StaffAssignedPondsModalProps> = ({
  isOpen,
  onClose,
  staff,
  assignedPonds,
  onAssignPond,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPonds = useMemo(() => {
    if (!searchTerm.trim()) return assignedPonds;
    const term = searchTerm.toLowerCase().trim();
    return assignedPonds.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.pondName && p.pondName.toLowerCase().includes(term)) ||
        (p.id && p.id.toLowerCase().includes(term)) ||
        (p.pondId && p.pondId.toLowerCase().includes(term))
    );
  }, [assignedPonds, searchTerm]);

  const zIndex = useModalZIndex(isOpen, 100);

  if (!isOpen) return null;

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return {
          label: "Đang nuôi",
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          dot: "bg-emerald-400",
        };
      case "HARVESTED":
        return {
          label: "Đã thu hoạch",
          color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
          dot: "bg-cyan-400",
        };
      case "EMPTY":
      default:
        return {
          label: "Ao trống",
          color: "bg-gray-500/15 text-gray-300 border-gray-500/30",
          dot: "bg-gray-400",
        };
    }
  };

  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center p-4 bg-[#03161e]/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[#07242e] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(45,212,195,0.15)] text-left flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[#051c24]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300 border border-teal-500/30">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)] leading-snug">
                Vuông nuôi phụ trách
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Nhân viên:{" "}
                <span className="text-white font-semibold">
                  {staff.fullName}
                </span>{" "}
                · Tổng số:{" "}
                <span className="text-teal-300 font-bold">
                  {assignedPonds.length}
                </span>{" "}
                vuông nuôi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Đóng modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search bar inside modal */}
        {assignedPonds.length > 6 && (
          <div className="px-6 pt-3 pb-2 border-b border-[var(--divider)]/50 bg-[#062029]">
            <div className="relative flex items-center rounded-xl bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] px-3 py-1.5 focus-within:border-teal-400">
              <Search
                size={14}
                className="text-[var(--text-muted)] shrink-0 mr-2"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm nhanh theo tên vuông nuôi..."
                className="w-full bg-transparent text-xs text-white placeholder-[var(--text-muted)] focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-[var(--text-muted)] hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pond List Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
          {filteredPonds.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              {searchTerm
                ? "Không tìm thấy vuông nuôi nào phù hợp với từ khóa."
                : "Chưa có vuông nuôi nào được phân công."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredPonds.map((pond) => {
                const statusBadge = getStatusBadge(pond.status);
                const pondName = pond.name || pond.pondName || `Vuông ${pond.id || pond.pondId}`;
                const area =
                  pond.areaM2 !== undefined
                    ? `${pond.areaM2.toLocaleString()} m²`
                    : pond.area !== undefined
                    ? `${pond.area} ha`
                    : "Chưa cập nhật DT";

                return (
                  <div
                    key={pond.id || pond.pondId}
                    className="p-3.5 rounded-2xl bg-[#051c24] border border-cyan-900/40 hover:border-teal-500/50 transition-all duration-200 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Droplet
                          size={14}
                          className="text-teal-400 shrink-0 mt-0.5"
                        />
                        <span className="font-bold text-xs sm:text-sm text-[var(--text-heading)] truncate">
                          {pondName}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${statusBadge.color}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`}
                        />
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-[var(--text-muted)] pt-1 border-t border-cyan-950/60">
                      <div>
                        <span>Diện tích: </span>
                        <strong className="text-white font-medium">{area}</strong>
                      </div>
                      <div>
                        <span>Độ sâu: </span>
                        <strong className="text-white font-medium">
                          {pond.depthM !== undefined && pond.depthM !== null
                            ? `${parseFloat(Number(pond.depthM).toFixed(2))} m`
                            : "—"}
                        </strong>
                      </div>
                      {pond.shrimpDensity && (
                        <div className="col-span-2">
                          <span>Mật độ: </span>
                          <strong className="text-white font-medium">
                            {pond.shrimpDensity} con/m²
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--divider)] px-6 py-3.5 bg-[#051c24] flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-muted)]">
            Hiển thị{" "}
            <strong className="text-white font-semibold">
              {filteredPonds.length}
            </strong>{" "}
            / {assignedPonds.length} vuông nuôi
          </div>

          <div className="flex items-center gap-2">
            {onAssignPond && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAssignPond();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 hover:bg-teal-500/25 text-xs font-semibold transition cursor-pointer"
              >
                <ArrowUpRight size={13} />
                <span>Thay đổi phân công</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] text-xs text-[var(--text-muted)] hover:text-white hover:border-[var(--panel-border-strong)] transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAssignedPondsModal;
