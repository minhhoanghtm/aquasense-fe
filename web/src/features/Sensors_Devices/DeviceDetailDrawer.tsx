import React, { useState, useEffect } from "react";
import {
  X,
  Radio,
  Wind,
  Droplets,
  Cpu,
  Activity,
  Copy,
  Check,
  Building2,
  AlertTriangle,
  Edit3,
  Trash2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import type { Devices } from "../../types/Devices";
import {
  getDeviceTypeInfo,
  getConnectionStatus,
  getDeviceCondition,
  formatLastActiveTime,
} from "./deviceUtils";
import {
  getLatestTelemetry,
  getTelemetryHistory,
} from "../../services/deviceApi";

interface DeviceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  device: Devices | null;
  canManage?: boolean;
  onEditDevice?: (device: Devices) => void;
  onDeleteDevice?: (device: Devices) => void;
  onReportFault?: (device: Devices) => void;
  farmMap?: Record<string, string>;
}

export const DeviceDetailDrawer: React.FC<DeviceDetailDrawerProps> = ({
  isOpen,
  onClose,
  device,
  canManage = false,
  onEditDevice,
  onDeleteDevice,
  onReportFault,
  farmMap = {},
}) => {
  const [copiedMac, setCopiedMac] = useState(false);
  const [latestData, setLatestData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>("temperature");

  const devId = device?.deviceId || device?.id || "";

  // Fetch telemetry only when drawer is open
  useEffect(() => {
    if (!isOpen || !devId) {
      setLatestData(null);
      setHistoryData([]);
      return;
    }

    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        setTelemetryLoading(true);
        const [latestRes, historyRes] = await Promise.allSettled([
          getLatestTelemetry(devId),
          getTelemetryHistory(devId, { limit: 24 }),
        ]);

        if (!isMounted) return;

        if (latestRes.status === "fulfilled" && latestRes.value?.data) {
          setLatestData(latestRes.value.data);
        } else {
          setLatestData(null);
        }

        if (historyRes.status === "fulfilled" && Array.isArray(historyRes.value?.data)) {
          setHistoryData(historyRes.value.data);
        } else {
          setHistoryData([]);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu telemetry:", err);
      } finally {
        if (isMounted) setTelemetryLoading(false);
      }
    };

    fetchTelemetry();

    return () => {
      isMounted = false;
    };
  }, [isOpen, devId]);

  if (!isOpen || !device) return null;

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

  const pondName = device.pond?.pondName || "Chưa gán ao";
  const farmName =
    device.pond?.farm?.farmName ||
    (device.pond?.farmId && farmMap[device.pond.farmId]) ||
    (device.pondId && farmMap[device.pondId]) ||
    "Chưa gán trại";

  const handleCopy = () => {
    navigator.clipboard.writeText(devCode);
    setCopiedMac(true);
    setTimeout(() => setCopiedMac(false), 2000);
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

  // Metrics to display from telemetry
  const metricsList = [
    {
      key: "ph",
      name: "Độ pH",
      value: latestData?.ph !== undefined ? Number(latestData.ph).toFixed(2) : "—",
      unit: "pH",
      optimal: "7.5 - 8.5",
      color: "text-teal-400",
    },
    {
      key: "dissolvedOxygen",
      name: "Oxy hòa tan (DO)",
      value: latestData?.dissolvedOxygen !== undefined ? Number(latestData.dissolvedOxygen).toFixed(2) : "—",
      unit: "mg/L",
      optimal: "≥ 5.0",
      color: "text-cyan-400",
    },
    {
      key: "temperature",
      name: "Nhiệt độ nước",
      value: latestData?.temperature !== undefined ? Number(latestData.temperature).toFixed(1) : "—",
      unit: "°C",
      optimal: "28 - 32",
      color: "text-amber-400",
    },
    {
      key: "salinity",
      name: "Độ mặn",
      value: latestData?.salinity !== undefined ? Number(latestData.salinity).toFixed(1) : "—",
      unit: "‰",
      optimal: "15 - 25",
      color: "text-indigo-400",
    },
  ];

  // Prepare trend data points for selected metric
  const trendPoints = historyData
    .map((item) => Number(item[selectedMetric]))
    .filter((v) => !isNaN(v) && v !== null);

  const minVal = trendPoints.length > 0 ? Math.min(...trendPoints) : 0;
  const maxVal = trendPoints.length > 0 ? Math.max(...trendPoints) : 10;
  const range = maxVal - minVal || 1;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn text-left">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg lg:max-w-xl bg-[#061b24] border-l border-cyan-800/40 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar animate-slideLeft">
          {/* Header Section */}
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-[var(--divider)] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#041920] border border-cyan-500/30 shadow-inner">
                  {getDeviceIcon(typeInfo.key)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white line-clamp-1" title={devName}>
                    {devName}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-cyan-400">
                      {devCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1 rounded-md text-slate-400 hover:text-white transition cursor-pointer"
                      title="Sao chép MAC"
                    >
                      {copiedMac ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-2xl border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status & Category Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${conn.badgeClass}`}
              >
                <span className={`h-2 w-2 rounded-full ${conn.dotClass}`} />
                <span>{conn.label}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cond.badgeClass}`}
              >
                <span className={`h-2 w-2 rounded-full ${cond.dotClass}`} />
                <span>{cond.label}</span>
              </span>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${typeInfo.badgeClass}`}
              >
                {typeInfo.label}
              </span>
            </div>

            {/* Location & Assignment Card */}
            <div className="p-4 rounded-3xl bg-[#041920] border border-[var(--panel-border)] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Building2 size={14} className="text-purple-400" />
                <span>Vị trí gán thiết bị</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[11px] text-[var(--text-subtle)]">Trại nuôi:</div>
                  <div className="font-semibold text-white mt-0.5">{farmName}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-subtle)]">Ao nuôi:</div>
                  <div className="font-semibold text-cyan-300 mt-0.5">{pondName}</div>
                </div>
              </div>
            </div>

            {/* Hardware & Specs Card */}
            <div className="p-4 rounded-3xl bg-[#041920] border border-[var(--panel-border)] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Cpu size={14} className="text-sky-400" />
                <span>Thông số kỹ thuật & Kết nối</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-[11px] text-[var(--text-subtle)]">Firmware:</div>
                  <div className="font-mono text-slate-200 mt-0.5">
                    {device.firmwareVersion || "v1.0.0"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-subtle)]">Phương thức:</div>
                  <div className="text-slate-200 mt-0.5">
                    {device.connection_type || "Wi-Fi / MQTT"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--text-subtle)]">Lần hoạt động:</div>
                  <div className="text-slate-200 mt-0.5 truncate" title={lastActive.full}>
                    {lastActive.relative}
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Telemetry Readings */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Activity size={14} className="text-teal-400" />
                  <span>Chỉ số đo đạc mới nhất</span>
                </div>
                {telemetryLoading && (
                  <RefreshCw size={13} className="text-cyan-400 animate-spin" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {metricsList.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedMetric(m.key)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedMetric === m.key
                        ? "border-cyan-400 bg-cyan-950/40 shadow-sm"
                        : "border-[var(--panel-border)] bg-[#041920] hover:border-slate-600"
                    }`}
                  >
                    <div className="text-[11px] text-[var(--text-subtle)] font-medium">
                      {m.name}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className={`text-xl font-bold font-mono ${m.color}`}>
                        {m.value}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {m.unit}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-[var(--text-subtle)]">
                      Tối ưu: {m.optimal}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Telemetry Trend Chart */}
            <div className="p-4 rounded-3xl bg-[#041920] border border-[var(--panel-border)] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-cyan-400" />
                  <span>
                    Xu hướng 24h: {metricsList.find((m) => m.key === selectedMetric)?.name}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--text-subtle)]">
                  {trendPoints.length} điểm đo
                </span>
              </div>

              {trendPoints.length > 1 ? (
                <div className="h-28 w-full flex items-end pt-3">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                    {/* SVG Sparkline Area */}
                    <defs>
                      <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Area polygon */}
                    <polygon
                      points={`0,50 ${trendPoints
                        .map((pt, i) => {
                          const x = (i / (trendPoints.length - 1)) * 100;
                          const y = 48 - ((pt - minVal) / range) * 44;
                          return `${x},${y}`;
                        })
                        .join(" ")} 100,50`}
                      fill="url(#gradient-area)"
                    />
                    {/* Trend Line */}
                    <polyline
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      points={trendPoints
                        .map((pt, i) => {
                          const x = (i / (trendPoints.length - 1)) * 100;
                          const y = 48 - ((pt - minVal) / range) * 44;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  </svg>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-xs text-[var(--text-subtle)]">
                  Chưa có đủ lịch sử chuỗi thời gian cho chỉ số này.
                </div>
              )}
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="pt-6 border-t border-[var(--divider)] mt-6 flex flex-col gap-2.5">
            {/* Báo cáo sự cố Button (Tất cả vai trò) */}
            {onReportFault && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReportFault(device);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <AlertTriangle size={15} />
                <span>Báo cáo sự cố thiết bị</span>
              </button>
            )}

            {/* Sửa & Xóa Buttons (Manager, Admin) */}
            {canManage && (
              <div className="grid grid-cols-2 gap-2.5">
                {onEditDevice && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditDevice(device);
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-[var(--panel-border)] bg-[#041a22] hover:bg-cyan-950/50 hover:text-cyan-300 text-slate-200 font-semibold text-xs transition cursor-pointer"
                  >
                    <Edit3 size={14} />
                    <span>Chỉnh sửa</span>
                  </button>
                )}

                {onDeleteDevice && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDeleteDevice(device);
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-rose-500/20 bg-rose-950/20 hover:bg-rose-950/60 text-rose-400 font-semibold text-xs transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Xóa thiết bị</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailDrawer;
