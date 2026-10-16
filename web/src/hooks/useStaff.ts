import { useState, useEffect, useCallback, useMemo } from "react";
import type { Role, User, UserStatus } from "../types/User";
import {
  getStaffList,
  createStaff,
  updateStaff,
  changeStaffStatus,
  deleteStaff,
  type CreateStaffRequest,
  type PaginatedUsers,
  type UpdateStaffRequest,
} from "../services/staffApi";

export interface StaffStats {
  total: number;
  active: number;
  managers: number;
  farmers: number;
  onLeave: number;
  pendingApproval: number;
}

export const useStaff = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedUsers, "data">>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [pondFilter, setPondFilter] = useState<string>("ALL");

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getStaffList({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        role: roleFilter === "ALL" ? undefined : roleFilter as Role,
      });
      setStaffList(result.data);
      setPagination({ total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, roleFilter]);

  useEffect(() => {
    void Promise.resolve().then(loadStaff);
  }, [loadStaff]);

  // Derived filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      // Status filter
      if (statusFilter !== "ALL") {
        const staffStatus = staff.status || (staff.isActive ? "ACTIVE" : "ON_LEAVE");
        if (staffStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [staffList, statusFilter]);

  // Statistics
  const stats: StaffStats = useMemo(() => {
    const total = pagination.total;
    let active = 0;
    let managers = 0;
    let farmers = 0;
    let onLeave = 0;
    let pendingApproval = 0;

    staffList.forEach((staff) => {
      const status = staff.status || (staff.isActive ? "ACTIVE" : "ON_LEAVE");
      if (status === "ACTIVE") active++;
      else if (status === "ON_LEAVE" || status === "INACTIVE") onLeave++;
      else if (status === "PENDING_APPROVAL") pendingApproval++;

      const role = staff.role?.toUpperCase();
      if (role === "MANAGER" || role === "ADMIN") managers++;
      else farmers++;
    });

    return {
      total,
      active,
      managers,
      farmers,
      onLeave,
      pendingApproval,
    };
  }, [staffList, pagination.total]);

  // Add staff (Optionally with auto-approval or pending approval)
  const addStaff = async (data: CreateStaffRequest) => {
    const created = await createStaff(data);
    await loadStaff();
    return created;
  };

  // Edit staff
  const editStaff = async (id: string, data: UpdateStaffRequest) => {
    const updated = await updateStaff(id, data);
    setStaffList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    return updated;
  };

  // Approve pending account
  const approveAccount = async (id: string) => {
    const updated = await updateStaff(id, { isActive: true });
    setStaffList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "ACTIVE" } : item))
    );
    return updated;
  };

  // Reject pending account
  const rejectAccount = async (id: string) => {
    await deleteStaff(id);
    setStaffList((prev) => prev.filter((item) => item.id !== id));
  };

  // Change status (Hoạt động / Tạm nghỉ / Khóa)
  const changeStatus = async (id: string, newStatus: UserStatus) => {
    const updated = await changeStaffStatus(id, newStatus === "ACTIVE");
    setStaffList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    return updated;
  };

  // Remove staff
  const removeStaff = async (id: string) => {
    await deleteStaff(id);
    setStaffList((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    staffList,
    filteredStaff,
    loading,
    error,
    pagination,
    setPage: (page: number) => setPagination((prev) => ({ ...prev, page })),
    stats,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    pondFilter,
    setPondFilter,
    reload: loadStaff,
    addStaff,
    editStaff,
    approveAccount,
    rejectAccount,
    changeStatus,
    removeStaff,
  };
};
