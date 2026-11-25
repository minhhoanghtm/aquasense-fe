import type { Devices } from "../types/Devices";
import { api } from "./api";
import {
  unwrapLatestTelemetryResponse,
  type LatestTelemetryRecord,
} from "./telemetryResponse";
import { assertBackendPondId } from "../utils/uuid";

export { unwrapLatestTelemetryResponse };
export type { LatestTelemetryRecord };

export interface CreateDevicePayload {
  deviceName: string;
  macAddress: string;
  pondId: string;
  firmwareVersion?: string;
  status?: string;
}

export interface UpdateDevicePayload {
  deviceName?: string;
  macAddress?: string;
  pondId?: string;
  firmwareVersion?: string;
  status?: string;
}

const normalizeDevice = (d: any): Devices => ({
  ...d,
  id: d.deviceId || d.id,
  deviceId: d.deviceId || d.id,
  name: d.deviceName || d.name || "",
  deviceName: d.deviceName || d.name || "",
  macAddress: d.macAddress || "",
  pondId: d.pondId || "",
  firmwareVersion: d.firmwareVersion ?? null,
  status: d.status || "",
  lastActiveAt: d.lastActiveAt ?? null,
  sensors: Array.isArray(d.sensors) ? d.sensors : [],
  connection_type: d.connection_type || "",
  signal_strength: d.signal_strength ?? undefined,
});

export const getDevices = async (
  query: { pondId?: string; status?: string; search?: string; page?: number; limit?: number } = {}
): Promise<Devices[]> => {
  if (query.pondId !== undefined) {
    assertBackendPondId(query.pondId);
  }

  // Backend enforces @Max(100) per page on FindDevicesQueryDto
  const safeLimit = Math.min(Math.max(query.limit ?? 100, 1), 100);
  const params = new URLSearchParams({ limit: String(safeLimit) });
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== "limit") {
      params.set(key, String(value));
    }
  });
  const res = await api<any>(`/devices?${params.toString()}`);
  let rawList = Array.isArray(res) ? res : res?.data || [];

  // If query did not specify a specific page and there are multiple pages, load all pages
  if (!query.page && res?.totalPages && res.totalPages > 1) {
    const remainingPromises = [];
    for (let p = 2; p <= res.totalPages; p++) {
      const nextParams = new URLSearchParams(params);
      nextParams.set("page", String(p));
      remainingPromises.push(api<any>(`/devices?${nextParams.toString()}`));
    }
    const additionalPages = await Promise.all(remainingPromises);
    for (const pageRes of additionalPages) {
      const pageData = Array.isArray(pageRes) ? pageRes : pageRes?.data || [];
      rawList = rawList.concat(pageData);
    }
  }

  return rawList.map(normalizeDevice);
};

export const getDevicesByPondId = async (pondId: string): Promise<Devices[]> => {
  assertBackendPondId(pondId);
  return getDevices({ pondId });
};

export const getDeviceById = async (id: string): Promise<Devices | null> => {
  const res = await api<any>(`/devices/${id}`);
  const d = res?.data || res;
  return d ? normalizeDevice(d) : null;
};

export const createDevice = async (payload: CreateDevicePayload): Promise<Devices> => {
  const res = await api<{ message: string; data: any }>("/devices", {
    method: "POST",
    body: JSON.stringify({
      deviceName: payload.deviceName.trim(),
      macAddress: payload.macAddress.trim(),
      pondId: payload.pondId,
      firmwareVersion: payload.firmwareVersion?.trim() || "v1.0.0",
      status: payload.status || "ONLINE",
    }),
  });
  return normalizeDevice(res.data || res);
};

export const updateDevice = async (id: string, payload: UpdateDevicePayload): Promise<Devices> => {
  const body: Record<string, any> = {};
  if (payload.deviceName !== undefined) body.deviceName = payload.deviceName.trim();
  if (payload.macAddress !== undefined) body.macAddress = payload.macAddress.trim();
  if (payload.pondId !== undefined) body.pondId = payload.pondId;
  if (payload.firmwareVersion !== undefined) body.firmwareVersion = payload.firmwareVersion.trim();
  if (payload.status !== undefined) body.status = payload.status;

  const res = await api<{ message: string; data: any }>(`/devices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return normalizeDevice(res.data || res);
};

export const deleteDevice = async (id: string): Promise<boolean> => {
  await api<any>(`/devices/${id}`, {
    method: "DELETE",
  });
  return true;
};

/**
 * Gán hoặc gỡ thiết bị IoT khỏi ao nuôi
 * PATCH /devices/:id/pond
 */
export const assignDeviceToPond = async (deviceId: string, pondId: string | null): Promise<Devices> => {
  const res = await api<{ message: string; data: any }>(`/devices/${deviceId}/pond`, {
    method: "PATCH",
    body: JSON.stringify({ pondId }),
  });
  return normalizeDevice(res.data || res);
};

/**
 * Cập nhật trạng thái hoạt động của thiết bị IoT
 * PATCH /devices/:id/status
 */
export const updateDeviceStatus = async (
  deviceId: string,
  status: "ONLINE" | "OFFLINE" | "MAINTENANCE"
): Promise<Devices> => {
  const res = await api<{ message: string; data: any }>(`/devices/${deviceId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return normalizeDevice(res.data || res);
};

export interface ReportDeviceFaultPayload {
  reason: string;
  note?: string;
}

/**
 * Báo cáo thiết bị IoT bị sự cố / hư hỏng (Nông dân, Quản lý, Quản trị viên)
 * POST /devices/:id/report-fault
 */
export const reportDeviceFault = async (
  deviceId: string,
  payload?: string | ReportDeviceFaultPayload
): Promise<Devices> => {
  let reasonText: string | undefined;
  if (typeof payload === "string") {
    reasonText = payload.trim();
  } else if (payload) {
    reasonText = payload.note
      ? `${payload.reason.trim()}. Ghi chú: ${payload.note.trim()}`
      : payload.reason.trim();
  }
  const res = await api<{ message: string; data: any }>(`/devices/${deviceId}/report-fault`, {
    method: "POST",
    body: JSON.stringify({ reason: reasonText || undefined }),
  });
  return normalizeDevice(res.data || res);
};

export const reportBrokenDevice = reportDeviceFault;

/**
 * Lấy chỉ số đo đạc mới nhất của thiết bị
 * GET /telemetry/device/:deviceId/latest
 */
export const getLatestTelemetry = async (
  deviceId: string
): Promise<LatestTelemetryRecord | null> => {
  const res = await api<unknown>(`/telemetry/device/${deviceId}/latest`);
  return unwrapLatestTelemetryResponse(res);
};

/**
 * Lấy lịch sử chỉ số đo đạc của thiết bị (phân trang và lọc thời gian)
 * GET /telemetry/device/:deviceId/history
 */
export const getTelemetryHistory = async (
  deviceId: string,
  query: { page?: number; limit?: number; startDate?: string; endDate?: string } = {}
) => {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);

  return api<{ total: number; page: number; limit: number; totalPages?: number; success?: boolean; data: any[] }>(
    `/telemetry/device/${deviceId}/history?${params.toString()}`
  );
};
