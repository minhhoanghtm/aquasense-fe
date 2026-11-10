import { useState, useEffect, useCallback, useMemo } from "react";
import Title from "../../components/Title";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useStaff } from "../../hooks/useStaff";
import StaffStats from "../../features/Staff_Management/components/StaffStats";
import StaffToolbar from "../../features/Staff_Management/components/StaffToolbar";
import StaffCard from "../../features/Staff_Management/components/StaffCard";
import StaffTable from "../../features/Staff_Management/components/StaffTable";
import StaffFormModal from "../../features/Staff_Management/components/StaffFormModal";
import StaffDetailModal from "../../features/Staff_Management/components/StaffDetailModal";
import AssignPondModal from "../../features/Staff_Management/components/AssignPondModal";
import AssignFarmToManagerModal from "../../features/Staff_Management/components/AssignFarmToManagerModal";
import ConfirmModal from "../../components/ConfirmModal";
import type { User, UserStatus } from "../../types/User";
import type { Pond } from "../../types/Pond";
import type { Farm } from "../../types/Farm";
import { getStaffById, unlockStaffAccount, type CreateStaffRequest, type UpdateStaffRequest } from "../../services/staffApi";
import { Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "../../services/authApi";
import { assignPondToUser, revokePondFromUser } from "../../services/pondApi";
import { getFarms } from "../../services/farmApi";

import { canManageUser } from "../../lib/rolePermissions";
export default function StaffManagement() {
  useDocumentTitle("Quản lý nhân viên");

  const { ponds, refetch: refetchPonds } = usePonds({ allPages: true });
  const currentUser = getCurrentUser();
  const currentRole = currentUser?.role;
  const isAdmin = currentRole === "ADMIN";
  const isManager = currentRole === "MANAGER";
  const canAssignPonds = isAdmin || isManager;
  const canAssignFarms = isAdmin;

  const [farms, setFarms] = useState<Farm[]>([]);
  const loadFarms = useCallback(async () => {
    try {
      const res = await getFarms({ limit: 100 });
      setFarms(res.data || []);
    } catch (e) {
      console.error("Error loading farms:", e);
    }
  }, []);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  const selectedPondId = ponds.length > 0 ? ponds[0].id : "";
  const { pond, device } = usePond(selectedPondId);

  const {
    staffList,
    filteredStaff,
    loading,
    stats,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    pondFilter,
    setPondFilter,
    addStaff,
    editStaff,
    approveAccount,
    rejectAccount,
    changeStatus,
    removeStaff,
    reload,
    pagination,
    setPage,
  } = useStaff();

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailStaff, setDetailStaff] = useState<User | null>(null);
  const [assigningStaff, setAssigningStaff] = useState<User | null>(null);

  // Modal phân quyền trại nuôi cho Quản lý (Admin only)
  const [isAssignFarmOpen, setIsAssignFarmOpen] = useState(false);
  const [selectedManagerForFarm, setSelectedManagerForFarm] = useState<User | null>(null);

  const handleOpenAssignFarm = (staff: User) => {
    if (!isAdmin) {
      showToast("Chỉ Quản trị viên mới có quyền phân công trại nuôi!", "error");
      return;
    }
    setSelectedManagerForFarm(staff);
    setIsAssignFarmOpen(true);
  };

  const handleOpenAssignPond = (staff: User) => {
    if (isManager && staff.role !== "FARMER") {
      showToast("Quản lý chỉ có quyền phân công vuông nuôi cho Nông dân!", "error");
      return;
    }
    setAssigningStaff(staff);
  };

  // Lọc danh sách ao nuôi có thể phân công:
  // - ADMIN: Toàn bộ ao nuôi hệ thống
  // - MANAGER: Chỉ các ao nuôi thuộc các trang trại do Manager này quản lý (pond.farmId thuộc trại của Manager)
  const assignablePonds = useMemo(() => {
    if (isAdmin) return ponds;
    if (isManager && (currentUser?.userId || currentUser?.id)) {
      const currentId = currentUser.userId || currentUser.id;
      const myFarmIds = new Set(
        farms
          .filter((f) => f.ownerId === currentId || f.owner?.userId === currentId)
          .map((f) => f.farmId)
      );
      return ponds.filter((p) => p.farmId && myFarmIds.has(p.farmId));
    }
    return [];
  }, [isAdmin, isManager, currentUser, ponds, farms]);


  // Confirm modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info" | "success";
    onConfirm: () => Promise<void>;
    loading?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: async () => { },
  });

  const closeConfirm = () => {
    setConfirmConfig((prev) => ({ ...prev, isOpen: false, loading: false }));
  };

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handlers
  const canManageStaff = (staff: User | null, actionName: string = "thực hiện hành động này") => {
    if (!staff) {
      showToast(`Không tìm thấy thông tin tài khoản!`, "error");
      return false;
    }
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    if (!canManageUser(currentUser.role, staff.role)) {
      showToast(`Bạn không thể ${actionName} tài khoản này!`, "error");
      return false;
    }
    return true;
  };

  const canManageUI = (staff: User | null) => {
    if (!staff) return false;
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    return canManageUser(currentUser.role, staff.role);
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setIsFormOpen(true);
  };

  const handleSaveAssignments = async (staffId: string, pondIds: string[]) => {
    try {
      let targetStaff = staffList.find((s) => (s.id || s.userId) === staffId) || null;
      try {
        const freshStaff = await getStaffById(staffId);
        if (freshStaff) targetStaff = freshStaff;
      } catch {
        // Fallback silently to targetStaff in local list if getStaffById encounters permission check
      }
      if (!canManageStaff(targetStaff, "phân công ao nuôi")) {
         return;
      }
      // Chỉ so sánh với các ao trong phạm vi phân công được phép (assignablePonds)
      const currentlyAssignedPonds = assignablePonds
        .filter(
          (p) =>
            p.userId === staffId ||
            p.farmerAssignments?.some((a) => a.farmerId === staffId)
        )
        .map((p) => p.pondId || p.id || "")
        .filter(Boolean);

      const pondsToAdd = pondIds.filter((id) => !currentlyAssignedPonds.includes(id));
      const pondsToRemove = currentlyAssignedPonds.filter((id) => !pondIds.includes(id));

      for (const pondId of pondsToAdd) {
        await assignPondToUser(pondId, staffId);
      }
      for (const pondId of pondsToRemove) {
        await revokePondFromUser(pondId, staffId);
      }

      await refetchPonds();
      showToast(`Đã cập nhật phân công vuông nuôi thành công!`, "success");
    } catch (error) {
      await refetchPonds();
      throw error;
    }
  };

  const handleEdit = (staff: User) => {
    if (!canManageStaff(staff, "thay đổi thông tin")) return;
    setEditingStaff(staff);
    setIsFormOpen(true);
  };

  const handleViewDetail = async (staff: User) => {
    const staffId = staff.id || staff.userId;
    if (!staffId) return;
    try {
      const detail = await getStaffById(staffId);
      setDetailStaff(detail);
      setIsDetailOpen(true);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Không thể tải chi tiết nhân viên.", "error");
    }
  };

  const handleDelete = (staff: User) => {
    if (!canManageStaff(staff, "xóa tài khoản")) return;
    
    setConfirmConfig({
      isOpen: true,
      title: "Xác nhận xóa nhân viên",
      description: (
        <span>
          Thao tác xóa tài khoản <strong className="text-white">{staff.fullName}</strong> là vĩnh viễn và có thể xóa dữ liệu ao nuôi liên quan. Bạn có chắc chắn muốn tiếp tục?
        </span>
      ),
      confirmText: "Xác nhận xóa",
      variant: "danger",
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, loading: true }));
          const freshStaff = await getStaffById(staff.id || staff.userId || "");
          if (!canManageStaff(freshStaff, "xóa tài khoản")) {
             return;
          }
          await removeStaff(staff.id || staff.userId || "");
          showToast(`Đã xóa nhân viên ${staff.fullName} thành công!`, "success");
        } catch (err: any) {
          showToast(err.message || "Không thể xóa nhân viên", "error");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const handleApprove = (staff: User) => {
    if (!canManageStaff(staff, "phê duyệt tài khoản")) return;
    setConfirmConfig({
      isOpen: true,
      title: "Xác nhận phê duyệt tài khoản",
      description: (
        <span>
          Bạn có chắc chắn muốn phê duyệt tài khoản cho <strong className="text-white">{staff.fullName}</strong>? Nhân viên sẽ có thể đăng nhập vào hệ thống.
        </span>
      ),
      confirmText: "Phê duyệt tài khoản",
      variant: "success",
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, loading: true }));
          const freshStaff = await getStaffById(staff.id || staff.userId || "");
          if (!canManageStaff(freshStaff, "phê duyệt tài khoản")) {
             return;
          }
          await approveAccount(staff.id || staff.userId || "");
          showToast(`Đã phê duyệt tài khoản cho ${staff.fullName}!`, "success");
        } catch (err: any) {
          showToast("Lỗi khi phê duyệt tài khoản", "error");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const handleReject = (staff: User) => {
    if (!canManageStaff(staff, "từ chối tài khoản")) return;
    setConfirmConfig({
      isOpen: true,
      title: "Xác nhận từ chối tài khoản",
      description: (
        <span>
          Bạn có chắc chắn muốn từ chối yêu cầu tạo tài khoản của <strong className="text-white">{staff.fullName}</strong>? Yêu cầu này sẽ bị gỡ khỏi hệ thống.
        </span>
      ),
      confirmText: "Từ chối yêu cầu",
      variant: "danger",
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, loading: true }));
          const freshStaff = await getStaffById(staff.id || staff.userId || "");
          if (!canManageStaff(freshStaff, "từ chối tài khoản")) {
             return;
          }
          await rejectAccount(staff.id || staff.userId || "");
          showToast(`Đã từ chối yêu cầu của ${staff.fullName}`, "info");
        } catch (err: any) {
          showToast("Lỗi khi từ chối yêu cầu", "error");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const handleChangeStatus = (staff: User, newStatus: UserStatus) => {
    if (!canManageStaff(staff, "thay đổi trạng thái")) return;

    const statusLabel =
      newStatus === "ACTIVE"
        ? "Hoạt động"
        : newStatus === "INACTIVE"
          ? "Không hoạt động"
          : "Chờ phê duyệt";

    setConfirmConfig({
      isOpen: true,
      title: "Xác nhận thay đổi trạng thái",
      description: (
        <span>
          Bạn có chắc chắn muốn thay đổi trạng thái hoạt động của nhân viên{" "}
          <strong className="text-white">{staff.fullName}</strong> sang "
          <strong className="text-cyan-300">{statusLabel}</strong>"? Dữ liệu trạng thái sẽ được cập nhật trực tiếp vào cơ sở dữ liệu.
        </span>
      ),
      confirmText: "Xác nhận thay đổi",
      variant: newStatus === "ACTIVE" ? "success" : "warning",
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, loading: true }));
          const freshStaff = await getStaffById(staff.id || staff.userId || "");
          if (!canManageStaff(freshStaff, "thay đổi trạng thái")) {
             return;
          }
          await changeStatus(staff.id || staff.userId || "", newStatus);
          showToast(`Đã chuyển trạng thái của ${staff.fullName} sang "${statusLabel}"`, "success");
        } catch (err: any) {
          showToast("Không thể cập nhật trạng thái", "error");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const handleToggleLoginLock = (staff: User) => {
    const staffId = staff.id || staff.userId || "";
    if (staff.isLocked || staff.is_login_locked) {
      if (!canManageStaff(staff, "mở khóa tài khoản")) return;
      setConfirmConfig({
        isOpen: true,
        title: "Mở khóa tài khoản",
        description: (
          <span>
            Bạn có chắc chắn muốn mở khóa tài khoản cho nhân sự{" "}
            <strong className="text-white">{staff.fullName}</strong>? Thao tác này sẽ gọi API hệ thống để gỡ bỏ hạn chế đăng nhập.
          </span>
        ),
        confirmText: "Xác nhận mở khóa",
        variant: "success",
        onConfirm: async () => {
          try {
            setConfirmConfig((prev) => ({ ...prev, loading: true }));
            await unlockStaffAccount(staffId, "Quản trị viên mở khóa qua trang quản lý nhân viên");
            showToast(`Đã mở khóa tài khoản cho ${staff.fullName} thành công!`, "success");
            await reload();
          } catch (err: any) {
            showToast(err.message || "Không thể mở khóa tài khoản", "error");
          } finally {
            closeConfirm();
          }
        },
      });
    } else {
      showToast("Tài khoản hiện đang bình thường, không bị khóa đăng nhập.", "info");
    }
  };

  const handleUnassignSinglePond = (staff: User, pond: Pond) => {
    const staffId = staff.userId || staff.id;
    const pondId = pond.pondId || pond.id;
    if (!staffId || !pondId) return;

    setConfirmConfig({
      isOpen: true,
      title: "Bỏ gán vuông nuôi",
      description: (
        <span>
          Bạn có chắc chắn muốn bỏ gán vuông nuôi <strong className="text-white">{pond.pondName || pond.name}</strong> khỏi nhân sự <strong className="text-cyan-400">{staff.fullName}</strong>?
        </span>
      ),
      confirmText: "Xác nhận bỏ gán",
      variant: "warning",
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, loading: true }));
          await revokePondFromUser(pondId, staffId);
          await refetchPonds();
          showToast(`Đã bỏ gán vuông nuôi ${pond.pondName || pond.name} thành công!`, "success");
        } catch (err: any) {
          showToast(err.message || "Không thể bỏ gán ao nuôi", "error");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const handleSaveStaff = async (data: CreateStaffRequest | UpdateStaffRequest) => {
    if (editingStaff) {
      const freshStaff = await getStaffById(editingStaff.id || editingStaff.userId || "");
      if (!canManageStaff(freshStaff, "thay đổi thông tin")) {
         return;
      }
      await editStaff(editingStaff.id || editingStaff.userId || "", data as UpdateStaffRequest);
      showToast(`Đã cập nhật thông tin ${data.fullName || editingStaff.fullName}`, "success");
    } else {
      await addStaff(data as CreateStaffRequest);
      showToast(`Đã thêm nhân viên ${data.fullName} thành công! Mật khẩu khởi tạo đã được gửi về email.`, "success");
    }
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5 text-left relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold animate-slideDown backdrop-blur-md ${toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/50"
              : toastMessage.type === "error"
                ? "bg-rose-950/90 text-rose-200 border-rose-500/50"
                : "bg-cyan-950/90 text-cyan-200 border-cyan-500/50"
            }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Title */}
      <Title
        title="Quản lý nhân viên"
        description="Hệ thống quản lý nhân sự, phê duyệt tài khoản và phân công phụ trách vuông nuôi tôm"
        pond={pond}
        device={device}
      />

      {/* Overview Statistics Cards */}
      <StaffStats stats={stats} />

      {/* Toolbar: Search, Filters, View toggle, Add button */}
      <StaffToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        pondFilter={pondFilter}
        onPondFilterChange={setPondFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddNew={handleAddNew}
        ponds={ponds}
        totalStaff={staffList.length}
        filteredCount={filteredStaff.length}
      />

      {/* Staff List View: Grid or Table */}
      {loading ? (
        <div className="dashboard-card p-12 text-center flex flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent mb-3" />
          <p className="text-xs text-[var(--text-muted)]">Đang tải danh sách nhân viên...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="dashboard-card p-12 text-center flex flex-col items-center justify-center">
          <Users className="w-10 h-10 text-[var(--accent)]/40 mb-3" />
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            Không tìm thấy nhân viên nào
          </h4>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
            Không có nhân viên phù hợp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.
          </p>
          {(searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL" || pondFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
                setPondFilter("ALL");
              }}
              className="mt-3 text-xs text-[var(--accent)] hover:underline cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 relative z-10">
          {filteredStaff.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
              ponds={ponds}
              farms={farms}
              onViewDetail={handleViewDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onReject={handleReject}
              onChangeStatus={handleChangeStatus}
              onAssignPond={canAssignPonds ? handleOpenAssignPond : undefined}
              onAssignFarm={canAssignFarms ? handleOpenAssignFarm : undefined}
              onToggleLoginLock={handleToggleLoginLock}
              canManage={canManageUI(staff)}
              canAssignFarms={canAssignFarms}
            />
          ))}
        </div>
      ) : (
        <div className="relative z-10">
          <StaffTable
            staffList={filteredStaff}
            ponds={ponds}
            farms={farms}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            onChangeStatus={handleChangeStatus}
            onAssignPond={canAssignPonds ? handleOpenAssignPond : undefined}
            onAssignFarm={canAssignFarms ? handleOpenAssignFarm : undefined}
            onToggleLoginLock={handleToggleLoginLock}
            canManage={canManageUI}
            canAssignFarms={canAssignFarms}
          />
        </div>
      )}

      {/* Modals */}
      <StaffFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveStaff}
        initialData={editingStaff}
        ponds={ponds}
      />

      <StaffDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        staff={detailStaff}
        ponds={ponds}
        farms={farms}
        onEdit={handleEdit}
        onApprove={handleApprove}
        onAssignPond={canAssignPonds ? handleOpenAssignPond : undefined}
        onAssignFarm={canAssignFarms ? handleOpenAssignFarm : undefined}
        onUnassignPond={canAssignPonds ? handleUnassignSinglePond : undefined}
        canManage={canManageUI(detailStaff)}
        canAssignFarms={canAssignFarms}
      />

      {/* Modal phân công ao nuôi cho Nông dân */}
      <AssignPondModal
        isOpen={assigningStaff !== null}
        onClose={() => setAssigningStaff(null)}
        staff={assigningStaff}
        ponds={assignablePonds}
        onSave={handleSaveAssignments}
      />

      {/* Modal phân công trại nuôi cho Quản lý (Admin) */}
      <AssignFarmToManagerModal
        isOpen={isAssignFarmOpen}
        onClose={() => {
          setIsAssignFarmOpen(false);
          setSelectedManagerForFarm(null);
        }}
        manager={selectedManagerForFarm}
        farms={farms}
        onSuccess={async () => {
          await loadFarms();
          await refetchPonds();
          showToast(`Đã cập nhật phân công trại nuôi cho Quản lý thành công!`, "success");
        }}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-3 text-xs text-[var(--text-muted)]">
          <button type="button" disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)} className="px-3 py-2 rounded-lg border border-[var(--panel-border)] disabled:opacity-50">Trước</button>
          <span>Trang {pagination.page}/{pagination.totalPages}</span>
          <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(pagination.page + 1)} className="px-3 py-2 rounded-lg border border-[var(--panel-border)] disabled:opacity-50">Sau</button>
        </div>
      )}

      {/* Action Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        variant={confirmConfig.variant}
        loading={confirmConfig.loading}
      />
    </div>
  );
}

