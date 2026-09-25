import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Shield,
  Layers,
} from "lucide-react";
import type { User, UserStatus } from "../../../types/User";
import type { Pond } from "../../../types/Pond";

interface StaffCardProps {
  staff: User;
  ponds: Pond[];
  onViewDetail: (staff: User) => void;
  onEdit: (staff: User) => void;
  onDelete: (staff: User) => void;
  onAssignPond: (staff: User) => void;
  onApprove?: (staff: User) => void;
  onReject?: (staff: User) => void;
  onChangeStatus?: (staff: User, status: UserStatus) => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  ponds,
  onViewDetail,
  onEdit: _onEdit,
  onDelete,
  onAssignPond,
  onApprove,
  onReject,
  onChangeStatus,
}) => {
  const assignedPonds = ponds.filter(
    (p) =>
      staff.assignedPondIds?.includes(p.id) ||
      staff.assignedPondIds?.includes(p.pondId || "")
  );

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

  const roleInfo = getRoleBadge(staff.role);
  const statusInfo = getStatusBadge(staff.status);

  // Initials for Avatar
  const initials = staff.fullName
    ? staff.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "NV";

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-lg transition-all duration-300 hover:border-[var(--accent)]/50 text-left relative group">
      <div>
        {/* Card Header: Avatar, Name, Role, Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#159d96] to-[#35e1d0] text-[#062621] font-bold text-sm shadow-md">
              {initials}
              <span
                className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#061c24] ${statusInfo.dotColor}`}
              />
            </div>

            {/* Name and Position */}
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug hover:text-[var(--accent)] cursor-pointer" onClick={() => onViewDetail(staff)}>
                {staff.fullName}
              </h3>
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                <Building2 size={12} className="text-cyan-400 shrink-0" />
                <span className="truncate max-w-[170px]">{staff.position || staff.department || "Nhân viên vận hành"}</span>
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border whitespace-nowrap ${statusInfo.badgeColor}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotColor}`} />
            {statusInfo.label}
          </span>
        </div>

        {/* Role and Department */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium border ${roleInfo.color}`}
          >
            <Shield size={12} />
            {roleInfo.label}
          </span>

          {staff.department && (
            <span className="rounded-xl px-2.5 py-1 text-xs text-[var(--text-subtle)] bg-[#041a22] border border-cyan-950 truncate max-w-[200px]">
              {staff.department}
            </span>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-[#06222b]/70 border border-cyan-900/30 p-3 text-xs text-[var(--text-body)]">
          <div className="flex items-center gap-2 truncate">
            <Mail size={13} className="text-cyan-400 shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
          {staff.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-emerald-400 shrink-0" />
              <span>{staff.phoneNumber}</span>
            </div>
          )}
          {staff.address && (
            <div className="flex items-center gap-2 truncate">
              <MapPin size={13} className="text-amber-400 shrink-0" />
              <span className="truncate">{staff.address}</span>
            </div>
          )}
        </div>

        {/* Assigned Ponds Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
              <Layers size={13} className="text-[var(--accent)]" />
              Vuông nuôi phụ trách ({assignedPonds.length}):
            </span>
            <button
              type="button"
              onClick={() => onAssignPond(staff)}
              className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
            >
              + Phân công
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
            {assignedPonds.length > 0 ? (
              assignedPonds.map((pond) => (
                <span
                  key={pond.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-cyan-950/70 border border-cyan-700/50 text-cyan-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  {pond.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--text-subtle)] italic">
                Chưa được phân công vuông nuôi nào
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-5 pt-3.5 border-t border-[var(--divider)] flex flex-col gap-2">
        {/* Pending Approval Action Bar */}
        {staff.status === "PENDING_APPROVAL" ? (
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={() => onApprove && onApprove(staff)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Phê duyệt</span>
            </button>
            <button
              type="button"
              onClick={() => onReject && onReject(staff)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <XCircle size={14} />
              <span>Từ chối</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 w-full">
            {/* Status toggle switch */}
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

            {/* Quick buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onViewDetail(staff)}
                className="p-1.5 rounded-lg bg-[#07252f] text-cyan-400 hover:text-white hover:bg-cyan-900/40 transition cursor-pointer"
                title="Xem thông tin chi tiết"
              >
                <Eye size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(staff)}
                className="p-1.5 rounded-lg bg-[#07252f] text-rose-400 hover:bg-rose-900/40 transition cursor-pointer"
                title="Xóa nhân viên"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffCard;
