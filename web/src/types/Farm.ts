import type { Pond } from "./Pond";

export interface FarmOwner {
  userId: string;
  fullName: string;
  role: string;
  isActive: boolean;
  email?: string | null;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Farm {
  farmId: string;
  farmName: string;
  ownerId: string;
  address: string | null;
  totalArea: string | number | null;
  createdAt: string;
  updatedAt: string;
  owner?: FarmOwner;
  ponds?: Pond[];
  pondCount?: number;
}

export interface CreateFarmPayload {
  farmName: string;
  address?: string;
  totalArea?: number;
  ownerId?: string;
}

export interface UpdateFarmPayload {
  farmName?: string;
  address?: string;
  totalArea?: number;
  ownerId?: string;
}

export interface FindFarmsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FarmListResponse {
  data: Farm[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
