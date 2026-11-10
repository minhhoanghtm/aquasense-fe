import React, { useState } from "react";
import {
  Radio,
  Wind,
  Droplets,
  Cpu,
  Activity,
  Edit3,
  Trash2,
  AlertTriangle,
  Eye,
  Copy,
  Check,
  Building2,
  Layers,
  Clock,
} from "lucide-react";
import type { Devices } from "../../types/Devices";
import {
  getDeviceTypeInfo,
  getConnectionStatus,
  getDeviceCondition,
  formatLastActiveTime,
} from "./deviceUtils";

interface DeviceCardViewProps {
  devices: Devices[];
  loading?: boolean;
  canManage?: boolean;
  onViewDetail: (device: Devices) => void;
  onEditDevice?: (device: Devices) => void;
  onDeleteDevice?: (device: Devices) => void;
  onReportFault?: (device: Devices) => void;
  farmMap?: Record<string, string>;
}

export const DeviceCardView: React.FC<DeviceCardViewProps> = ({
  devices,
  loading = false,
  canManage = false,
  onViewDetail,
  onEditDevice,
  onDeleteDevice,
  onReportFault,
  farmMap = {},
}) => {
  const [copiedMac, setCopiedMac] = useState<string | null>(null);

  const handleCopyMac = (e: React.MouseEvent, mac: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mac);
    setCopiedMac(mac);
    setTimeout(() => setCopiedMac(null), 2000);
  };

  const getDeviceIcon = (key: string) => {
    switch (key) {
      case "gateway":
        return <Radio className="w-5 h-5 text-indigo-400" />;
      case "do_sensor":
        return <Wind className="w-5 h-5 text-cyan-400" />;
      case "ph_sensor":
        return <Droplets className="w-5 h-5 text-teal-400" />;
      case "controller":
        return <Activity className="w-5 h-5 text-purple-400" />;
      default:
        return <Cpu className="w-5 h-5 text-sky-400" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/80 animate-pulse flex flex-col justify-between h-[230px]"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-slate-700/50 rounded-2xl" />
              <div className="h-6 w-20 bg-slate-700/50 rounded-full" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-4 w-40 bg-slate-700/50 rounded" />
              <div className="h-3 w-28 bg-slate-800/60 rounded" />
            </div>
            <div className="h-8 w-full bg-slate-700/40 rounded-xl mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/80 text-center shadow-lg">
        <div className="h-14 w-14 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
          <Cpu size={26} />
        </div>
        <h3 className="text-base font-bold text-slate-200">
          Không tìm thấy thiết bị nào
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
          Không có thiết bị IoT nào phù hợp với bộ lọc hiện tại hoặc bạn chưa được phân công quản lý thiết bị nào.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 w-full text-left">
      {devices.map((device) => {
        const devId = device.deviceId || device.id || "";
        const devName = device.name || device.deviceName || "Thiết bị chưa đặt tên";
        const devCode = device.macAddress || device.node_code || devId;
        const typeInfo = getDeviceTypeInfo(device);
        const conn = getConnectionStatus(device.status);
        const cond = getDeviceCondition(
          device.status,
          device.signal_strength,
          device.battery_level
        );
        const lastActive = formatLastActiveTime(device.lastActiveAt);

        // Farm & Pond display
        const pondName = device.pond?.pondName || "Chưa gán ao";
        const farmName =
          device.pond?.farm?.farmName ||
          (device.pond?.farmId && farmMap[device.pond.farmId]) ||
          (device.pondId && farmMap[device.pondId]) ||
          "—";

        return (
          <div
            key={devId}
            onClick={() => onViewDetail(device)}
            className="group relative flex flex-col justify-between p-5 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/90 backdrop-blur-md hover:border-cyan-500/50 hover:bg-[#07242f]/95 hover:shadow-xl hover:shadow-cyan-950/30 transition-all duration-200 cursor-pointer min-h-[240px]"
          >
            {/* Top Row: Device Icon + Status Badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#041920] border border-[var(--panel-border)] group-hover:border-cyan-500/40 transition-colors">
                  {getDeviceIcon(typeInfo.key)}
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${typeInfo.badgeClass}`}
                  >
                    {typeInfo.shortLabel}
                  </span>
                  <div className="text-[10px] text-[var(--text-subtle)] font-medium mt-0.5">
                    {device.firmwareVersion || "v1.0.0"}
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${conn.badgeClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${conn.dotClass}`} />
                  <span>{conn.label}</span>
                </span>
                {cond.condition !== "NORMAL" && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cond.badgeClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cond.dotClass}`} />
                    <span>{cond.label}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Name + MAC Code */}
            <div className="mt-3.5 space-y-1">
              <h3
                className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1"
                title={devName}
              >
                {devName}
              </h3>
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                <span>{devCode}</span>
                <button
                  type="button"
                  onClick={(e) => handleCopyMac(e, devCode)}
                  className="p-1 rounded-md text-slate-500 hover:text-cyan-300 transition cursor-pointer"
                  title="Sao chép địa chỉ MAC"
                >
                  {copiedMac === devCode ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            </div>

            {/* Farm & Pond Info Box */}
            <div className="mt-3 p-2.5 rounded-2xl bg-[#03161e] border border-[var(--panel-border)] grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Building2 size={13} className="text-purple-400 shrink-0" />
                <span className="text-[var(--text-muted)] truncate" title={farmName}>
                  {farmName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <Layers size={13} className="text-cyan-400 shrink-0" />
                <span className="text-[var(--text-muted)] truncate" title={pondName}>
                  {pondName}
                </span>
              </div>
            </div>

            {/* Footer: Last active timestamp + Actions */}
            <div className="mt-3.5 pt-3 border-t border-[var(--divider)] flex items-center justify-between text-xs">
              <div
                className="flex items-center gap-1.5 text-[11px] text-[var(--text-subtle)] truncate max-w-[160px]"
                title={lastActive.full}
              >
                <Clock size={12} className="shrink-0" />
                <span className="truncate">{lastActive.relative}</span>
              </div>

              {/* Action Buttons */}
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Xem chi tiết */}
                <button
                  type="button"
                  onClick={() => onViewDetail(device)}
                  className="p-1.5 rounded-xl border border-[var(--panel-border)] bg-[#041920] text-[var(--text-muted)] hover:text-cyan-300 hover:border-cyan-500/40 transition cursor-pointer"
                  title="Xem chi tiết"
                >
                  <Eye size={13} />
                </button>

                {/* Báo hỏng */}
                {onReportFault && (
                  <button
                    type="button"
                    onClick={() => onReportFault(device)}
                    className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 hover:text-white transition cursor-pointer"
                    title="Báo cáo thiết bị hỏng"
                  >
                    <AlertTriangle size={13} />
                  </button>
                )}

                {/* Sửa (Manager, Admin) */}
                {canManage && onEditDevice && (
                  <button
                    type="button"
                    onClick={() => onEditDevice(device)}
                    className="p-1.5 rounded-xl border border-[var(--panel-border)] bg-[#041920] text-[var(--text-muted)] hover:text-white hover:border-slate-500 transition cursor-pointer"
                    title="Chỉnh sửa thiết bị"
                  >
                    <Edit3 size={13} />
                  </button>
                )}

                {/* Xóa (Manager, Admin) */}
                {canManage && onDeleteDevice && (
                  <button
                    type="button"
                    onClick={() => onDeleteDevice(device)}
                    className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-400 hover:bg-rose-950/60 transition cursor-pointer"
                    title="Xóa thiết bị"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeviceCardView;
