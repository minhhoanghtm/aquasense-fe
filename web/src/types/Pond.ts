import type { Device } from "./Devices";

export type PondStatus = "ACTIVE" | "HARVESTED" | "EMPTY";

export interface PondFarmerAssignment {
  assignmentId: string;
  pondId: string;
  farmerId: string;
  assignedAt?: string;
  farmer?: {
    userId: string;
    fullName: string;
    role?: string;
    phoneNumber?: string;
    email?: string | null;
    isActive?: boolean;
  };
}

export interface Pond {
  // Backend actual fields
  pondId?: string;
  userId?: string;
  farmId?: string | null;
  pondName?: string;
  areaM2?: number;
  depthM?: number;
  shrimpDensity?: number | string;
  capacity?: number | null;
  status: PondStatus | string;
  createdAt?: string;
  updatedAt?: string;
  farmerAssignments?: PondFarmerAssignment[];

  // Frontend aliases / backward compat
  id?: string;
  name?: string;
  area?: number;
  density?: string;
  createAt?: string;
  location?: string | null;
  stockingDate?: string;
  growthStage?: string;
  managerId?: string;
}

export interface PondWithDevices extends Pond {
  devices: Device[];
}
