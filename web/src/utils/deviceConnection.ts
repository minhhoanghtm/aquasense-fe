import type { Devices, DeviceStatus } from "../types/Devices";

export type ConnectionPresentation = {
  status: DeviceStatus;
  label: string;
  colorClass: string;
  dotClass: string;
};

const normalizeStatus = (status?: string | null): DeviceStatus => {
  switch (status?.trim().toUpperCase()) {
    case "ONLINE":
    case "ACTIVE": // Backward compatibility for older API deployments.
      return "ONLINE";
    case "OFFLINE":
      return "OFFLINE";
    case "MAINTENANCE":
      return "MAINTENANCE";
    default:
      return "UNKNOWN";
  }
};

/**
 * Produces one pond-level status from the statuses confirmed by the backend.
 * A pond remains usable if at least one of its devices is ONLINE. If none is
 * online, MAINTENANCE takes precedence over OFFLINE; missing data is UNKNOWN.
 */
export const getPondConnectionStatus = (devices: Devices[]): ConnectionPresentation => {
  const statuses = devices.map((device) => normalizeStatus(device.status));
  const status: DeviceStatus = statuses.includes("ONLINE")
    ? "ONLINE"
    : statuses.includes("MAINTENANCE")
      ? "MAINTENANCE"
      : statuses.includes("OFFLINE")
        ? "OFFLINE"
        : "UNKNOWN";

  switch (status) {
    case "ONLINE":
      return { status, label: "Đã kết nối", colorClass: "text-[var(--success)]", dotClass: "bg-[var(--success)]" };
    case "OFFLINE":
      return { status, label: "Mất kết nối", colorClass: "text-[var(--critical)]", dotClass: "bg-[var(--critical)]" };
    case "MAINTENANCE":
      return { status, label: "Đang bảo trì", colorClass: "text-amber-400", dotClass: "bg-amber-400" };
    default:
      return { status, label: "Chưa xác định", colorClass: "text-[var(--text-muted)]", dotClass: "bg-[var(--text-muted)]" };
  }
};
