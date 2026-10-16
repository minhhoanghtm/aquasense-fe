import type { Devices } from "../types/Devices";
import { api } from "./api";

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

export const getDevices = async (): Promise<Devices[]> => {
  const res = await api<any>("/devices?limit=50");
  const rawList = Array.isArray(res) ? res : res?.data || [];
  return rawList.map(normalizeDevice);
};

export const getDevicesByPondId = async (pondId: string): Promise<Devices[]> => {
  const devices = await getDevices();
  return devices.filter((device) => device.pondId === pondId);
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
