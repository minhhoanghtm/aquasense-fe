import React from "react";
import { formatVietnamDateTime } from "../utils/date";

export interface ReadingMetric {
  id?: string | number;
  label: string;
  value: string | number;
  color?: "cyan" | "amber" | "rose" | "teal" | string;
}

export interface LatestReadingCardProps {
  deviceCode?: string;
  subtitle?: string;
  title?: string;
  metrics?: ReadingMetric[];
  timestamp?: string;
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
  deviceCode,
  subtitle,
  title,
  metrics = [],
  timestamp,
  className = "",
  children,
}) => {
  const formattedTime = timestamp ? formatVietnamDateTime(timestamp) : "";
  const headerSubtitle =
    subtitle ||
    (deviceCode
      ? `GIÁ TRỊ ĐO GẦN NHẤT · ${deviceCode}${formattedTime ? ` (${formattedTime})` : ""}`
      : formattedTime
      ? `GIÁ TRỊ ĐO GẦN NHẤT · ${formattedTime}`
      : "GIÁ TRỊ ĐO GẦN NHẤT");

  const displayMetrics = Array.isArray(metrics) ? metrics : [];

  return (
    <div
      className={`w-full dashboard-card p-6 shadow-md ${className}`}
    >
      {/* Header: Subtitle & Title */}
      <div className="mb-5 flex flex-col items-start gap-1">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
          {headerSubtitle}
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-[var(--text-heading)] leading-tight">
          {title || "Giá trị đo gần nhất"}
        </h2>
      </div>

      {/* Content: Metrics Grid or Children */}
      {children || (displayMetrics.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {displayMetrics.map((metric, index) => (
            <div
              key={metric.id ?? index}
              className="flex flex-col justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] p-4 transition-all duration-200 hover:border-[var(--panel-border-strong)]"
            >
              {/* Metric Label */}
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {metric.label}
              </span>

              {/* Metric Value */}
              <div className="mt-3">
                <span className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">
                  {metric.value}
                </span>
              </div>

              {/* Wave Trend Line */}
              <MiniWave color={metric.color} />
            </div>
          ))}
        </div>
      ) : <p className="py-6 text-sm text-[var(--text-muted)]">Chưa có dữ liệu đo từ thiết bị này.</p>)}
    </div>
  );
};

export default LatestReadingCard;


