import React from "react";

export type AlertLevel = "NORMAL" | "WARNING" | "DANGER";
export type AlertStatus = "UNRESOLVED" | "PENDING" | "RESOLVED" | string;

export interface AlertItemProps {
  id?: string;
  time?: string;
  title: string;
  pondName?: string;
  value?: string | number;
  unit?: string;
  level?: AlertLevel;
  status?: AlertStatus;
  statusText?: string;
  onClick?: () => void;
  className?: string;
}

const levelBadgeStyles: Record<AlertLevel, { dot: string; badge: string }> = {
  NORMAL: {
    dot: "bg-teal-400",
    badge: "bg-teal-950/50 text-teal-300 border-teal-500/30",
  },
  WARNING: {
    dot: "bg-amber-400",
    badge: "bg-amber-950/50 text-amber-300 border-amber-500/30",
  },
  DANGER: {
    dot: "bg-rose-500",
    badge: "bg-rose-950/50 text-rose-300 border-rose-500/30",
  },
};

const getStatusConfig = (status?: string) => {
  const upper = status?.toUpperCase();
  switch (upper) {
    case "RESOLVED":
    case "ĐÃ XỬ LÝ":
      return {
        label: status || "Đã xử lý",
        dot: "bg-teal-400",
        badge: "bg-teal-950/60 text-teal-300 border-teal-500/30",
      };
    case "PENDING":
    case "ĐANG XỬ LÝ":
    case "ĐANG THEO DÕI":
      return {
        label: status || "Đang theo dõi",
        dot: "bg-amber-400",
        badge: "bg-amber-950/60 text-amber-300 border-amber-500/30",
      };
    case "UNRESOLVED":
    case "CHƯA XỬ LÝ":
    default:
      return {
        label: status || "Chưa xử lý",
        dot: "bg-rose-500",
        badge: "bg-rose-950/60 text-rose-400 border-rose-500/30",
      };
  }
};

const AlertItem: React.FC<AlertItemProps> = ({
  time = "18/06 · 09:30",
  title,
  pondName,
  value,
  unit = "",
  level = "DANGER",
  status = "UNRESOLVED",
  statusText,
  onClick,
  className = "",
}) => {
  const levelStyle = levelBadgeStyles[level] || levelBadgeStyles.DANGER;
  const currentStatusConfig = getStatusConfig(statusText || status);

  const displayValue =
    value !== undefined && value !== null
      ? `${value}${unit ? ` ${unit}` : ""}`
      : null;

  return (
    <div
      onClick={onClick}
      className={`w-full bg-(--panel-bg) border border-(--panel-border) rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all duration-200 hover:border-(--panel-border-strong) text-left ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Left: Time & Information */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        {/* Timestamp */}
        {time && (
          <span className="text-xs font-mono text-(--text-muted) tracking-wide whitespace-nowrap shrink-0">
            {time}
          </span>
        )}

        {/* Title & Pond location */}
        <div className="flex flex-col min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-(--text-heading) leading-snug truncate">
            {title}
          </h4>
          {pondName && (
            <p className="text-[11px] text-(--text-muted) mt-0.5 truncate">
              {pondName}
            </p>
          )}
        </div>
      </div>

      {/* Right: Badges */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {/* Value badge */}
        {displayValue && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${levelStyle.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${levelStyle.dot}`} />
            {displayValue}
          </span>
        )}

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${currentStatusConfig.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentStatusConfig.dot}`} />
          {statusText || currentStatusConfig.label}
        </span>
      </div>
    </div>
  );
};

export default AlertItem;

