import {
  X,
  Mail,
  Phone,
  MapPin,
  Layers,
  AlertTriangle,
  BellRing,
} from "lucide-react";
import type { User as UserType, UserStatus } from "../../../types/User";
import type { Pond, PondStatus } from "../../../types/Pond";

interface StaffDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: UserType | null;
  ponds: Pond[];
  onEdit?: (staff: UserType) => void;
  onAssignPond: (staff: UserType) => void;
  onApprove?: (staff: UserType) => void;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  isOpen,
  onClose,
  staff,
  ponds,
  onEdit: _onEdit,
  onAssignPond,
  onApprove,
}) => {
  if (!isOpen || !staff) return null;

  const assignedPonds = ponds.filter((p) =>
    staff.assignedPondIds?.includes(p.id) || staff.assignedPondIds?.includes(p.pondId || "")
  );

  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case "MANAGER":
      case "ADMIN":
        return {
          label: "Quản lý",
          desc: "Toàn quyền quản lý tài khoản nông dân, cấu hình ngưỡng cảnh báo và phân công vuông nuôi.",
          color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        };
      case "FARMER":
      default:
        return {
          label: "Nông dân",
          desc: "Trực tiếp chăm sóc vuông tôm, theo dõi quan trắc nước IoT và ghi nhật ký test kit NH3/NO2.",
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        };
    }
  };

  const getStatusBadge = (status?: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Hoạt động",
          badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        };
      case "PENDING_APPROVAL":
        return {
          label: "Chờ phê duyệt",
          badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/40",
        };
      case "INACTIVE":
      case "ON_LEAVE":
      default:
        return {
          label: "Không hoạt động",
          badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        };
    }
  };

  const getPondStatusBadge = (status?: string | PondStatus) => {
    switch (status?.toUpperCase()) {
      case "HARVESTED":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "EMPTY":
        return "bg-slate-500/15 text-slate-300 border-slate-500/30";
      case "ACTIVE":
      default:
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    }
  };

  const roleInfo = getRoleBadge(staff.role);
  const statusInfo = getStatusBadge(staff.status);

  const initials = staff.fullName
    ? staff.fullName
      .split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase()
    : "NV";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03161e]/85 animate-fadeIn">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[#07242e]/98 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(45,212,195,0.15)] text-left flex flex-col max-h-[90vh]">
        {/* Modal Top Banner */}
        <div className="relative border-b border-[var(--divider)] px-6 py-5 bg-gradient-to-r from-[#041c24] via-[#082a35] to-[#041c24]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#159d96] to-[#35e1d0] text-[#062621] font-extrabold text-lg shadow-lg">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {staff.fullName}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.badgeColor}`}
                >
                  {statusInfo.label}
                </span>
                {/* <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    staff.isActive !== false
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  }`}
                >
                  <Power size={11} />
                  {staff.isActive !== false ? "isActive: true" : "isActive: false"}
                </span> */}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                <span>Mã định danh: <span className="font-mono text-cyan-400">{staff.userId || staff.id}</span></span>
                <span>·</span>
                <span>Vai trò: <span className="text-emerald-400 font-semibold">{staff.role == "FARMER" ? "Nông dân" : "Quản lý"}</span></span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Pending Alert banner */}
          {staff.status === "PENDING_APPROVAL" && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                <span>Tài khoản này đang chờ quản trị viên duyệt trước khi có thể đăng nhập.</span>
              </div>
              {onApprove && (
                <button
                  type="button"
                  onClick={() => {
                    onApprove(staff);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-[#041920] font-bold text-xs hover:bg-emerald-400 transition cursor-pointer"
                >
                  Duyệt ngay
                </button>
              )}
            </div>
          )}

          {/* Role & Permissions Card */}
          <div className="p-4 rounded-2xl bg-[#051c24] border border-cyan-900/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Phân quyền & Vai trò Entity
              </span>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
            <p className="text-xs text-[var(--text-body)]">
              {roleInfo.desc}
            </p>
          </div>

          {/* Contact & FCM Details Grid */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
              Thông tin liên lạc & Push FCM Token
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#051c24] border border-cyan-900/40">
                <Phone size={15} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-[var(--text-subtle)]">Số điện thoại</div>
                  <div className="text-[var(--text-primary)] font-medium">{staff.phoneNumber || "Chưa cập nhật"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#051c24] border border-cyan-900/40">
                <Mail size={15} className="text-cyan-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-[var(--text-subtle)]">Email liên hệ</div>
                  <div className="text-[var(--text-primary)] font-medium">{staff.email || "farmer@aquasense.vn"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#051c24] border border-cyan-900/40">
                <MapPin size={15} className="text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-[var(--text-subtle)]">Địa chỉ / Khu vực (address)</div>
                  <div className="text-[var(--text-primary)] font-medium">{staff.address || "Khu vực Cà Mau"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#051c24] border border-cyan-900/40">
                <BellRing size={15} className="text-purple-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-[var(--text-subtle)]">Mã FCM Push Token</div>
                  <div className="text-[var(--text-primary)] font-mono text-[11px] truncate">
                    {staff.fcmToken || `fcm_usr_${staff.id}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Ponds List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Layers size={14} className="text-cyan-400" />
                Danh sách vuông nuôi phụ trách ({assignedPonds.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAssignPond(staff);
                }}
                className="text-xs text-[var(--accent)] hover:text-[var(--accent-bright)] font-semibold transition cursor-pointer"
              >
                + Thay đổi phân công
              </button>
            </div>

            {assignedPonds.length === 0 ? (
              <div className="p-5 rounded-2xl bg-[#051c24] border border-dashed border-cyan-900/50 text-center text-xs text-[var(--text-muted)]">
                Nhân viên này chưa được phân công vuông nuôi nào.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {assignedPonds.map((pond) => (
                  <div
                    key={pond.id}
                    className="p-3 rounded-xl bg-[#051c24] border border-cyan-900/40 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-xs text-[var(--text-heading)]">
                        {pond.pondName || pond.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-subtle)] mt-0.5 flex items-center gap-1.5">
                        <span>{pond.areaM2 ? `${pond.areaM2.toLocaleString()} m²` : `${pond.area || 0.5} ha`}</span>
                        <span>·</span>
                        <span>Độ sâu: {pond.depthM || 1.5}m</span>
                        <span>·</span>
                        <span>Mật độ: {pond.shrimpDensity || 120} con/m²</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getPondStatusBadge(
                        pond.status
                      )}`}
                    >
                      {pond.status || "ACTIVE"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--divider)] px-6 py-3.5 bg-[#041920] flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-subtle)]">
            Mã định danh: <span className="text-cyan-400 font-mono">{staff.userId || staff.id}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-900/40 text-cyan-200 hover:bg-cyan-900/70 border border-cyan-700/50 transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailModal;
