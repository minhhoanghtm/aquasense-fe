import React, { useState } from "react";
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
  Lock,
  Unlock,
} from "lucide-react";
import type { User, UserStatus } from "../../../types/User";
import type { Pond } from "../../../types/Pond";
import type { Farm } from "../../../types/Farm";
import { getRoleLabel } from "../../../lib/rolePermissions";
import { getCurrentUser } from "../../../services/authApi";
import StaffAssignedPondsModal from "./StaffAssignedPondsModal";

interface StaffCardProps {
  staff: User;
  ponds: Pond[];
  farms?: Farm[];
  onViewDetail: (staff: User) => void;
  onEdit: (staff: User) => void;
  onDelete: (staff: User) => void;
  onAssignPond?: (staff: User) => void;
  onAssignFarm?: (staff: User) => void;
  onApprove?: (staff: User) => void;
  onReject?: (staff: User) => void;
  onChangeStatus?: (staff: User, status: UserStatus) => void;
  onToggleLoginLock?: (staff: User) => void;
  canManage: boolean;
  canAssignFarms?: boolean;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  ponds,
  farms = [],
  onViewDetail,
  onEdit: _onEdit,
  onDelete,
  onAssignPond,
  onAssignFarm,
  onApprove,
  onReject,
  onChangeStatus,
  onToggleLoginLock,
  canManage,
  canAssignFarms = false,
}) => {
  const [isAllPondsModalOpen, setIsAllPondsModalOpen] = useState(false);
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.userId || currentUser?.id;
  const staffId = staff.userId || staff.id;
  const isSelf = Boolean(currentUserId && staffId && currentUserId === staffId);
  const roleUpper = staff.role?.toUpperCase();
  const isManager = roleUpper === "MANAGER";
  const isAdmin = roleUpper === "ADMIN";

  // Farms assigned to Manager
  const assignedFarms = farms.filter((f) => f.ownerId === staffId);
  const hasMoreFarms = assignedFarms.length > 5;
  const visibleFarms = hasMoreFarms ? assignedFarms.slice(0, 4) : assignedFarms;

  // Ponds assigned to Farmer
  const assignedPonds = ponds.filter(
    (p) => p.userId === staffId || p.farmerAssignments?.some((a) => a.farmerId === staffId)
  );
  const hasMorePonds = assignedPonds.length > 6;
  const visiblePonds = hasMorePonds ? assignedPonds.slice(0, 5) : assignedPonds;

  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case "MANAGER":
        return {
          label: "Quản lý",
          color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        };
      case "ADMIN":
        return {
          label: getRoleLabel(role),
          color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
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
        {/* Card Header: Avatar, Name, Role */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#159d96] to-[#35e1d0] text-[#062621] font-bold text-sm shadow-md">
              {initials}
              <span
                className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#061c24] ${statusInfo.dotColor}`}
              />
            </div>

            {/* Name and Position */}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug hover:text-[var(--accent)] cursor-pointer truncate" onClick={() => onViewDetail(staff)}>
                {staff.fullName}
              </h3>
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                <Building2 size={12} className="text-cyan-400 shrink-0" />
                <span className="truncate max-w-[170px]">{staff.position || staff.department || "Nhân viên vận hành"}</span>
              </p>
            </div>
          </div>

          {/* Role Badge (di chuyển thay thế Badge trạng thái ở góc trên bên phải) */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border whitespace-nowrap shrink-0 ${roleInfo.color}`}
          >
            <Shield size={12} />
            {roleInfo.label}
          </span>
        </div>

        {staff.department && staff.department !== staff.position && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-xl px-2.5 py-1 text-xs text-[var(--text-subtle)] bg-[#041a22] border border-cyan-950 truncate max-w-[200px]">
              {staff.department}
            </span>
          </div>
        )}

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

        {/* Assignment Section (Farms for MANAGER, Ponds for FARMER, System Scope for ADMIN) */}
        <div className="mt-4">
          {isManager ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                  <Building2 size={13} className="text-purple-400" />
                  Trại nuôi phụ trách ({assignedFarms.length}):
                </span>
                {canAssignFarms && onAssignFarm && (
                  <button
                    type="button"
                    onClick={() => onAssignFarm(staff)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold hover:underline cursor-pointer"
                  >
                    + Phân công trại
                  </button>
                )}
              </div>

              {/* Danh sách trại nuôi của Quản lý */}
              <div className="flex flex-wrap gap-1.5 min-h-[30px] max-h-[64px] overflow-hidden items-center">
                {assignedFarms.length > 0 ? (
                  <>
                    {visibleFarms.map((farm) => (
                      <span
                        key={farm.farmId}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-purple-950/60 border border-purple-700/50 text-purple-200 truncate max-w-[150px]"
                        title={farm.farmName}
                      >
                        <Building2 size={11} className="text-purple-400 shrink-0" />
                        <span className="truncate">{farm.farmName}</span>
                      </span>
                    ))}
                    {hasMoreFarms && (
                      <button
                        type="button"
                        onClick={() => {
                          if (canAssignFarms && onAssignFarm) onAssignFarm(staff);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 transition cursor-pointer shrink-0"
                        title={`Xem thêm ${assignedFarms.length - visibleFarms.length} trại nuôi khác`}
                      >
                        <span>+ Xem thêm ({assignedFarms.length - visibleFarms.length})</span>
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-[var(--text-subtle)] italic">
                    Chưa được phân công trại nuôi nào
                  </span>
                )}
              </div>
            </div>
          ) : isAdmin ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                  <Shield size={13} className="text-amber-400" />
                  Phạm vi quản trị:
                </span>
              </div>
              <div className="flex items-center gap-1.5 min-h-[30px]">
                <span className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  Toàn quyền quản trị hệ thống (Tất cả trại & vuông nuôi)
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                  <Layers size={13} className="text-[var(--accent)]" />
                  Vuông nuôi phụ trách ({assignedPonds.length}):
                </span>
                <div className="flex items-center gap-2">
                  {hasMorePonds && (
                    <button
                      type="button"
                      onClick={() => setIsAllPondsModalOpen(true)}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold hover:underline cursor-pointer"
                    >
                      Xem thêm
                    </button>
                  )}
                  {canManage && onAssignPond && (
                    <button
                      type="button"
                      onClick={() => onAssignPond(staff)}
                      className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      + Phân công
                    </button>
                  )}
                </div>
              </div>

              {/* Giới hạn hiển thị 2 dòng các ao nuôi và nút xem thêm */}
              <div className="flex flex-wrap gap-1.5 min-h-[30px] max-h-[64px] overflow-hidden items-center">
                {assignedPonds.length > 0 ? (
                  <>
                    {visiblePonds.map((pond) => (
                      <span
                        key={pond.id || pond.pondId}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-cyan-950/70 border border-cyan-700/50 text-cyan-200 truncate max-w-[140px]"
                        title={pond.name || pond.pondName}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                        <span className="truncate">{pond.name || pond.pondName}</span>
                      </span>
                    ))}

                    {hasMorePonds && (
                      <button
                        type="button"
                        onClick={() => setIsAllPondsModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/20 border border-teal-500/50 text-teal-300 hover:bg-teal-500/30 hover:border-teal-400 transition cursor-pointer shrink-0"
                        title={`Xem thêm ${assignedPonds.length - visiblePonds.length} ao nuôi khác`}
                      >
                        <span>+ Xem thêm ({assignedPonds.length - visiblePonds.length})</span>
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-[var(--text-subtle)] italic">
                    Chưa được phân công vuông nuôi nào
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-5 pt-3.5 border-t border-[var(--divider)] flex flex-col gap-2">
        {/* Pending Approval Action Bar */}
        {canManage && staff.status === "PENDING_APPROVAL" ? (
          <div className="flex items-center gap-2 w-full">
            {canManage && <button
              type="button"
              onClick={() => onApprove && onApprove(staff)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Phê duyệt</span>
            </button>}
            {canManage ? <button
              type="button"
              onClick={() => onReject && onReject(staff)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <XCircle size={14} />
              <span>Từ chối</span>
            </button> : <span className="text-xs text-[var(--text-subtle)]">Chỉ xem</span>}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 w-full">
            {/* Status toggle switch */}
            {canManage ? <button
              type="button"
              disabled={isSelf}
              onClick={() => {
                if (isSelf) return;
                if (onChangeStatus) {
                  const isActive = staff.status === "ACTIVE" || (!staff.status && staff.isActive !== false);
                  onChangeStatus(staff, isActive ? "INACTIVE" : "ACTIVE");
                }
              }}
              className={`flex items-center gap-2 select-none group ${
                isSelf ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              }`}
              title={
                isSelf
                  ? "Không thể tự thay đổi trạng thái hoạt động của chính mình"
                  : (staff.status === "ACTIVE" || (!staff.status && staff.isActive !== false))
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
            </button> : <span className="text-xs text-[var(--text-subtle)]">Chỉ xem</span>}

            {/* Quick buttons */}
            <div className="flex items-center gap-1.5">
              {canManage && <button
                type="button"
                disabled={isSelf}
                onClick={() => !isSelf && onToggleLoginLock?.(staff)}
                className={`p-1.5 rounded-lg flex items-center justify-center transition ${
                  isSelf
                    ? "bg-[#07252f] opacity-30 cursor-not-allowed text-gray-500 border border-transparent"
                    : staff.isLocked || staff.is_login_locked
                      ? "bg-rose-950/40 text-rose-400 border border-rose-900/50 cursor-pointer"
                      : "bg-[#07252f] text-emerald-400/70 border border-transparent cursor-pointer"
                }`}
                title={
                  isSelf
                    ? "Không thể tự khóa đăng nhập của chính mình"
                    : staff.isLocked || staff.is_login_locked
                      ? "Tài khoản đang bị khóa do nhập sai mật khẩu nhiều lần"
                      : "Tài khoản không bị khóa đăng nhập"
                }
                aria-label={staff.isLocked || staff.is_login_locked ? "Mở khóa đăng nhập" : "Khóa đăng nhập"}
              >
                {staff.isLocked || staff.is_login_locked ? <Lock size={15} /> : <Unlock size={15} />}
              </button>}
              <button
                type="button"
                onClick={() => onViewDetail(staff)}
                className="p-1.5 rounded-lg bg-[#07252f] text-cyan-400 hover:text-white hover:bg-cyan-900/40 transition cursor-pointer"
                title="Xem thông tin chi tiết"
              >
                <Eye size={15} />
              </button>
              {canManage && <button
                type="button"
                disabled={isSelf}
                onClick={() => !isSelf && onDelete(staff)}
                className={`p-1.5 rounded-lg bg-[#07252f] transition ${
                  isSelf
                    ? "opacity-30 cursor-not-allowed text-gray-500"
                    : "text-rose-400 hover:bg-rose-900/40 cursor-pointer"
                }`}
                title={isSelf ? "Không thể tự xóa tài khoản của chính mình" : "Xóa nhân viên"}
              >
                <Trash2 size={14} />
              </button>}
            </div>
          </div>
        )}
      </div>

      {/* Modal toàn bộ ao nuôi khi bấm Xem thêm */}
      {isAllPondsModalOpen && (
        <StaffAssignedPondsModal
          isOpen={isAllPondsModalOpen}
          onClose={() => setIsAllPondsModalOpen(false)}
          staff={staff}
          assignedPonds={assignedPonds}
          onAssignPond={canManage && onAssignPond ? () => onAssignPond(staff) : undefined}
        />
      )}
    </div>
  );
};

export default StaffCard;
