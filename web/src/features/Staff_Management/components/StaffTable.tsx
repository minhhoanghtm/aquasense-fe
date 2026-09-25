import React from "react";
import {
  Mail,
  Phone,
  Shield,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";
import type { User, UserStatus } from "../../../types/User";
import type { Pond } from "../../../types/Pond";

interface StaffTableProps {
  staffList: User[];
  ponds: Pond[];
  onViewDetail: (staff: User) => void;
  onEdit: (staff: User) => void;
  onDelete: (staff: User) => void;
  onAssignPond: (staff: User) => void;
  onApprove?: (staff: User) => void;
  onReject?: (staff: User) => void;
  onChangeStatus?: (staff: User, status: UserStatus) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staffList,
  ponds,
  onViewDetail,
  onEdit: _onEdit,
  onDelete,
  onAssignPond,
  onApprove,
  onReject,
  onChangeStatus,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case "MANAGER":
      case "ADMIN":
        return {
          label: "Quản lý",
          color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        };
      case "FARMER":
      default:
        return {
          label: "Nông dân",
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        };
    }
  };

  const getStatusBadge = (status?: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Hoạt động",
          dotColor: "bg-[var(--success)]",
          badgeColor: "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/30",
        };
      case "PENDING_APPROVAL":
        return {
          label: "Chờ phê duyệt",
          dotColor: "bg-amber-400 animate-ping",
          badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/40",
        };
      case "INACTIVE":
      case "ON_LEAVE":
      default:
        return {
          label: "Không hoạt động",
          dotColor: "bg-rose-500",
          badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        };
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--divider)] bg-[#051c24]/90 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              <th className="py-3.5 px-4 sm:px-5">Nhân sự</th>
              <th className="py-3.5 px-4">Liên hệ</th>
              <th className="py-3.5 px-4">Vai trò & Phòng ban</th>
              <th className="py-3.5 px-4">Vuông nuôi phụ trách</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4 sm:px-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--divider)] text-xs text-[var(--text-body)]">
            {staffList.map((staff) => {
              const roleInfo = getRoleBadge(staff.role);
              const statusInfo = getStatusBadge(staff.status);
              const assignedPonds = ponds.filter(
                (p) =>
                  staff.assignedPondIds?.includes(p.id) ||
                  staff.assignedPondIds?.includes(p.pondId || "")
              );
              const initials = staff.fullName
                ? staff.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(-2)
                    .join("")
                    .toUpperCase()
                : "NV";

              return (
                <tr
                  key={staff.id}
                  className="transition-colors hover:bg-cyan-950/30"
                >
                  {/* Staff Info */}
                  <td className="py-3.5 px-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#159d96] to-[#35e1d0] text-[#062621] font-bold text-xs shadow">
                        {initials}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[#061c24] ${statusInfo.dotColor}`}
                        />
                      </div>
                      <div>
                        <div
                          className="font-bold text-sm text-[var(--text-primary)] hover:text-[var(--accent)] cursor-pointer"
                          onClick={() => onViewDetail(staff)}
                        >
                          {staff.fullName}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {staff.position || "Nhân viên vận hành"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
                        <Mail size={12} className="text-cyan-400 shrink-0" />
                        {staff.email}
                      </span>
                      {staff.phoneNumber && (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Phone size={12} className="text-emerald-400 shrink-0" />
                          {staff.phoneNumber}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Role & Dept */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border ${roleInfo.color}`}
                      >
                        <Shield size={11} />
                        {roleInfo.label}
                      </span>
                      {staff.department && (
                        <span className="text-[11px] text-[var(--text-subtle)] truncate max-w-[160px]">
                          {staff.department}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assigned Ponds */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                      {assignedPonds.length > 0 ? (
                        assignedPonds.map((pond) => (
                          <span
                            key={pond.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-cyan-950/80 border border-cyan-800 text-cyan-200"
                          >
                            <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                            {pond.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-[var(--text-subtle)] italic">
                          Chưa phân công
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onAssignPond(staff)}
                        className="p-0.5 rounded bg-cyan-900/30 hover:bg-cyan-800/60 text-cyan-300 text-[10px] cursor-pointer"
                        title="Phân công vuông nuôi"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {staff.status === "PENDING_APPROVAL" ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${statusInfo.badgeColor}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotColor}`} />
                        {statusInfo.label}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onChangeStatus) {
                            const isActive = staff.status === "ACTIVE" || (!staff.status && staff.isActive !== false);
                            onChangeStatus(staff, isActive ? "INACTIVE" : "ACTIVE");
                          }
                        }}
                        className="flex items-center gap-2 cursor-pointer select-none group"
                        title={
                          (staff.status === "ACTIVE" || (!staff.status && staff.isActive !== false))
                            ? "Bấm để chuyển sang Không hoạt động"
                            : "Bấm để chuyển sang Hoạt động"
                        }
                      >
                        <div
                          className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full border transition-colors duration-200 ease-in-out ${
                            (staff.status === "ACTIVE" || (!staff.status && staff.isActive !== false))
                              ? "bg-emerald-500/20 border-emerald-500/60"
                              : "bg-rose-950/40 border-rose-500/40"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-200 ease-in-out ${
                              (staff.status === "ACTIVE" || (!staff.status && staff.isActive !== false))
                                ? "translate-x-[21px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                                : "translate-x-[3px] bg-rose-400"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-xs font-semibold transition-colors ${
                            (staff.status === "ACTIVE" || (!staff.status && staff.isActive !== false))
                              ? "text-emerald-300"
                              : "text-rose-300/80"
                          }`}
                        >
                          {(staff.status === "ACTIVE" || (!staff.status && staff.isActive !== false))
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </span>
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-5 text-right">
                    {staff.status === "PENDING_APPROVAL" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onApprove && onApprove(staff)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-semibold cursor-pointer"
                          title="Phê duyệt"
                        >
                          <CheckCircle2 size={13} />
                          <span>Duyệt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject && onReject(staff)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 cursor-pointer"
                          title="Từ chối"
                        >
                          <XCircle size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetail(staff)}
                          className="p-1.5 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-900/40 cursor-pointer"
                          title="Xem thông tin chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(staff)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-900/40 cursor-pointer"
                          title="Xóa nhân viên"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
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

export default StaffTable;
