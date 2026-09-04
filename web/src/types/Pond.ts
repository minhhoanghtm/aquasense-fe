import type { Devices } from "./Devices";

export type Pond = {
  id: string;
  name: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
  area: number;
  density?: string;
  stockingDate: string;
  growthStage: string;
  status: string;
  managerId: string;
};

export type PondWithDevices = Pond & {
  devices: Devices[];
}