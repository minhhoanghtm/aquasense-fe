import React from "react";
import { Users, UserCheck, Shield, Sprout } from "lucide-react";
import type { StaffStats as StaffStatsType } from "../../../hooks/useStaff";

interface StaffStatsProps {
  stats: StaffStatsType;
}

export const StaffStats: React.FC<StaffStatsProps> = ({ stats }) => {
  const statCards = [
    {
      id: "total",
      label: "Tổng nhân sự",
      value: stats.total,
      unit: "thành viên",
      subtext: "Đã đăng ký hệ thống",
      icon: <Users className="w-5 h-5" />,
      colorClass: "bg-cyan-500/10 text-[var(--accent)] border-cyan-500/20",
      valueColor: "text-[var(--text-primary)]",
    },
    {
      id: "active",
      label: "Đang hoạt động",
      value: `${stats.active}/${stats.total}`,
      unit: "nhân sự",
      subtext: "Tỷ lệ nhân viên đang hoạt động",
      icon: <UserCheck className="w-5 h-5" />,
      colorClass: "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/30",
      valueColor: "text-[var(--success)]",
    },
    {
      id: "managers",
      label: "Quản lý",
      value: stats.managers,
      unit: "quản lý",
      subtext: "Quản trị vuông & ngưỡng",
      icon: <Shield className="w-5 h-5" />,
      colorClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      valueColor: "text-purple-300",
    },
    {
      id: "farmers",
      label: "Nông dân",
      value: stats.farmers,
      unit: "nông dân",
      subtext: "Chăm sóc ao & theo dõi tôm",
      icon: <Sprout className="w-5 h-5" />,
      colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      valueColor: "text-emerald-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      {statCards.map((item) => (
        <div
          key={item.id}
          className="flex flex-col justify-between rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 sm:p-5 shadow-lg transition-all duration-300 hover:border-[var(--accent)]/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {item.label}
            </span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-2xl border ${item.colorClass}`}>
              {item.icon}
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${item.valueColor}`}>
              {item.value}
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {item.unit}
            </span>
          </div>

          <p className="mt-2 text-xs text-[var(--text-subtle)]">
            {item.subtext}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StaffStats;
