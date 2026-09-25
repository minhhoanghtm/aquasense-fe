// services/pondApi.ts

import type { Pond, PondWithDevices } from "../types/Pond";
import type { SensorReading } from "../types/SensorReading";
import { api } from "./api";
import { getDevicesByPondId } from "./deviceApi";
import { getAlertPondById } from "./alertsApi";

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
  userId: string;
  nh3Value: number;
  no2Value: number;
  note?: string;
  testedAt: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    fullName?: string;
    phoneNumber?: string;
  };
}

export interface CreatePondPayload {
  pondName: string;
  areaM2: number;
  depthM: number;
  shrimpDensity: number;
  status?: string;
  userId?: string;
}

export interface UpdatePondPayload {
  pondName?: string;
  areaM2?: number;
  depthM?: number;
  shrimpDensity?: number;
  status?: string;
  userId?: string;
}

const normalizePond = (p: any): Pond => ({
  ...p,
  id: p.pondId || p.id,
  pondId: p.pondId || p.id,
  name: p.pondName || p.name || "Vuông nuôi",
  pondName: p.pondName || p.name || "Vuông nuôi",
  area: p.areaM2 ? p.areaM2 / 10000 : p.area || 0.5,
  areaM2: p.areaM2 || (p.area ? p.area * 10000 : 5000),
  depthM: p.depthM || 1.5,
  shrimpDensity: p.shrimpDensity || 150,
  density: `${p.shrimpDensity || 150} PL/m²`,
  status: p.status || "ACTIVE",
  userId: p.userId,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

// 1. POND CRUD
export const getPonds = async (): Promise<Pond[]> => {
  const res = await api<any>("/ponds");
  const rawList = Array.isArray(res) ? res : res?.data || [];
  return rawList.map(normalizePond);
};

export const getPondById = async (pondId: string): Promise<Pond> => {
  const res = await api<any>(`/ponds/${pondId}`);
  const p = res?.data || res;
  return normalizePond(p);
};

export const createPond = async (payload: CreatePondPayload): Promise<Pond> => {
  const res = await api<{ message: string; data: any }>("/ponds", {
    method: "POST",
    body: JSON.stringify({
      pondName: payload.pondName.trim(),
      areaM2: Number(payload.areaM2),
      depthM: Number(payload.depthM),
      shrimpDensity: Number(payload.shrimpDensity),
      status: payload.status || "ACTIVE",
      ...(payload.userId ? { userId: payload.userId } : {}),
    }),
  });
  return normalizePond(res.data || res);
};

export const updatePond = async (pondId: string, payload: UpdatePondPayload): Promise<Pond> => {
  const body: Record<string, any> = {};
  if (payload.pondName !== undefined) body.pondName = payload.pondName.trim();
  if (payload.areaM2 !== undefined) body.areaM2 = Number(payload.areaM2);
  if (payload.depthM !== undefined) body.depthM = Number(payload.depthM);
  if (payload.shrimpDensity !== undefined) body.shrimpDensity = Number(payload.shrimpDensity);
  if (payload.status !== undefined) body.status = payload.status;
  if (payload.userId !== undefined) body.userId = payload.userId;

  const res = await api<{ message: string; data: any }>(`/ponds/${pondId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return normalizePond(res.data || res);
};

export const deletePond = async (pondId: string): Promise<boolean> => {
  await api<any>(`/ponds/${pondId}`, {
    method: "DELETE",
  });
  return true;
};

// 2. THRESHOLD CONFIGS
export const getThresholdConfigs = async (pondId: string): Promise<ThresholdConfigItem[]> => {
  const res = await api<any>(`/ponds/${pondId}/thresholds`);
  return Array.isArray(res) ? res : res?.data || [];
};

export const createThresholdConfig = async (
  pondId: string,
  dto: { metricName: string; minValue: number; maxValue: number; isActive?: boolean }
): Promise<ThresholdConfigItem> => {
  const res = await api<{ message: string; data: ThresholdConfigItem }>(`/ponds/${pondId}/thresholds`, {
    method: "POST",
    body: JSON.stringify({
      metricName: dto.metricName,
      minValue: Number(dto.minValue),
      maxValue: Number(dto.maxValue),
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    }),
  });
  return res.data || res;
};

export const updateThresholdConfig = async (
  configId: string,
  dto: { metricName?: string; minValue?: number; maxValue?: number; isActive?: boolean }
): Promise<ThresholdConfigItem> => {
  const body: Record<string, any> = {};
  if (dto.metricName !== undefined) body.metricName = dto.metricName;
  if (dto.minValue !== undefined) body.minValue = Number(dto.minValue);
  if (dto.maxValue !== undefined) body.maxValue = Number(dto.maxValue);
  if (dto.isActive !== undefined) body.isActive = dto.isActive;

  const res = await api<{ message: string; data: ThresholdConfigItem }>(`/ponds/thresholds/${configId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.data || res;
};

export const deleteThresholdConfig = async (configId: string): Promise<boolean> => {
  await api<any>(`/ponds/thresholds/${configId}`, {
    method: "DELETE",
  });
  return true;
};

// 3. MANUAL TEST LOGS (Đo khí độc NH3, NO2 thủ công)
export const getManualTestLogs = async (pondId: string): Promise<ManualTestLogItem[]> => {
  const res = await api<any>(`/ponds/${pondId}/manual-logs?limit=50`);
  return Array.isArray(res) ? res : res?.data || [];
};

export const createManualTestLog = async (
  pondId: string,
  dto: { nh3Value: number; no2Value: number; note?: string; testedAt?: string }
): Promise<ManualTestLogItem> => {
  const res = await api<{ message: string; data: ManualTestLogItem }>(`/ponds/${pondId}/manual-logs`, {
    method: "POST",
    body: JSON.stringify({
      nh3Value: Number(dto.nh3Value),
      no2Value: Number(dto.no2Value),
      note: dto.note?.trim() || undefined,
      testedAt: dto.testedAt || new Date().toISOString(),
    }),
  });
  return res.data || res;
};

export const updateManualTestLog = async (
  logId: string,
  dto: { nh3Value?: number; no2Value?: number; note?: string; testedAt?: string }
): Promise<ManualTestLogItem> => {
  const body: Record<string, any> = {};
  if (dto.nh3Value !== undefined) body.nh3Value = Number(dto.nh3Value);
  if (dto.no2Value !== undefined) body.no2Value = Number(dto.no2Value);
  if (dto.note !== undefined) body.note = dto.note.trim();
  if (dto.testedAt !== undefined) body.testedAt = dto.testedAt;

  const res = await api<{ message: string; data: ManualTestLogItem }>(`/ponds/manual-logs/${logId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.data || res;
};

export const deleteManualTestLog = async (logId: string): Promise<boolean> => {
  await api<any>(`/ponds/manual-logs/${logId}`, {
    method: "DELETE",
  });
  return true;
};

// 4. COMBINED & LEGACY HELPERS
export const getPondsWithDevices = async (): Promise<PondWithDevices[]> => {
  const ponds = await getPonds();
  return Promise.all(
    ponds.map(async (pond) => {
      const devices = await getDevicesByPondId(pond.id);
      return { ...pond, devices: devices || [] };
    })
  );
};

export const getSensorReadings = async (pondId: string): Promise<SensorReading[]> => {
  try {
    const res = await api<any>(`/sensorReadings?pondId=${pondId}`);
    const rawList = Array.isArray(res) ? res : res?.data || [];
    return Array.isArray(rawList) ? rawList : [];
  } catch {
    return [];
  }
};

export const getPondDashboard = async (pondId: string) => {
  const [pond, thresholds, sensorReadings, alerts, devices] = await Promise.all([
    getPondById(pondId).catch(() => null),
    getThresholdConfigs(pondId).catch(() => []),
    getSensorReadings(pondId).catch(() => []),
    getAlertPondById(pondId).catch(() => []),
    api(`/devices?pondId=${pondId}`).catch(() => []),
  ]);

  return {
    pond,
    thresholds,
    sensorReadings,
    alerts,
    devices,
  };
};

export const getCurrentWaterQuality = async (pondId: string) => {
  const [sensorReadings, thresholds] = await Promise.all([
    getSensorReadings(pondId).catch(() => []),
    getThresholdConfigs(pondId).catch(() => []),
  ]);

  return {
    sensorReadings: Array.isArray(sensorReadings) ? sensorReadings : [],
    thresholds: Array.isArray(thresholds) ? thresholds : [],
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
  try {
    const endpoint = pondId ? `/feedingSchedules?pondId=${pondId}` : "/feedingSchedules";
    return await api<FeedingScheduleItem[]>(endpoint);
  } catch {
    return [];
  }
};

