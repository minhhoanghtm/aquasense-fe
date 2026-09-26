export type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

export interface Devices {
  // Backend actual fields
  deviceId?: string;
  pondId?: string;
  deviceName?: string;
  macAddress?: string;
  firmwareVersion?: string | null;
  status: DeviceStatus | string;
  lastActiveAt?: string | null;

  // Frontend aliases / backward compat
  id?: string;
  name?: string;
  serialNumber?: string;
  createdAt?: string;
  node_code?: string;
  sensors?: string[];
  connection_type?: string;
  signal_strength?: number;
}

export type Device = Devices;
