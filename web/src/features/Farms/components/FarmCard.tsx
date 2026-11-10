import React from "react";
import {
  Building2,
  MapPin,
  Maximize2,
  Waves,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";
import type { Farm } from "../../../types/Farm";
import type { User } from "../../../types/User";
import { formatVietnamDate } from "../../../utils/date";
import { getFarmAssignmentSummary } from "../../../utils/assignmentUtils";

interface FarmCardProps {
  farm: Farm;
  onViewPonds: (farm: Farm) => void;
  onEdit?: (farm: Farm) => void;
  onDelete?: (farm: Farm) => void;
  onAssignManager?: (farm: Farm) => void;
  canAssignManager?: boolean;
  showAssignmentInfo?: boolean;
  staffList?: User[];
}

export const FarmCard: React.FC<FarmCardProps> = ({
  farm,
  onViewPonds,
  onEdit,
  onDelete,
  onAssignManager,
  canAssignManager = false,
  showAssignmentInfo = false,
  staffList = [],
}) => {
  const pondCount = farm.ponds?.length ?? farm.pondCount ?? 0;
  const areaVal = Number(farm.totalArea);
  const formattedArea =
    !isNaN(areaVal) && areaVal > 0
      ? areaVal >= 10000
        ? `${(areaVal / 10000).toFixed(2)} ha (${areaVal.toLocaleString("vi-VN")} m²)`
        : `${areaVal.toLocaleString("vi-VN")} m²`
      : "Chưa cập nhật";

  const summary = showAssignmentInfo
    ? getFarmAssignmentSummary(farm, staffList)
    : null;

  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 flex flex-col justify-between shadow-lg hover:border-teal-500/40 transition-all duration-200 group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 text-teal-300 shadow-sm">
              <Building2 size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)] group-hover:text-teal-300 transition-colors line-clamp-1">
                {farm.farmName}
              </h3>

              {/* Hiển thị trạng thái phân công Quản lý của Trại cho Admin / Manager */}
              {showAssignmentInfo && summary && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {summary.isManagerAssigned && summary.managerName ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      <UserCheck size={11} className="text-purple-400 shrink-0" />
                      <span>
                        Đã phân công: <strong>{summary.managerName}</strong>
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] bg-slate-800/60 border border-slate-700 text-slate-400">
                      <UserX size={11} className="shrink-0" />
                      <span>Chưa phân công Quản lý</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Badge số lượng ao */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 shrink-0">
            <Waves size={13} />
            <span>{pondCount} vuông</span>
          </span>
        </div>

        {/* Info Grid */}
        <div className="space-y-2.5 py-3 border-y border-[var(--divider)] my-3 text-xs sm:text-sm">
          {/* Địa chỉ */}
          <div className="flex items-start gap-2.5 text-[var(--text-body)]">
            <MapPin size={16} className="text-[var(--text-subtle)] shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {farm.address || (
                <span className="italic text-[var(--text-muted)]">
                  Chưa thiết lập địa chỉ
                </span>
              )}
            </span>
          </div>

          {/* Diện tích */}
          <div className="flex items-center gap-2.5 text-[var(--text-body)]">
            <Maximize2 size={16} className="text-[var(--text-subtle)] shrink-0" />
            <span>
              Tổng diện tích:{" "}
              <strong className="text-[var(--text-primary)] font-semibold">
                {formattedArea}
              </strong>
            </span>
          </div>

          {/* Ngày tạo */}
          <div className="flex items-center gap-2.5 text-[var(--text-muted)] text-xs">
            <Calendar size={14} className="text-[var(--text-subtle)] shrink-0" />
            <span>Ngày đăng ký: {formatVietnamDate(farm.createdAt)}</span>
          </div>
        </div>

        {/* Ponds preview */}
        {farm.ponds && farm.ponds.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider mb-2">
              Vuông nuôi trực thuộc:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {farm.ponds.slice(0, 3).map((p) => (
                <span
                  key={p.pondId || p.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] text-[var(--text-primary)] font-medium"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-400"
                        : p.status === "HARVESTED"
                        ? "bg-amber-400"
                        : "bg-gray-400"
                    }`}
                  />
                  <span>{p.pondName || p.name}</span>
                </span>
              ))}
              {farm.ponds.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-white/5 text-[var(--text-muted)] font-medium">
                  +{farm.ponds.length - 3} ao khác
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[var(--divider)] flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onViewPonds(farm)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/25 text-xs font-semibold transition cursor-pointer"
          >
            <Eye size={14} />
            <span>Chi tiết vuông ({pondCount})</span>
          </button>

          {/* Nút Phân công Quản lý ngay tại Trại (Chỉ dành cho Admin) */}
          {canAssignManager && onAssignManager && (
            <button
              type="button"
              onClick={() => onAssignManager(farm)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition cursor-pointer"
              title="Phân công Quản lý (Manager) phụ trách trại nuôi này"
            >
              <ShieldCheck size={14} />
              <span>Phân công Quản lý</span>
            </button>
          )}

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(farm)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Chỉnh sửa trại nuôi"
              >
                <Edit2 size={15} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(farm)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Xóa trại nuôi"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
