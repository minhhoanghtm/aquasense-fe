import React from "react";
import { Radio, Edit3, Trash2 } from "lucide-react";

export interface DeviceCardProps {
  icon?: React.ReactNode;
  status?:
    | "ONLINE"
    | "OFFLINE"
    | "WARNING"
    | "DANGER"
    | "online"
    | "offline"
    | "error"
    | string;
  name: string;
  code?: string;
  subtitle?: string;
  sensors?: string[];
  connector?: string;
  signal?: number;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SignalBars = ({ value }: { value: number }) => {
  return (
    <div className="flex items-end gap-[3px] h-3.5">
      <span
        className={`w-1 h-1.5 rounded-xs transition-colors ${value >= 20 ? "bg-(--accent)" : "bg-slate-600"}`}
      />
      <span
        className={`w-1 h-2.5 rounded-xs transition-colors ${value >= 40 ? "bg-(--accent)" : "bg-slate-600"}`}
      />
      <span
        className={`w-1 h-3.5 rounded-xs transition-colors ${value >= 60 ? "bg-(--accent)" : "bg-slate-600"}`}
      />
      <span
        className={`w-1 h-4.5 rounded-xs transition-colors ${value >= 80 ? "bg-(--accent)" : "bg-slate-600"}`}
      />
    </div>
  );
};

const DeviceCard: React.FC<DeviceCardProps> = ({
  icon,
  status = "ONLINE",
  name,
  code,
  subtitle,
  sensors = [],
  connector = "Wi-Fi · MQTT",
  signal = 94,
  className = "",
  onEdit,
  onDelete,
}) => {
  // Chuẩn hóa trạng thái
  const normalizedStatus = status.toUpperCase();
  const isOnline =
    normalizedStatus === "ONLINE" || normalizedStatus === "TRỰC TUYẾN";
  const isWarning =
    normalizedStatus === "WARNING" || normalizedStatus === "CẢNH BÁO";
  const isDanger =
    normalizedStatus === "DANGER" ||
    normalizedStatus === "ERROR" ||
    normalizedStatus === "NGUY HIỂM";

  const statusLabel = isOnline
    ? "Trực tuyến"
    : isWarning
      ? "Cảnh báo"
      : isDanger
        ? "Nguy hiểm"
        : "Ngoại tuyến";

  const statusBadgeClass = isOnline
    ? "bg-[var(--success-bg)] text-[var(--success)] border-transparent"
    : isWarning
      ? "bg-[var(--warning-bg)] text-[var(--warning)] border-transparent"
      : isDanger
        ? "bg-[var(--critical-bg)] text-[var(--critical)] border-transparent"
        : "bg-[var(--panel-bg-dark)] text-[var(--text-muted)] border-transparent";

  const statusDotClass = isOnline
    ? "bg-[var(--success)]"
    : isWarning
      ? "bg-[var(--warning)]"
      : isDanger
        ? "bg-[var(--critical)]"
        : "bg-[var(--text-subtle)]";

  return (
    <div
      className={`w-full dashboard-card p-5 text-left flex flex-col justify-between ${className}`}
    >
      {/* Header: Icon Box + Status Badge + Actions */}
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] text-[var(--accent)]">
          {icon || <Radio className="h-6 w-6" />}
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />
            <span>{statusLabel}</span>
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:bg-[var(--panel-highlight)] hover:text-[var(--text-heading)] transition cursor-pointer"
              title="Chỉnh sửa thiết bị"
            >
              <Edit3 size={13} />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-xl border border-[var(--critical-bg)] bg-[var(--panel-bg)] text-[var(--critical)] hover:bg-[var(--critical-bg)] transition cursor-pointer"
              title="Xóa thiết bị"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Title & Device Code */}
      <div className="mt-4 flex flex-col items-start gap-1">
        <h3 className="text-base md:text-lg font-semibold text-[var(--text-heading)] leading-tight">
          {name}
        </h3>
        {(code || subtitle) && (
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">
            {code || subtitle}
          </span>
        )}
      </div>

      {/* Sensors Tags List */}
      {sensors.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {sensors.map((sensor, index) => (
            <span
              key={index}
              className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] px-3 py-1 text-xs font-medium text-[var(--text-body)]"
            >
              {sensor}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Connection & Signal */}
      <div className="mt-5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-(--text-muted)">{connector}</span>
          <div className="flex items-center gap-2">
            <SignalBars value={signal} />
            <span className="font-bold text-(--text-primary)">{signal}%</span>
          </div>
        </div>

        {/* Signal Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#08222b]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500 shadow-[0_0_8px_rgba(45,212,195,0.5)]"
            style={{ width: `${Math.min(100, Math.max(0, signal))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
