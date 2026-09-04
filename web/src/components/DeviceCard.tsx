import React from "react";
import { Radio } from "lucide-react";

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
    ? "bg-cyan-950/80 text-(--accent) border-cyan-500/30"
    : isWarning
      ? "bg-amber-950/80 text-amber-400 border-amber-500/30"
      : isDanger
        ? "bg-rose-950/80 text-rose-400 border-rose-500/30"
        : "bg-slate-900/80 text-slate-400 border-slate-700/40";

  const statusDotClass = isOnline
    ? "bg-(--accent)"
    : isWarning
      ? "bg-amber-400"
      : isDanger
        ? "bg-rose-400"
        : "bg-slate-500";

  return (
    <div
      className={`w-full rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-5 shadow-lg transition-all duration-300 hover:border-(--accent)/50 ${className}`}
    >
      {/* Header: Icon Box + Status Badge */}
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0d2e38] text-(--accent)">
          {icon || <Radio className="h-6 w-6" />}
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${statusBadgeClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Title & Device Code */}
      <div className="mt-4 flex flex-col items-start gap-1">
        <h3 className="text-base md:text-lg font-bold text-(--text-heading) leading-tight">
          {name}
        </h3>
        {(code || subtitle) && (
          <span className="text-xs font-semibold uppercase tracking-wider text-(--text-muted) font-mono">
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
              className="rounded-xl border border-cyan-900/40 bg-[#0a2b35] px-3 py-1 text-xs font-medium text-(--text-body)"
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
