import type { Devices } from "./Devices";

export type PondStatus = "ACTIVE" | "HARVESTED" | "EMPTY";

export type Pond = {
  pondId?: string;
  id: string;
  pondName?: string;
  name: string;
  areaM2?: number;
  area: number;
  depthM?: number;
  shrimpDensity?: number | string;
  density?: string;
  status: PondStatus | string;
  createAt?: string;
  createdAt?: string;
  updatedAt?: string;
  location?: string;
  stockingDate?: string;
  growthStage?: string;
  managerId?: string;
  userId?: string;
};

export type PondWithDevices = Pond & {
  devices: Devices[];
};