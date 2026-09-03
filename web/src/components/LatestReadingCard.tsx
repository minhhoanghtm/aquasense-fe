import React from "react";

export interface ReadingMetric {
  id?: string | number;
  label: string;
  value: string | number;
  color?: "cyan" | "amber" | "rose" | "teal" | string;
}

export const defaultProbeMetrics: ReadingMetric[] = [
  {
    id: "ph",
    label: "PH",
    value: "7.8",
    color: "cyan",
  },
  {
    id: "temperature",
    label: "NHIỆT ĐỘ",
    value: "29.4°C",
    color: "cyan",
  },
  {
    id: "do",
    label: "DO",
    value: "4.2 mg/L",
    color: "amber",
  },
  {
    id: "signal",
    label: "TÍN HIỆU",
    value: "18%",
    color: "cyan",
  },
];

export interface LatestReadingCardProps {
  deviceCode?: string;
  subtitle?: string;
  title?: string;
  metrics?: ReadingMetric[];
  className?: string;
  children?: React.ReactNode;
}

// Đường sóng lượn tăng dần giống mẫu thiết kế
export const MiniWave = ({ color = "cyan" }: { color?: string }) => {
  const strokeColor =
    color === "amber" || color === "yellow" || color === "warning"
      ? "#f6b94c"
      : color === "rose" || color === "red" || color === "critical"
      ? "#ff6678"
      : "#2dd4c3";

  return (
    <svg
      className="w-full h-5 mt-3 overflow-visible"
      viewBox="0 0 100 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M 0 16 C 10 16, 15 12, 25 13 C 35 14, 40 9, 50 10 C 60 11, 65 6, 75 7 C 85 8, 90 3, 100 4"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const LatestReadingCard: React.FC<LatestReadingCardProps> = ({
  deviceCode = "DO-PROBE-004",
  subtitle,
  title = "Mẫu DO A1-04",
  metrics = defaultProbeMetrics,
  className = "",
  children,
}) => {
  const headerSubtitle =
    subtitle || (deviceCode ? `GIÁ TRỊ ĐO GẦN NHẤT · ${deviceCode}` : "GIÁ TRỊ ĐO GẦN NHẤT");

  const displayMetrics = metrics && metrics.length > 0 ? metrics : defaultProbeMetrics;

  return (
    <div
      className={`w-full rounded-3xl border border-(--panel-border) bg-(--bg-primary) p-6 shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Header: Subtitle & Title */}
      <div className="mb-5 flex flex-col items-start gap-1">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-(--text-muted) font-mono">
          {headerSubtitle}
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-(--text-heading) leading-tight">
          {title}
        </h2>
      </div>

      {/* Content: Metrics Grid or Children */}
      {children || (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {displayMetrics.map((metric, index) => (
            <div
              key={metric.id ?? index}
              className="flex flex-col justify-between rounded-2xl border border-slate-700/40 bg-[#07242c]/70 p-4 transition-all duration-200 hover:border-cyan-500/40 hover:bg-[#07242c]"
            >
              {/* Metric Label */}
              <span className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                {metric.label}
              </span>

              {/* Metric Value */}
              <div className="mt-3">
                <span className="text-xl md:text-2xl font-extrabold text-(--text-primary) font-mono tracking-tight">
                  {metric.value}
                </span>
              </div>

              {/* Wave Trend Line */}
              <MiniWave color={metric.color} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestReadingCard;


