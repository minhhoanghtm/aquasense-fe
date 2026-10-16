import { api } from "./api";
import type { Role, User } from "../types/User";

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}

export interface CreateStaffRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  role: Role;
}

export interface UpdateStaffRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  role?: Role;
  isActive?: boolean;
  mustChangePassword?: boolean;
}

interface BackendUser extends Omit<User, "id" | "status" | "is_login_locked" | "assignedPondIds"> {
  userId: string;
}

interface RegisterResponse {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  role: Role;
}

const normalizeStaff = (raw: BackendUser): User => ({
  ...raw,
  id: raw.userId,
  userId: raw.userId,
  status: raw.isActive ? "ACTIVE" : "INACTIVE",
  assignedPondIds: [],
});

export const getStaffList = async (query: StaffListQuery = {}): Promise<PaginatedUsers> => {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 10));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.role) params.set("role", query.role);

  const response = await api<{
    data: BackendUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/users?${params.toString()}`);

  return {
    ...response,
    data: response.data.map(normalizeStaff),
  };
};

export const getStaffById = async (id: string): Promise<User | null> => {
  if (!id) return null;
  const user = await api<BackendUser>(`/users/${id}`);
  return normalizeStaff(user);
};

export const createStaff = async (staffData: CreateStaffRequest): Promise<User> => {
  const response = await api<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(staffData),
  });
  return normalizeStaff({ ...response, isActive: true });
};

export const updateStaff = async (id: string, staffData: UpdateStaffRequest): Promise<User> => {
  if (!id) throw new Error("ID nhân viên không hợp lệ");
  const response = await api<{ user: BackendUser }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(staffData),
  });
  return normalizeStaff(response.user);
};

export const approveStaffAccount = (id: string): Promise<User> =>
  updateStaff(id, { isActive: true });

export const rejectStaffAccount = (id: string): Promise<boolean> => deleteStaff(id);

export const changeStaffStatus = (id: string, isActive: boolean): Promise<User> =>
  updateStaff(id, { isActive });

export const deleteStaff = async (id: string): Promise<boolean> => {
  if (!id) throw new Error("ID nhân viên không hợp lệ");
  await api<unknown>(`/users/${id}`, { method: "DELETE" });
  return true;
};


