import { useState, useEffect, useCallback, useMemo } from "react";
import type { User, UserStatus } from "../types/User";
import type { Pond } from "../types/Pond";
import type { Farm } from "../types/Farm";
import { getRoleLabel } from "../lib/rolePermissions";
import { matchVietnamese } from "../utils/textUtils";
import {
  getStaffList,
  createStaff,
  updateStaff,
  changeStaffStatus,
  deleteStaff,
  type CreateStaffRequest,
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

export interface UseStaffOptions {
  ponds?: Pond[];
  farms?: Farm[];
}

export const useStaff = (options: UseStaffOptions = {}) => {
  const { ponds = [], farms = [] } = options;
  const [allStaff, setAllStaff] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTermState] = useState<string>("");
  const [roleFilter, setRoleFilterState] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [pondFilter, setPondFilter] = useState<string>("ALL");

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setRoleFilter = useCallback((role: string) => {
    setRoleFilterState(role);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Tải danh sách toàn bộ nhân viên từ API (hỗ trợ hiển thị và lọc toàn diện)
  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getStaffList({ page: 1, limit: 1000 });
      setAllStaff(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  // Lọc toàn diện trên TẤT CẢ thông tin hiển thị trên Card và Table
  const matchedStaff = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return allStaff.filter((staff) => {
      const staffId = staff.userId || staff.id;
      const roleUpper = (staff.role || "").toUpperCase();

      // 1. Dropdown lọc theo vai trò
      if (roleFilter !== "ALL") {
        if (roleUpper !== roleFilter.toUpperCase()) return false;
      }

      // 2. Dropdown lọc theo trạng thái
      if (statusFilter !== "ALL") {
        const staffStatus = staff.status || (staff.isActive ? "ACTIVE" : "ON_LEAVE");
        if (staffStatus !== statusFilter) return false;
      }

      // 3. Dropdown lọc theo vuông nuôi phụ trách
      if (pondFilter !== "ALL") {
        const isAssigned = ponds.some(
          (p) =>
            (p.pondId === pondFilter || p.id === pondFilter) &&
            (p.userId === staffId || p.farmerAssignments?.some((a) => a.farmerId === staffId))
        );
        if (!isAssigned) return false;
      }

      // 4. Tìm kiếm từ khóa: quét TẤT CẢ thông tin hiển thị trên Card và Table (hỗ trợ có dấu và không dấu)
      if (q) {
        // Tên nhân sự
        if (matchVietnamese(staff.fullName, q)) return true;

        // Email
        if (matchVietnamese(staff.email, q)) return true;

        // Số điện thoại
        if (matchVietnamese(staff.phoneNumber, q)) return true;

        // Chức danh / Vị trí
        const position = staff.position || "Nhân viên vận hành";
        if (matchVietnamese(position, q)) return true;

        // Phòng ban
        if (matchVietnamese(staff.department, q)) return true;

        // Vai trò (mã role + tên tiếng Việt, có dấu hoặc không dấu)
        const roleLabel = getRoleLabel(staff.role);
        if (matchVietnamese(roleLabel, q) || matchVietnamese(roleUpper, q)) return true;
        if (roleUpper === "MANAGER" && matchVietnamese("quản lý", q)) return true;
        if (roleUpper === "FARMER" && matchVietnamese("nông dân", q)) return true;
        if (roleUpper === "ADMIN" && (matchVietnamese("quản trị viên", q) || matchVietnamese("admin", q))) return true;

        // Trạng thái hoạt động (có dấu hoặc không dấu)
        const isActive = staff.status === "ACTIVE" || (!staff.status && staff.isActive !== false);
        const isPending = staff.status === "PENDING_APPROVAL";
        if (isActive && matchVietnamese("hoạt động", q)) return true;
        if (!isActive && !isPending && matchVietnamese("không hoạt động", q)) return true;
        if (isPending && matchVietnamese("chờ phê duyệt", q)) return true;

        // Ao nuôi phụ trách (cho Nông dân - có dấu hoặc không dấu)
        const assignedPonds = ponds.filter(
          (p) => p.userId === staffId || p.farmerAssignments?.some((a) => a.farmerId === staffId)
        );
        const matchesPond = assignedPonds.some((p) => {
          const pName = p.name || p.pondName || "";
          const pLoc = p.location || "";
          return matchVietnamese(pName, q) || matchVietnamese(pLoc, q);
        });
        if (matchesPond) return true;

        // Trại nuôi phụ trách (cho Quản lý - có dấu hoặc không dấu)
        const assignedFarms = farms.filter((f) => f.ownerId === staffId);
        const matchesFarm = assignedFarms.some((f) => {
          const fName = f.farmName || "";
          const fAddr = f.address || "";
          return matchVietnamese(fName, q) || matchVietnamese(fAddr, q);
        });
        if (matchesFarm) return true;

        // Quản trị viên (Toàn bộ hệ thống)
        if (roleUpper === "ADMIN" && matchVietnamese("toàn bộ hệ thống", q)) return true;

        // Không khớp trường nào
        return false;
      }

      return true;
    });
  }, [allStaff, searchTerm, roleFilter, statusFilter, pondFilter, ponds, farms]);

  // Phân trang
  const totalFiltered = matchedStaff.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pagination.limit));
  const currentPage = Math.min(Math.max(1, pagination.page), totalPages);

  const filteredStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * pagination.limit;
    return matchedStaff.slice(startIndex, startIndex + pagination.limit);
  }, [matchedStaff, currentPage, pagination.limit]);

  const paginationInfo = useMemo(() => ({
    total: totalFiltered,
    page: currentPage,
    limit: pagination.limit,
    totalPages,
  }), [totalFiltered, currentPage, pagination.limit, totalPages]);

  // Statistics tổng thể toàn hệ thống (không bị ảnh hưởng bởi bộ lọc hay trang hiện tại)
  const stats: StaffStats = useMemo(() => {
    const total = allStaff.length;
    let active = 0;
    let managers = 0;
    let farmers = 0;
    let onLeave = 0;
    let pendingApproval = 0;

    allStaff.forEach((staff) => {
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
  }, [allStaff]);

  // Add staff
  const addStaff = async (data: CreateStaffRequest) => {
    const created = await createStaff(data);
    await loadStaff();
    return created;
  };

  // Edit staff
  const editStaff = async (id: string, data: UpdateStaffRequest) => {
    const updated = await updateStaff(id, data);
    setAllStaff((prev) =>
      prev.map((item) => (item.id === id || item.userId === id ? { ...item, ...updated } : item))
    );
    return updated;
  };

  // Approve pending account
  const approveAccount = async (id: string) => {
    const updated = await updateStaff(id, { isActive: true });
    setAllStaff((prev) =>
      prev.map((item) => (item.id === id || item.userId === id ? { ...item, status: "ACTIVE", isActive: true } : item))
    );
    return updated;
  };

  // Reject pending account
  const rejectAccount = async (id: string) => {
    await deleteStaff(id);
    setAllStaff((prev) => prev.filter((item) => item.id !== id && item.userId !== id));
  };

  // Change status (Hoạt động / Tạm nghỉ / Khóa)
  const changeStatus = async (id: string, newStatus: UserStatus) => {
    const updated = await changeStaffStatus(id, newStatus === "ACTIVE");
    setAllStaff((prev) =>
      prev.map((item) => (item.id === id || item.userId === id ? { ...item, status: newStatus, isActive: newStatus === "ACTIVE" } : item))
    );
    return updated;
  };

  // Remove staff
  const removeStaff = async (id: string) => {
    await deleteStaff(id);
    setAllStaff((prev) => prev.filter((item) => item.id !== id && item.userId !== id));
  };

  return {
    staffList: allStaff,
    filteredStaff,
    totalCount: allStaff.length,
    filteredCount: matchedStaff.length,
    loading,
    error,
    pagination: paginationInfo,
    setPage: (page: number) => setPagination((prev) => ({ ...prev, page })),
    setLimit: (limit: number) => setPagination((prev) => ({ ...prev, limit, page: 1 })),
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
