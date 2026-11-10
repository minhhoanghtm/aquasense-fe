import React from "react";
import { Cpu, Radio, WifiOff, AlertTriangle } from "lucide-react";

export type KPIFilterType = "ALL" | "ONLINE" | "OFFLINE" | "ALERT_OR_FAULT";

export interface DeviceKPIStatsProps {
  total: number;
  active: number;
  offline: number;
  warning: number;
  loading?: boolean;
  activeFilter?: KPIFilterType;
  onFilterChange?: (filter: KPIFilterType) => void;
}

export const DeviceKPIStats: React.FC<DeviceKPIStatsProps> = ({
  total,
  active,
  offline,
  warning,
  loading = false,
  activeFilter = "ALL",
  onFilterChange,
}) => {
  const items: {
    id: KPIFilterType;
    label: string;
    value: number;
    unit: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    borderActive: string;
    bgActive: string;
    iconBg: string;
    valueColor: string;
  }[] = [
    {
      id: "ALL",
      label: "Tổng thiết bị",
      value: total,
      unit: "thiết bị",
      desc: "Trong phạm vi quản trị",
      icon: <Cpu className="w-5 h-5" />,
      color: "text-cyan-400",
      borderActive: "border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)]",
      bgActive: "bg-cyan-950/40",
      iconBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      valueColor: "text-white",
    },
    {
      id: "ONLINE",
      label: "Đang hoạt động",
      value: active,
      unit: "trực tuyến",
      desc: "Kết nối & truyền số liệu ổn định",
      icon: <Radio className="w-5 h-5" />,
      color: "text-emerald-400",
      borderActive: "border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]",
      bgActive: "bg-emerald-950/40",
      iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      valueColor: "text-emerald-400",
    },
    {
      id: "OFFLINE",
      label: "Mất kết nối",
      value: offline,
      unit: "ngoại tuyến",
      desc: "Mất tín hiệu hoặc tắt nguồn",
      icon: <WifiOff className="w-5 h-5" />,
      color: "text-slate-400",
      borderActive: "border-slate-400/80 shadow-[0_0_20px_rgba(148,163,184,0.25)]",
      bgActive: "bg-slate-900/60",
      iconBg: "bg-slate-700/30 text-slate-400 border-slate-700/50",
      valueColor: "text-slate-300",
    },
    {
      id: "ALERT_OR_FAULT",
      label: "Cảnh báo / Báo hỏng",
      value: warning,
      unit: "cần kiểm tra",
      desc: "Pin yếu hoặc đang bảo trì",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "text-amber-400",
      borderActive: "border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
      bgActive: "bg-amber-950/40",
      iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      valueColor: "text-amber-400",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/80 animate-pulse flex flex-col justify-between h-[135px]"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-700/50 rounded-md" />
              <div className="h-10 w-10 bg-slate-700/50 rounded-2xl" />
            </div>
            <div className="h-8 w-16 bg-slate-700/50 rounded-lg mt-2" />
            <div className="h-2.5 w-32 bg-slate-800/60 rounded-md mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {items.map((item) => {
        const isSelected = activeFilter === item.id;

        return (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              if (onFilterChange) {
                onFilterChange(isSelected && item.id !== "ALL" ? "ALL" : item.id);
              }
            }}
            className={`p-5 rounded-3xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
              isSelected
                ? `${item.borderActive} ${item.bgActive} translate-y-[-2px]`
                : "border-[var(--panel-border)] bg-[var(--panel-bg)] hover:border-cyan-800/70 hover:bg-[#07222c]/90"
            }`}
          >
            {/* Header: Label + Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-slate-300 transition-colors">
                {item.label}
              </span>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105 ${item.iconBg}`}
              >
                {item.icon}
              </div>
            </div>

            {/* Value + Unit */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${item.valueColor}`}>
                {item.value.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-[var(--text-muted)]">
                {item.unit}
              </span>
            </div>

            {/* Subtext + Active Indicator */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <p className="text-[11px] text-[var(--text-subtle)] truncate">
                {item.desc}
              </p>
              {isSelected && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Đang lọc
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default DeviceKPIStats;
