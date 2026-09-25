import { useState, useEffect, useCallback, useMemo } from "react";
import type { User, UserStatus } from "../types/User";
import {
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff,
  assignPondsToStaff,
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
      const data = await getStaffList();
      setStaffList(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Derived filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = staff.fullName?.toLowerCase().includes(query);
        const matchEmail = staff.email?.toLowerCase().includes(query);
        const matchPhone = staff.phoneNumber?.toLowerCase().includes(query);
        const matchPosition = staff.position?.toLowerCase().includes(query);
        const matchDept = staff.department?.toLowerCase().includes(query);

        if (!matchName && !matchEmail && !matchPhone && !matchPosition && !matchDept) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "ALL") {
        if (staff.role !== roleFilter) return false;
      }

      // Status filter
      if (statusFilter !== "ALL") {
        const staffStatus = staff.status || (staff.isActive ? "ACTIVE" : "ON_LEAVE");
        if (staffStatus !== statusFilter) return false;
      }

      // Pond filter
      if (pondFilter !== "ALL") {
        if (!staff.assignedPondIds || !staff.assignedPondIds.includes(pondFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [staffList, searchTerm, roleFilter, statusFilter, pondFilter]);

  // Statistics
  const stats: StaffStats = useMemo(() => {
    const total = staffList.length;
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
  }, [staffList]);

  // Add staff (Optionally with auto-approval or pending approval)
  const addStaff = async (data: Omit<User, "id" | "createdAt" | "updatedAt">) => {
    const created = await createStaff(data);
    setStaffList((prev) => [created, ...prev]);
    return created;
  };

  // Edit staff
  const editStaff = async (id: string, data: Partial<User>) => {
    const updated = await updateStaff(id, data);
    setStaffList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    return updated;
  };

  // Approve pending account
  const approveAccount = async (id: string) => {
    const updated = await updateStaff(id, { status: "ACTIVE" });
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
    const updated = await updateStaff(id, { status: newStatus });
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

  // Assign ponds
  const assignPonds = async (staffId: string, pondIds: string[]) => {
    const updated = await assignPondsToStaff(staffId, pondIds);
    setStaffList((prev) =>
      prev.map((item) =>
        item.id === staffId || item.userId === staffId
          ? { ...item, ...updated, assignedPondIds: pondIds }
          : item
      )
    );
    return updated;
  };

  return {
    staffList,
    filteredStaff,
    loading,
    error,
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
    assignPonds,
  };
};
