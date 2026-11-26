// services/pondApi.ts

import type { Pond, PondStatus, PondWithDevices } from "../types/Pond";
import type { Devices } from "../types/Devices";
import type { SensorReading } from "../types/SensorReading";
import { api } from "./api";
import { getDevices, getDevicesByPondId } from "./deviceApi";
import { assertBackendPondId } from "../utils/uuid";

export interface ThresholdConfigItem {
  configId: string;
  pondId: string;
  metricName: string;
  minValue: number;
  maxValue: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManualTestLogItem {
  logId: string;
  pondId: string;
  testedById: string;
  nh3Value: number;
  no2Value: number;
  note?: string;
  testedAt: string;
  createdAt?: string;
  updatedAt?: string;
  testedBy?: {
    fullName?: string;
    phoneNumber?: string;
  };
}

export interface CreatePondPayload {
  pondName: string;
  areaM2: number;
  depthM: number;
  shrimpDensity: number;
  farmId?: string | null;
  location?: string;
  capacity?: number;
  status?: PondStatus;
  userId?: string;
}

export interface UpdatePondPayload {
  pondName?: string;
  areaM2?: number;
  depthM?: number;
  shrimpDensity?: number;
  farmId?: string | null;
  location?: string;
  capacity?: number;
  status?: PondStatus;
  userId?: string;
}

const normalizePond = (p: Pond): Pond => ({
  ...p,
  id: p.pondId || p.id,
  pondId: p.pondId || p.id,
  name: p.pondName || p.name || "",
  pondName: p.pondName || p.name || "",
  area: p.areaM2 !== undefined ? Number(p.areaM2) / 10000 : p.area,
  areaM2: p.areaM2 !== undefined ? p.areaM2 : p.area !== undefined ? Number(p.area) * 10000 : undefined,
  depthM: p.depthM,
  shrimpDensity: p.shrimpDensity,
  location: p.location,
  capacity: p.capacity,
  density: p.density || (p.shrimpDensity !== undefined ? `${p.shrimpDensity} PL/m²` : undefined),
  status: p.status || "",
  userId: p.userId,
  farmId: p.farmId,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

// 1. POND CRUD
export const getPonds = async (): Promise<Pond[]> =>
  (await getPondsPage({ limit: 100 })).data;

export interface PaginatedPonds {
  data: Pond[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PondListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PondStatus;
  userId?: string;
  farmId?: string;
}

export const getPondsPage = async (
  query: PondListQuery = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedPonds> => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const response = await api<{ data: Pond[]; total: number; page: number; limit: number; totalPages: number }>(
    `/ponds?${params.toString()}`,
    options?.signal ? { signal: options.signal } : undefined,
  );
  return { ...response, data: response.data.map((pond) => normalizePond(pond)) };
};

export const getAllPondsPage = async (
  query: Omit<PondListQuery, "page" | "limit"> = {},
  options?: { signal?: AbortSignal },
): Promise<PaginatedPonds> => {
  const firstPage = await getPondsPage({ ...query, page: 1, limit: 100 }, options);
  if (firstPage.totalPages <= 1) return firstPage;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getPondsPage({ ...query, page: index + 2, limit: 100 }, options),
    ),
  );

  return {
    ...firstPage,
    data: [firstPage, ...remainingPages].flatMap((page) => page.data),
  };
};

export const getPondById = async (pondId: string, options?: { signal?: AbortSignal }): Promise<Pond> => {
  assertBackendPondId(pondId);
  return normalizePond(await api<Pond>(`/ponds/${pondId}`, options?.signal ? { signal: options.signal } : undefined));
};

export const createPond = async (payload: CreatePondPayload): Promise<Pond> => {
  const res = await api<{ data: Pond }>("/ponds", {
    method: "POST",
    body: JSON.stringify({
      pondName: payload.pondName.trim(),
      areaM2: Number(payload.areaM2),
      depthM: Number(payload.depthM),
      shrimpDensity: Number(payload.shrimpDensity),
      ...(payload.farmId ? { farmId: payload.farmId } : {}),
      ...(payload.location ? { location: payload.location.trim() } : {}),
      ...(payload.capacity !== undefined ? { capacity: Number(payload.capacity) } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.userId ? { userId: payload.userId } : {}),
    }),
  });
  return normalizePond(res.data);
};

export const updatePond = async (pondId: string, payload: UpdatePondPayload): Promise<Pond> => {
  if (!pondId) throw new Error("ID vuông nuôi không hợp lệ");
  const body: UpdatePondPayload = {};
  if (payload.pondName !== undefined) body.pondName = payload.pondName.trim();
  if (payload.areaM2 !== undefined) body.areaM2 = Number(payload.areaM2);
  if (payload.depthM !== undefined) body.depthM = Number(payload.depthM);
  if (payload.shrimpDensity !== undefined) body.shrimpDensity = Number(payload.shrimpDensity);
  if (payload.farmId !== undefined) body.farmId = payload.farmId;
  if (payload.location !== undefined) body.location = payload.location.trim();
  if (payload.capacity !== undefined) body.capacity = Number(payload.capacity);
  if (payload.status !== undefined) body.status = payload.status;
  if (payload.userId !== undefined) body.userId = payload.userId;

  const res = await api<{ data: Pond }>(`/ponds/${pondId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return normalizePond(res.data);
};

export const deletePond = async (pondId: string): Promise<boolean> => {
  if (!pondId) throw new Error("ID vuông nuôi không hợp lệ");
  await api<null>(`/ponds/${pondId}`, {
    method: "DELETE",
  });
  return true;
};

export const assignPondToUser = async (pondId: string, userId: string): Promise<any> => {
  try {
    return await api(`/ponds/${pondId}/farmers`, {
      method: "POST",
      body: JSON.stringify({ farmerId: userId }),
    });
  } catch (err: any) {
    // Nếu nông dân đã được phân công (409 Conflict), bỏ qua lỗi conflict
    if (err?.message?.includes("đã được phân công") || err?.message?.includes("Conflict") || err?.status === 409) {
      return null;
    }
    throw err;
  }
};

export const revokePondFromUser = async (pondId: string, userId: string): Promise<any> => {
  return await api(`/ponds/${pondId}/farmers/${userId}`, {
    method: "DELETE",
  });
};

// 2. THRESHOLD CONFIGS
export const getThresholdConfigs = async (
  pondId: string,
  options?: { signal?: AbortSignal },
): Promise<ThresholdConfigItem[]> => {
  return api<ThresholdConfigItem[]>(`/ponds/${pondId}/thresholds`, options?.signal ? { signal: options.signal } : undefined);
};

export const createThresholdConfig = async (
  pondId: string,
  dto: { metricName: string; minValue: number; maxValue: number; isActive?: boolean }
): Promise<ThresholdConfigItem> => {
  const res = await api<{ data: ThresholdConfigItem }>(`/ponds/${pondId}/thresholds`, {
    method: "POST",
    body: JSON.stringify({
      metricName: dto.metricName,
      minValue: Number(dto.minValue),
      maxValue: Number(dto.maxValue),
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    }),
  });
  return res.data;
};

export const updateThresholdConfig = async (
  configId: string,
  dto: { metricName?: string; minValue?: number; maxValue?: number; isActive?: boolean }
): Promise<ThresholdConfigItem> => {
  const body: { metricName?: string; minValue?: number; maxValue?: number; isActive?: boolean } = {};
  if (dto.metricName !== undefined) body.metricName = dto.metricName;
  if (dto.minValue !== undefined) body.minValue = Number(dto.minValue);
  if (dto.maxValue !== undefined) body.maxValue = Number(dto.maxValue);
  if (dto.isActive !== undefined) body.isActive = dto.isActive;

  const res = await api<{ data: ThresholdConfigItem }>(`/ponds/thresholds/${configId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.data;
};

export const deleteThresholdConfig = async (configId: string): Promise<boolean> => {
  await api<null>(`/ponds/thresholds/${configId}`, {
    method: "DELETE",
  });
  return true;
};

// 3. MANUAL TEST LOGS (Đo khí độc NH3, NO2 thủ công)
export const getManualTestLogsPage = async (pondId: string, query: { page?: number; limit?: number; startDate?: string; endDate?: string } = {}): Promise<{ data: ManualTestLogItem[]; total: number; page: number; limit: number; totalPages: number }> => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const res = await api<{ data: ManualTestLogItem[]; total: number; page: number; limit: number; totalPages: number }>(`/ponds/${pondId}/manual-logs?${params.toString()}`);
  return res;
};

export const getManualTestLogs = async (pondId: string): Promise<ManualTestLogItem[]> =>
  (await getManualTestLogsPage(pondId, { limit: 100 })).data;

export const getManualTestLogById = async (logId: string): Promise<ManualTestLogItem> => {
  if (!logId) throw new Error("ID bản ghi không hợp lệ");
  return api<ManualTestLogItem>(`/ponds/manual-logs/${logId}`);
};

export const createManualTestLog = async (
  pondId: string,
  dto: { nh3Value: number; no2Value: number; note?: string; testedAt?: string }
): Promise<ManualTestLogItem> => {
  const res = await api<{ data: ManualTestLogItem }>(`/ponds/${pondId}/manual-logs`, {
    method: "POST",
    body: JSON.stringify({
      nh3Value: Number(dto.nh3Value),
      no2Value: Number(dto.no2Value),
      note: dto.note?.trim() || undefined,
      testedAt: dto.testedAt || new Date().toISOString(),
    }),
  });
  return res.data;
};

export const updateManualTestLog = async (
  logId: string,
  dto: { nh3Value?: number; no2Value?: number; note?: string; testedAt?: string }
): Promise<ManualTestLogItem> => {
  const body: { nh3Value?: number; no2Value?: number; note?: string; testedAt?: string } = {};
  if (dto.nh3Value !== undefined) body.nh3Value = Number(dto.nh3Value);
  if (dto.no2Value !== undefined) body.no2Value = Number(dto.no2Value);
  if (dto.note !== undefined) body.note = dto.note.trim();
  if (dto.testedAt !== undefined) body.testedAt = dto.testedAt;

  const res = await api<{ data: ManualTestLogItem }>(`/ponds/manual-logs/${logId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.data;
};

export const deleteManualTestLog = async (logId: string): Promise<boolean> => {
  await api<null>(`/ponds/manual-logs/${logId}`, {
    method: "DELETE",
  });
  return true;
};

// 4. COMBINED & LEGACY HELPERS
export const getPondsWithDevices = async (): Promise<PondWithDevices[]> => {
  const [ponds, allDevices] = await Promise.all([
    getPonds(),
    getDevices().catch(() => []),
  ]);
  const deviceMap = new Map<string, Devices[]>();
  allDevices.forEach((d) => {
    if (d.pondId) {
      if (!deviceMap.has(d.pondId)) deviceMap.set(d.pondId, []);
      deviceMap.get(d.pondId)!.push(d);
    }
  });
  return ponds.map((pond) => ({
    ...pond,
    devices: pond.id ? (deviceMap.get(pond.id) || []) : [],
  }));
};

export const getSensorReadings = async (
  pondId: string,
  options?: { signal?: AbortSignal },
): Promise<SensorReading[]> => {
  assertBackendPondId(pondId);
  const devices = await getDevicesByPondId(pondId, options);
  if (!devices || devices.length === 0) return [];

  // Giới hạn tối đa 3 thiết bị tiêu biểu đang Online (hoặc 3 thiết bị đầu tiên) để tránh quá tải request song song
  const onlineDevices = devices.filter((d) => d.status?.toUpperCase() === "ONLINE" || d.status?.toUpperCase() === "ACTIVE");
  const targetDevices = (onlineDevices.length > 0 ? onlineDevices : devices).slice(0, 3);

  const histories = await Promise.all(
    targetDevices.map(async (device) => {
      const res = await api<any>(
        `/telemetry/device/${device.id}/history?limit=500`,
        options?.signal ? { signal: options.signal } : undefined,
      );
      const rawData = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
      return rawData.map((record: any) => ({
        ...record,
        id: String(record.id ?? record.telemetryId ?? ""),
        pondId,
        deviceId: record.deviceId || device.id,
        timestamp: record.recordedAt || record.timestamp,
        metrics: [
          { name: "temperature", value: record.temperature, unit: "°C" },
          { name: "pH", value: record.ph, unit: "" },
          { name: "dissolvedOxygen", value: record.dissolvedOxygen, unit: "mg/L" },
          { name: "salinity", value: record.salinity, unit: "ppt" },
          { name: "turbidity", value: record.turbidity, unit: "NTU" },
          { name: "waterLevel", value: record.waterLevel, unit: "m" },
        ].filter((metric) => metric.value !== null && metric.value !== undefined),
      }));
    }),
  );
  return histories.flat().sort((a, b) =>
    new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime(),
  );
};

export const getPondDashboard = async (pondId: string, options?: { signal?: AbortSignal }) => {
  assertBackendPondId(pondId);
  const [pond, devices] = await Promise.all([
    getPondById(pondId, options),
    getDevicesByPondId(pondId, options),
  ]);

  return {
    pond,
    devices,
  };
};

export const getCurrentWaterQuality = async (pondId: string, options?: { signal?: AbortSignal }) => {
  assertBackendPondId(pondId);
  const [sensorReadings, thresholds] = await Promise.all([
    getSensorReadings(pondId, options),
    getThresholdConfigs(pondId, options),
  ]);

  return {
    sensorReadings,
    thresholds,
  };
};

export interface FeedingScheduleItem {
  id: string;
  pondId: string;
  time: string;
  title: string;
  description: string;
  completed: boolean;
}

export const getFeedingSchedules = async (pondId?: string): Promise<FeedingScheduleItem[]> => {
  // The real backend has no feeding-schedule controller yet.
  void pondId;
  return [];
};

