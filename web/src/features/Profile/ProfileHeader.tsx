import { memo } from "react";
import { Phone, Award, Waves } from "lucide-react";
import type { User as UserType } from "../../types/User";

interface ProfileHeaderProps {
  user: UserType | null;
  totalPonds: number;
  activeDevices?: number;
}

const ProfileHeader = memo(function ProfileHeader({
  user,
  totalPonds,
}: ProfileHeaderProps) {
  const roleLabel =
    user?.role === "MANAGER" || user?.role === "ADMIN"
      ? "Quản lý"
      : "Nông dân";

  const roleColor =
    user?.role === "MANAGER" || user?.role === "ADMIN"
      ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
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

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between text-left">
        {/* Left: User Avatar & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/30 via-[var(--accent)]/20 to-teal-700/40 text-2xl sm:text-3xl font-bold text-[var(--accent-bright)] ring-2 ring-[var(--panel-border-strong)] shadow-inner">
              {initials}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)]">
                {user?.fullName || "Nguyễn Văn An"}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColor}`}>
                <Award size={12} />
                {roleLabel}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5 text-[var(--text-body)]">
                <Phone size={14} className="text-[var(--accent)]" />
                Số điện thoại: <span className="text-white font-medium">{user?.phoneNumber || "0912 345 678"}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Right: Quick Stats Cards */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* 1. Vuông nuôi */}
          <div className="flex flex-col rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-5 py-3.5 text-center sm:text-left min-w-[140px] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Vuông nuôi</span>
              <Waves size={14} className="text-[var(--accent)]" />
            </div>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {totalPonds}
            </p>
            <span className="text-[10px] text-[var(--text-subtle)]">Đang giám sát</span>
          </div>

          {/* 
          {/* 2. Trạm IoT - Tạm thời ẩn */}
          {/* 
          <div className="flex flex-col rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 text-center sm:text-left min-w-[125px] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Trạm IoT</span>
              <div className="h-2 w-2 rounded-full bg-[var(--success)] animate-ping"></div>
            </div>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-[var(--success)]">
              {activeDevices}
            </p>
            <span className="text-[10px] text-[var(--text-subtle)]">Trực tuyến</span>
          </div>
          */}

          {/* 3. Cảnh báo - Tạm thời ẩn */}
          {/* 
          <div className="col-span-2 sm:col-span-1 flex flex-col rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3.5 text-center sm:text-left min-w-[125px] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Cảnh báo</span>
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-400">
              Tự động
            </p>
            <span className="text-[10px] text-[var(--text-subtle)]">Hệ thống AI</span>
          </div>
          */}
        </div>
      </div>
    </div>
  );
});

export default ProfileHeader;
