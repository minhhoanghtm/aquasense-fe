import { ShieldCheck, Mail, Phone, Calendar, MapPin, CheckCircle2, Award, Waves } from "lucide-react";
import type { User as UserType } from "../../types/User";
import { formatVietnamDateTime } from "../../utils/date";

interface ProfileHeaderProps {
  user: UserType | null;
  totalPonds: number;
  activeDevices: number;
}

export default function ProfileHeader({
  user,
  totalPonds,
  activeDevices,
}: ProfileHeaderProps) {
  const roleLabel =
    user?.role === "ADMIN"
      ? "Quản trị viên Hệ thống"
      : user?.role === "TECHNICIAN"
      ? "Kỹ thuật viên Thủy sản"
      : "Chủ hộ / Nông dân";

  const roleColor =
    user?.role === "ADMIN"
      ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
      : user?.role === "TECHNICIAN"
      ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ND";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 sm:p-6 backdrop-blur-xl shadow-lg">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: User Avatar & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/30 via-[var(--accent)]/20 to-teal-700/40 text-2xl sm:text-3xl font-bold text-[var(--accent-bright)] ring-2 ring-[var(--panel-border-strong)] shadow-inner">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[var(--bg-primary)]" title="Đang hoạt động">
              <CheckCircle2 size={13} className="text-slate-950 stroke-[3]" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)]">
                {user?.fullName || "Nguyễn Văn An"}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColor}`}>
                <Award size={12} />
                {roleLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--success)] border border-[var(--success)]/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse"></span>
                Đã xác minh
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-[var(--text-body)]">
                <Mail size={14} className="text-[var(--accent)]" />
                {user?.email || "farmer@example.com"}
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-body)]">
                <Phone size={14} className="text-[var(--accent)]" />
                {user?.phoneNumber || "0900000001"}
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <MapPin size={14} className="text-[var(--accent)]" />
                {user?.address || "Cà Mau, Việt Nam"}
              </span>
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-[var(--text-subtle)]">
              <Calendar size={13} />
              <span>
                Thành viên từ: {user?.createdAt ? formatVietnamDateTime(user.createdAt) : "01/08/2026"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[var(--accent)]">
                <ShieldCheck size={13} /> Mã ID: {user?.id?.toUpperCase() || "U1"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="flex flex-col rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 text-center sm:text-left min-w-[125px] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Vuông nuôi</span>
              <Waves size={14} className="text-[var(--accent)]" />
            </div>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {totalPonds}
            </p>
            <span className="text-[10px] text-[var(--text-subtle)]">Đang giám sát</span>
          </div>

          <div className="flex flex-col rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 text-center sm:text-left min-w-[125px] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Thiết bị IoT</span>
              <div className="h-2 w-2 rounded-full bg-[var(--success)] animate-ping"></div>
            </div>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-[var(--success)]">
              {activeDevices}
            </p>
            <span className="text-[10px] text-[var(--text-subtle)]">Đang trực tuyến</span>
          </div>

          <div className="col-span-2 sm:col-span-1 flex flex-col rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 text-center sm:text-left min-w-[125px] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Bảo mật</span>
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-400">
              Cấp 2
            </p>
            <span className="text-[10px] text-[var(--text-subtle)]">Được bảo vệ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
