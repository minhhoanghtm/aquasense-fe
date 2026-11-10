import { api } from "./api";
import type {
  Farm,
  CreateFarmPayload,
  UpdateFarmPayload,
  FindFarmsQuery,
  FarmListResponse,
} from "../types/Farm";
import type { Pond } from "../types/Pond";

/**
 * Lấy danh sách các trại nuôi (có phân trang & tìm kiếm)
 * GET /farms?page=1&limit=10&search=...
 */
export const getFarms = async (
  query?: FindFarmsQuery
): Promise<FarmListResponse> => {
  const params = new URLSearchParams();
  if (query?.page) params.append("page", String(query.page));
  if (query?.limit) params.append("limit", String(query.limit));
  if (query?.search?.trim()) params.append("search", query.search.trim());

  const qs = params.toString();
  const url = qs ? `/farms?${qs}` : "/farms";

  return api<FarmListResponse>(url, {
    method: "GET",
  });
};

/**
 * Lấy chi tiết một trại nuôi
 * GET /farms/:farmId
 */
export const getFarmById = async (farmId: string): Promise<Farm> => {
  return api<Farm>(`/farms/${farmId}`, {
    method: "GET",
  });
};

/**
 * Lấy danh sách vuông nuôi thuộc một trại nuôi
 * GET /farms/:farmId/ponds
 */
export const getFarmPonds = async (farmId: string): Promise<Pond[]> => {
  return api<Pond[]>(`/farms/${farmId}/ponds`, {
    method: "GET",
  });
};

/**
 * Tạo mới một trại nuôi
 * POST /farms
 */
export const createFarm = async (
  payload: CreateFarmPayload
): Promise<Farm> => {
  return api<Farm>("/farms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * Cập nhật thông tin trại nuôi
 * PATCH /farms/:farmId
 */
export const updateFarm = async (
  farmId: string,
  payload: UpdateFarmPayload
): Promise<Farm> => {
  return api<Farm>(`/farms/${farmId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

/**
 * Phân công Quản lý (Manager) phụ trách trại nuôi (Dành cho Quản trị viên - ADMIN)
 * PATCH /farms/:farmId/assign-manager
 */
export const assignFarmManager = async (
  farmId: string,
  managerId: string
): Promise<Farm> => {
  return api<Farm>(`/farms/${farmId}/assign-manager`, {
    method: "PATCH",
    body: JSON.stringify({ managerId }),
  });
};

/**
 * Xóa một trại nuôi
 * DELETE /farms/:farmId
 */
export const deleteFarm = async (
  farmId: string
): Promise<{ message: string }> => {
  return api<{ message: string }>(`/farms/${farmId}`, {
    method: "DELETE",
  });
};
