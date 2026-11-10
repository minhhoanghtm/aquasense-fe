import React, { useState } from "react";
import {
  Radio,
  Wind,
  Droplets,
  Cpu,
  Activity,
  MoreVertical,
  Edit3,
  Trash2,
  AlertTriangle,
  Eye,
  Copy,
  Check,
  Building2,
  Layers,
} from "lucide-react";
import type { Devices } from "../../types/Devices";
import {
  getDeviceTypeInfo,
  getConnectionStatus,
  getDeviceCondition,
  formatLastActiveTime,
} from "./deviceUtils";

interface DeviceTableViewProps {
  devices: Devices[];
  loading?: boolean;
  canManage?: boolean;
  onViewDetail: (device: Devices) => void;
  onEditDevice?: (device: Devices) => void;
  onDeleteDevice?: (device: Devices) => void;
  onReportFault?: (device: Devices) => void;
  farmMap?: Record<string, string>;
}

export const DeviceTableView: React.FC<DeviceTableViewProps> = ({
  devices,
  loading = false,
  canManage = false,
  onViewDetail,
  onEditDevice,
  onDeleteDevice,
  onReportFault,
  farmMap = {},
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
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
        return <Radio className="w-4 h-4 text-indigo-400" />;
      case "do_sensor":
        return <Wind className="w-4 h-4 text-cyan-400" />;
      case "ph_sensor":
        return <Droplets className="w-4 h-4 text-teal-400" />;
      case "controller":
        return <Activity className="w-4 h-4 text-purple-400" />;
      default:
        return <Cpu className="w-4 h-4 text-sky-400" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/80 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#051a24] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--divider)]">
              <tr>
                <th className="py-3.5 px-4">Thiết bị</th>
                <th className="py-3.5 px-4">Mã thiết bị</th>
                <th className="py-3.5 px-4">Trại nuôi</th>
                <th className="py-3.5 px-4">Ao nuôi</th>
                <th className="py-3.5 px-4">Loại</th>
                <th className="py-3.5 px-4">Kết nối</th>
                <th className="py-3.5 px-4">Tình trạng</th>
                <th className="py-3.5 px-4">Cập nhật cuối</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--divider)]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-700/50" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 bg-slate-700/50 rounded" />
                        <div className="h-2.5 w-20 bg-slate-800/60 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><div className="h-3 w-28 bg-slate-700/50 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-3 w-24 bg-slate-700/50 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-3 w-20 bg-slate-700/50 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-700/50 rounded-full" /></td>
                  <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-700/50 rounded-full" /></td>
                  <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-700/50 rounded-full" /></td>
                  <td className="py-4 px-4"><div className="h-3 w-20 bg-slate-700/50 rounded" /></td>
                  <td className="py-4 px-4 text-right"><div className="h-6 w-12 bg-slate-700/50 rounded ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className="w-full rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/90 backdrop-blur-md shadow-xl text-left overflow-visible">
      <div className="overflow-x-auto rounded-3xl custom-scrollbar overflow-y-visible">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 z-10 bg-[#051c25] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--divider)]">
            <tr>
              <th className="py-3.5 px-4">Thiết bị</th>
              <th className="py-3.5 px-4">Mã thiết bị</th>
              <th className="py-3.5 px-4 hidden md:table-cell">Trại nuôi</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">Ao nuôi</th>
              <th className="py-3.5 px-4 hidden lg:table-cell">Loại</th>
              <th className="py-3.5 px-4">Kết nối</th>
              <th className="py-3.5 px-4">Tình trạng</th>
              <th className="py-3.5 px-4 hidden xl:table-cell">Cập nhật cuối</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[var(--divider)]">
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

              const isMenuOpen = activeMenuId === devId;

              return (
                <tr
                  key={devId}
                  onClick={() => onViewDetail(device)}
                  className="hover:bg-[#072530]/80 transition-colors cursor-pointer group"
                >
                  {/* Cột 1: Thiết bị */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#041920] border border-[var(--panel-border)] group-hover:border-cyan-500/40 transition-colors">
                        {getDeviceIcon(typeInfo.key)}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate max-w-[180px] sm:max-w-[220px]"
                          title={devName}
                        >
                          {devName}
                        </div>
                        <div className="text-[11px] text-[var(--text-subtle)] font-medium">
                          {device.firmwareVersion || "v1.0.0"}
                          {device.connection_type ? ` · ${device.connection_type}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Mã thiết bị */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
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
                  </td>

                  {/* Cột 3: Trại nuôi */}
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-[var(--text-muted)] truncate max-w-[130px]">
                      <Building2 size={12} className="shrink-0 text-slate-500" />
                      <span className="truncate">{farmName}</span>
                    </div>
                  </td>

                  {/* Cột 4: Ao nuôi */}
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-[var(--text-muted)] truncate max-w-[130px]">
                      <Layers size={12} className="shrink-0 text-slate-500" />
                      <span className="truncate">{pondName}</span>
                    </div>
                  </td>

                  {/* Cột 5: Loại thiết bị */}
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${typeInfo.badgeClass}`}
                    >
                      {typeInfo.shortLabel}
                    </span>
                  </td>

                  {/* Cột 6: Trạng thái Kết nối */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${conn.badgeClass}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${conn.dotClass}`} />
                      <span>{conn.label}</span>
                    </span>
                  </td>

                  {/* Cột 7: Tình trạng Phần cứng */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cond.badgeClass}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${cond.dotClass}`} />
                      <span>{cond.label}</span>
                    </span>
                  </td>

                  {/* Cột 8: Cập nhật cuối */}
                  <td className="py-3.5 px-4 hidden xl:table-cell">
                    <div className="text-[11px] text-[var(--text-muted)]" title={lastActive.full}>
                      {lastActive.relative}
                    </div>
                  </td>

                  {/* Cột 9: Thao tác */}
                  <td
                    className="py-3.5 px-4 text-right relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {/* Xem chi tiết Button */}
                      <button
                        type="button"
                        onClick={() => onViewDetail(device)}
                        className="p-1.5 rounded-xl border border-[var(--panel-border)] bg-[#041920] text-[var(--text-muted)] hover:text-cyan-300 hover:border-cyan-500/40 transition cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <Eye size={13} />
                      </button>

                      {/* Báo hỏng Button (Cho mọi vai trò) */}
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

                      {/* Menu 3 chấm nếu có quyền sửa/xóa */}
                      {canManage && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(isMenuOpen ? null : devId)
                            }
                            className="p-1.5 rounded-xl border border-[var(--panel-border)] bg-[#041920] text-[var(--text-muted)] hover:text-white hover:border-slate-500 transition cursor-pointer"
                            title="Thao tác khác"
                          >
                            <MoreVertical size={13} />
                          </button>

                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-2xl border border-[var(--panel-border)] bg-[#041a22] shadow-2xl py-1 text-xs text-left animate-fadeIn">
                                {onEditDevice && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onEditDevice(device);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-cyan-950/60 hover:text-cyan-300 transition cursor-pointer"
                                  >
                                    <Edit3 size={13} />
                                    <span>Chỉnh sửa thiết bị</span>
                                  </button>
                                )}

                                {onDeleteDevice && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onDeleteDevice(device);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-300 hover:bg-rose-950/50 transition cursor-pointer border-t border-[var(--divider)]"
                                  >
                                    <Trash2 size={13} />
                                    <span>Xóa thiết bị</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceTableView;
