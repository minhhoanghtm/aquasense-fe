import type { Devices } from "../../types/Devices";
import { formatVietnamDateTime } from "../../utils/date";

export type DeviceTypeKey =
  | "gateway"
  | "do_sensor"
  | "ph_sensor"
  | "controller"
  | "esp32_node";

export interface DeviceTypeInfo {
  key: DeviceTypeKey;
  label: string;
  shortLabel: string;
  badgeClass: string;
}

export const DEVICE_TYPES: { value: string; label: string }[] = [
  { value: "ALL", label: "Tất cả loại thiết bị" },
  { value: "gateway", label: "Trạm quan trắc (Gateway)" },
  { value: "do_sensor", label: "Cảm biến Oxy hòa tan (DO)" },
  { value: "ph_sensor", label: "Cảm biến pH môi trường" },
  { value: "controller", label: "Bộ điều khiển / Quạt nước" },
  { value: "esp32_node", label: "Node cảm biến ESP32" },
];

export const getDeviceTypeInfo = (device: Devices): DeviceTypeInfo => {
  const nameLower = (
    (device.name || device.deviceName || "") +
    " " +
    (device.macAddress || "") +
    " " +
    (device.node_code || "")
  ).toLowerCase();

  if (
    nameLower.includes("gateway") ||
    nameLower.includes("trạm") ||
    nameLower.includes("station") ||
    nameLower.includes("central")
  ) {
    return {
      key: "gateway",
      label: "Trạm quan trắc (Gateway)",
      shortLabel: "Trạm quan trắc",
      badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    };
  }

  if (
    nameLower.includes("do") ||
    nameLower.includes("oxy") ||
    nameLower.includes("oxygen")
  ) {
    return {
      key: "do_sensor",
      label: "Cảm biến Oxy hòa tan (DO)",
      shortLabel: "Cảm biến DO",
      badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    };
  }

  if (nameLower.includes("ph")) {
    return {
      key: "ph_sensor",
      label: "Cảm biến pH môi trường",
      shortLabel: "Cảm biến pH",
      badgeClass: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    };
  }

  if (
    nameLower.includes("quạt") ||
    nameLower.includes("aerator") ||
    nameLower.includes("pump") ||
    nameLower.includes("bơm") ||
    nameLower.includes("feed") ||
    nameLower.includes("điều khiển") ||
    nameLower.includes("relay")
  ) {
    return {
      key: "controller",
      label: "Bộ điều khiển quạt nước / Phụ trợ",
      shortLabel: "Bộ điều khiển",
      badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    };
  }

  return {
    key: "esp32_node",
    label: "Node cảm biến ESP32",
    shortLabel: "ESP32 Node",
    badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  };
};

export const getConnectionStatus = (status?: string | null) => {
  const norm = (status || "").toUpperCase();
  const isOnline = norm === "ONLINE" || norm === "ACTIVE" || norm === "TRỰC TUYẾN";
  return {
    isOnline,
    label: isOnline ? "Trực tuyến" : "Ngoại tuyến",
    badgeClass: isOnline
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-slate-700/40 text-slate-400 border-slate-700/60",
    dotClass: isOnline ? "bg-emerald-400" : "bg-slate-500",
  };
};

export type DeviceCondition = "NORMAL" | "WARNING" | "MAINTENANCE";

export const getDeviceCondition = (
  status?: string | null,
  signal?: number,
  battery?: number
): { condition: DeviceCondition; label: string; badgeClass: string; dotClass: string } => {
  const norm = (status || "").toUpperCase();

  if (
    norm === "MAINTENANCE" ||
    norm === "BẢO TRÌ" ||
    norm === "ĐANG BẢO TRÌ" ||
    norm === "HỎNG" ||
    norm === "FAULTY"
  ) {
    return {
      condition: "MAINTENANCE",
      label: "Đang bảo trì",
      badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/40",
      dotClass: "bg-rose-400",
    };
  }

  if (
    norm === "WARNING" ||
    norm === "CẢNH BÁO" ||
    (typeof signal === "number" && signal < 20) ||
    (typeof battery === "number" && battery < 20)
  ) {
    return {
      condition: "WARNING",
      label: "Cảnh báo / Pin yếu",
      badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
      dotClass: "bg-amber-400",
    };
  }

  return {
    condition: "NORMAL",
    label: "Bình thường",
    badgeClass: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    dotClass: "bg-teal-400",
  };
};

export const formatLastActiveTime = (timestamp?: string | null) => {
  if (!timestamp) return { relative: "Chưa nhận dữ liệu", full: "Chưa có bản ghi" };

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return { relative: "Không xác định", full: "Thời gian không hợp lệ" };
  }

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  let relative = "";
  if (diffSec < 60) relative = "Vừa xong";
  else if (diffSec < 3600) relative = `${Math.floor(diffSec / 60)} phút trước`;
  else if (diffSec < 86400) relative = `${Math.floor(diffSec / 3600)} giờ trước`;
  else if (diffSec < 86400 * 7) relative = `${Math.floor(diffSec / 86400)} ngày trước`;
  else relative = formatVietnamDateTime(date);

  return {
    relative,
    full: formatVietnamDateTime(date),
  };
};
