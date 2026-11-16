/**
 * `ONLINE`, `OFFLINE` and `MAINTENANCE` are confirmed by the API. `UNKNOWN`
 * is a presentation-only value used when the API has not supplied a status.
 */
export type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE" | "UNKNOWN";

export interface DevicePondInfo {
  pondId?: string;
  pondName?: string;
  farmId?: string | null;
  farm?: {
    farmId?: string;
    farmName?: string;
    ownerId?: string;
  } | null;
}

export interface Devices {
  // Backend actual fields
  deviceId?: string;
  pondId?: string;
  deviceName?: string;
  macAddress?: string;
  firmwareVersion?: string | null;
  status: DeviceStatus | string;
  lastActiveAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  pond?: DevicePondInfo | null;

  // Frontend aliases / backward compat
  id?: string;
  name?: string;
  serialNumber?: string;
  node_code?: string;
  sensors?: string[];
  connection_type?: string;
  signal_strength?: number;
  battery_level?: number;
}

export type Device = Devices;
