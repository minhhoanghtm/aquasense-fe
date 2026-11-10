import React from "react";
import {
  Building2,
  MapPin,
  Waves,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";
import type { Farm } from "../../../types/Farm";
import type { User } from "../../../types/User";
import { formatVietnamDate } from "../../../utils/date";
import { getFarmAssignmentSummary } from "../../../utils/assignmentUtils";

interface FarmTableProps {
  farms: Farm[];
  onViewPonds: (farm: Farm) => void;
  onEdit?: (farm: Farm) => void;
  onDelete?: (farm: Farm) => void;
  onAssignManager?: (farm: Farm) => void;
  canAssignManager?: boolean;
  showAssignmentInfo?: boolean;
  staffList?: User[];
}

export const FarmTable: React.FC<FarmTableProps> = ({
  farms,
  onViewPonds,
  onEdit,
  onDelete,
  onAssignManager,
  canAssignManager = false,
  showAssignmentInfo = false,
  staffList = [],
}) => {
  const formatArea = (totalArea: string | number | null) => {
    const val = Number(totalArea);
    if (isNaN(val) || val <= 0) return "Chưa cập nhật";
    if (val >= 10000) {
      return `${(val / 10000).toFixed(2)} ha (${val.toLocaleString("vi-VN")} m²)`;
    }
    return `${val.toLocaleString("vi-VN")} m²`;
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] overflow-hidden shadow-lg">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--divider)] bg-[var(--panel-bg-dark)]/80 text-[var(--text-muted)] uppercase text-[11px] tracking-wider font-semibold">
              <th className="py-3.5 px-4">Tên trại nuôi</th>
              {showAssignmentInfo && (
                <th className="py-3.5 px-4">Quản lý phụ trách</th>
              )}
              <th className="py-3.5 px-4">Địa chỉ / Vị trí</th>
              <th className="py-3.5 px-4">Tổng diện tích</th>
              <th className="py-3.5 px-4 text-center">Vuông nuôi trực thuộc</th>
              <th className="py-3.5 px-4">Ngày đăng ký</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--divider)]">
            {farms.map((farm) => {
              const pondCount = farm.ponds?.length ?? farm.pondCount ?? 0;
              const summary = showAssignmentInfo
                ? getFarmAssignmentSummary(farm, staffList)
                : null;

              return (
                <tr
                  key={farm.farmId}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* Tên trại nuôi */}
                  <td className="py-4 px-4 font-medium text-[var(--text-heading)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                        <Building2 size={18} />
                      </div>
                      <div className="font-bold text-[var(--text-heading)] text-sm">
                        {farm.farmName}
                      </div>
                    </div>
                  </td>

                  {/* Quản lý phụ trách (Hiển thị cho Admin / Manager) */}
                  {showAssignmentInfo && summary && (
                    <td className="py-4 px-4 text-[var(--text-body)]">
                      {summary.isManagerAssigned && summary.managerName ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck
                            size={14}
                            className="text-purple-400 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-purple-300 text-xs">
                              {summary.managerName}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-medium">
                              Đã phân công Quản lý
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700 text-slate-400 text-xs">
                          <UserX size={12} />
                          <span>Chưa phân công Quản lý</span>
                        </span>
                      )}
                    </td>
                  )}

                  {/* Địa chỉ */}
                  <td className="py-4 px-4 text-[var(--text-body)]">
                    <div className="flex items-start gap-1.5 max-w-xs">
                      <MapPin
                        size={14}
                        className="text-[var(--text-subtle)] shrink-0 mt-0.5"
                      />
                      <span className="line-clamp-2">
                        {farm.address || (
                          <span className="italic text-[var(--text-muted)]">
                            Chưa thiết lập
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Tổng diện tích */}
                  <td className="py-4 px-4 text-[var(--text-primary)] font-semibold whitespace-nowrap">
                    {formatArea(farm.totalArea)}
                  </td>

                  {/* Số vuông nuôi trực thuộc */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewPonds(farm)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 transition cursor-pointer"
                      title="Xem danh sách vuông nuôi"
                    >
                      <Waves size={13} />
                      <span>{pondCount} vuông</span>
                    </button>
                  </td>

                  {/* Ngày tạo */}
                  <td className="py-4 px-4 text-[var(--text-muted)] text-xs whitespace-nowrap">
                    {formatVietnamDate(farm.createdAt)}
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {canAssignManager && onAssignManager && (
                        <button
                          type="button"
                          onClick={() => onAssignManager(farm)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                          title="Phân công Quản lý (Manager) phụ trách trại"
                        >
                          <ShieldCheck size={13} />
                          <span>Phân công Quản lý</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onViewPonds(farm)}
                        className="p-1.5 rounded-lg text-teal-300 hover:bg-teal-500/10 transition cursor-pointer"
                        title="Xem vuông nuôi"
                      >
                        <Eye size={16} />
                      </button>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(farm)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(farm)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Xóa trại nuôi"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
