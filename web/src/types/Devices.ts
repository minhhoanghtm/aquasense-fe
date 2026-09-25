export type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

export type Devices = {
  deviceId?: string;
  id: string;
  pondId: string;
  macAddress: string;
  deviceName?: string;
  name?: string;
  firmwareVersion?: string;
  status: DeviceStatus | string;
  lastActiveAt: string;
  serialNumber?: string;
  createdAt?: string;
  node_code?: string;
  sensors?: string[];
  connection_type?: string;
  signal_strength?: number;
};

export type Device = Devices;