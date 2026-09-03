import React from "react";
import { Cpu, Radio, WifiOff, AlertTriangle } from "lucide-react";

export interface DeviceStatsProps {
  total?: number;
  active?: number;
  offline?: number;
  warning?: number;
}

export const DeviceStats: React.FC<DeviceStatsProps> = ({
  total = 6,
  active = 4,
  offline = 1,
  warning = 1,
}) => {
  const stats = [
    {
      id: "total",
      label: "Tổng thiết bị",
      value: total,
      unit: "thiết bị",
      subtext: "Đã đăng ký hệ thống",
      icon: <Cpu className="w-5 h-5" />,
      colorClass: "bg-cyan-500/10 text-(--accent) border-cyan-500/20",
      valueColor: "text-(--text-primary)",
    },
    {
      id: "active",
      label: "Đang hoạt động",
      value: active,
      unit: "trực tuyến",
      subtext: "Truyền nhận dữ liệu ổn định",
      icon: <Radio className="w-5 h-5" />,
      colorClass: "bg-(--success-bg) text-(--success) border-(--success)/30",
      valueColor: "text-(--success)",
    },
    {
      id: "offline",
      label: "Mất kết nối",
      value: offline,
      unit: "ngoại tuyến",
      subtext: "Mất tín hiệu hoặc tắt nguồn",
      icon: <WifiOff className="w-5 h-5" />,
      colorClass: "bg-(--critical-bg) text-(--critical) border-(--critical)/30",
      valueColor: "text-(--critical)",
    },
    {
      id: "warning",
      label: "Cảnh báo / Pin yếu",
      value: warning,
      unit: "cần kiểm tra",
      subtext: "Pin dưới 20% hoặc có lỗi",
      icon: <AlertTriangle className="w-5 h-5" />,
      colorClass: "bg-(--warning-bg) text-(--warning) border-(--warning)/30",
      valueColor: "text-(--warning)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {stats.map((item) => (
        <div
          key={item.id}
          className="flex flex-col justify-between rounded-3xl border border-(--panel-border) bg-(--bg-primary) p-5 shadow-lg transition-all duration-300 hover:border-(--accent)/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
              {item.label}
            </span>
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${item.colorClass}`}>
              {item.icon}
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${item.valueColor}`}>
              {item.value}
            </span>
            <span className="text-xs font-medium text-(--text-muted)">
              {item.unit}
            </span>
          </div>

          <p className="mt-2 text-xs text-(--text-subtle)">
            {item.subtext}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DeviceStats;
