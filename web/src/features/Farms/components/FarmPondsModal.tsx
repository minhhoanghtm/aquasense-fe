import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  Waves,
  Maximize2,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Farm } from "../../../types/Farm";
import type { Pond } from "../../../types/Pond";
import { getFarmPonds } from "../../../services/farmApi";
import { formatVietnamDate } from "../../../utils/date";
import { useModalZIndex } from "../../../utils/modalStack";

interface FarmPondsModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: Farm | null;
}

export const FarmPondsModal: React.FC<FarmPondsModalProps> = ({
  isOpen,
  onClose,
  farm,
}) => {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPonds = useCallback(async () => {
    if (!farm) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getFarmPonds(farm.farmId);
      setPonds(data);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách vuông nuôi của trại này.");
    } finally {
      setLoading(false);
    }
  }, [farm]);

  useEffect(() => {
    if (isOpen && farm) {
      fetchPonds();
    } else {
      setPonds([]);
      setError(null);
    }
  }, [isOpen, farm, fetchPonds]);

  const zIndex = useModalZIndex(isOpen, 100);

  if (!isOpen || !farm) return null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Đang nuôi
          </span>
        );
      case "HARVESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Đã thu hoạch
          </span>
        );
      case "EMPTY":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-500/10 border border-gray-500/20 text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            Ao trống
          </span>
        );
    }
  };

  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center p-4 bg-[#03161e]/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[#07242e]/98 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(45,212,195,0.15)] text-left flex flex-col max-h-[88vh]">
        {/* Header - Edge-to-edge */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[#051c24]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <Waves size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                Danh sách vuông nuôi trực thuộc
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Trang trại: <strong className="text-teal-300 font-semibold">{farm.farmName}</strong>
                {farm.address ? ` · ${farm.address}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchPonds}
              disabled={loading}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Tải lại danh sách"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content body - distinct scroll container with inner padding */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14 text-[var(--text-muted)] gap-3">
              <Loader2 size={28} className="animate-spin text-teal-400" />
              <span className="text-xs">Đang tải danh sách vuông nuôi của trại...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5 my-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : ponds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[var(--text-muted)] mb-3">
                <Waves size={26} />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-heading)]">
                Chưa có vuông nuôi nào
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1 leading-relaxed">
                Trại nuôi này hiện chưa có vuông nuôi nào trực thuộc. Bạn có thể tạo vuông nuôi mới và gán vào trại này tại trang Quản lý vuông nuôi.
              </p>
              <Link
                to="/monitoring"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 text-xs font-semibold transition"
              >
                <span>Đến Quản lý vuông nuôi</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-0.5">
                <span>
                  Tổng cộng: <strong className="text-white font-semibold">{ponds.length}</strong> vuông nuôi
                </span>
                <Link
                  to="/monitoring"
                  className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-medium"
                >
                  <span>Mở bảng giám sát vuông nuôi</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {ponds.map((pond) => {
                  const rawArea = pond.areaM2 ?? (pond.area ? pond.area * 10000 : 0);
                  const formattedArea =
                    rawArea >= 10000
                      ? `${(rawArea / 10000).toFixed(2)} ha`
                      : `${Math.round(rawArea).toLocaleString("vi-VN")} m²`;

                  const rawDepth = pond.depthM ?? (pond as any).depth;
                  const formattedDepth =
                    rawDepth !== undefined && rawDepth !== null && !isNaN(Number(rawDepth))
                      ? `${parseFloat(Number(rawDepth).toFixed(2))} m`
                      : "—";

                  const density = pond.shrimpDensity ?? (pond as any).density;
                  const formattedDensity =
                    density !== undefined && density !== null
                      ? `${density} con/m²`
                      : "—";

                  return (
                    <div
                      key={pond.pondId || pond.id}
                      className="p-4 rounded-2xl border border-cyan-900/70 bg-[#051d27] hover:border-cyan-500/50 transition flex flex-col justify-between gap-3 text-left shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h4 className="text-sm font-bold text-[var(--text-heading)] line-clamp-1">
                            {pond.pondName || pond.name}
                          </h4>
                          {getStatusBadge(pond.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-body)]">
                          <div className="flex items-center gap-1.5">
                            <Maximize2 size={13} className="text-[var(--text-subtle)] shrink-0" />
                            <span>{formattedArea}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[var(--text-subtle)]">Sâu:</span>
                            <span className="font-medium text-[var(--text-primary)]">
                              {formattedDepth}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[var(--text-subtle)]">Mật độ:</span>
                            <span className="font-medium text-[var(--text-primary)]">
                              {formattedDensity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[11px]">
                            <Calendar size={12} className="text-[var(--text-subtle)] shrink-0" />
                            <span>{formatVietnamDate(pond.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {pond.location && (
                        <div className="text-[11px] text-[var(--text-muted)] border-t border-cyan-900/40 pt-2 truncate">
                          Vị trí: {pond.location}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Edge-to-edge */}
        <div className="border-t border-[var(--divider)] px-6 py-3.5 bg-[#051c24] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/20 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
