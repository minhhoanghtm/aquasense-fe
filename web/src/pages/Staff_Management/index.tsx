import { useState } from "react";
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
import ConfirmModal from "../../components/ConfirmModal";
import type { User, UserStatus } from "../../types/User";
import { Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "../../services/authApi";

const getRoleLevel = (role: string | undefined): number => {
  if (role === 'ADMIN') return 3;
  if (role === 'MANAGER') return 2;
  return 1;
};

export default function StaffManagement() {
  useDocumentTitle("Quản lý nhân viên");

  const { ponds } = usePonds();
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
    assignPonds,
  } = useStaff();

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailStaff, setDetailStaff] = useState<User | null>(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState<User | null>(null);

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
  const canManageStaff = (staff: User, actionName: string = "thực hiện hành động này") => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    if (getRoleLevel(staff.role) >= getRoleLevel(currentUser.role) && staff.id !== currentUser.id) {
      showToast(`Bạn không thể ${actionName} với người có quyền cùng cấp hoặc cao hơn!`, "error");
      return false;
    }
    return true;
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setIsFormOpen(true);
  };

  const handleEdit = (staff: User) => {
    if (!canManageStaff(staff, "thay đổi thông tin")) return;
    setEditingStaff(staff);
    setIsFormOpen(true);
  };

  const handleViewDetail = (staff: User) => {
    setDetailStaff(staff);
    setIsDetailOpen(true);
  };

  const handleAssignPond = (staff: User) => {
    if (!canManageStaff(staff, "phân ao nuôi")) return;
    setAssigningStaff(staff);
    setIsAssignOpen(true);
  };

  const handleDelete = (staff: User) => {
    if (!canManageStaff(staff, "xóa tài khoản")) return;
    
    setConfirmConfig({
      isOpen: true,
      title: "Xác nhận xóa nhân viên",
      description: (
        <span>
          Bạn có chắc chắn muốn xóa nhân viên <strong className="text-white">{staff.fullName}</strong>? Dữ liệu nhân viên sẽ bị xóa khỏi hệ thống và không thể hoàn tác.
        </span>
      ),
      confirmText: "Xác nhận xóa",
      variant: "danger",
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, loading: true }));
          await removeStaff(staff.id);
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
          await approveAccount(staff.id);
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
          await rejectAccount(staff.id);
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
          await changeStatus(staff.id, newStatus);
          showToast(`Đã chuyển trạng thái của ${staff.fullName} sang "${statusLabel}"`, "success");
        } catch (err: any) {
          showToast("Không thể cập nhật trạng thái", "error");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const handleSaveStaff = async (data: Partial<User>) => {
    if (editingStaff) {
      await editStaff(editingStaff.id, data);
      showToast(`Đã cập nhật thông tin ${data.fullName || editingStaff.fullName}`, "success");
    } else {
      await addStaff(data as any);
      showToast(`Đã thêm nhân viên ${data.fullName} thành công! Mật khẩu khởi tạo đã được gửi về email.`, "success");
    }
  };

  const handleSaveAssignPonds = async (staffId: string, pondIds: string[]) => {
    const targetStaff = staffList.find((s) => s.id === staffId || s.userId === staffId) || assigningStaff;
    const staffName = targetStaff?.fullName || "nhân viên";

    setConfirmConfig({
      isOpen: true,
      title: "Xác nhận cập nhật phân công vuông nuôi",
      description: (
        <span>
          Bạn có chắc chắn muốn cập nhật phân công <strong className="text-white">{pondIds.length}</strong> vuông nuôi cho nhân viên{" "}
          <strong className="text-white">{staffName}</strong>? Thay đổi sẽ được cập nhật trực tiếp vào cơ sở dữ liệu.
        </span>
      ),
      confirmText: "Lưu phân công",
      variant: "info",
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, loading: true }));
          await assignPonds(staffId, pondIds);
          showToast("Đã lưu phân công vuông nuôi thành công!", "success");
        } catch (err: any) {
          showToast("Lỗi khi lưu phân công vuông nuôi", "error");
        } finally {
          closeConfirm();
        }
      },
    });
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
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent mb-3" />
          <p className="text-xs text-[var(--text-muted)]">Đang tải danh sách nhân viên...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-center">
          <Users className="w-10 h-10 text-cyan-600/40 mb-3" />
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
              onViewDetail={handleViewDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAssignPond={handleAssignPond}
              onApprove={handleApprove}
              onReject={handleReject}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      ) : (
        <div className="relative z-10">
          <StaffTable
            staffList={filteredStaff}
            ponds={ponds}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssignPond={handleAssignPond}
            onApprove={handleApprove}
            onReject={handleReject}
            onChangeStatus={handleChangeStatus}
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
        onEdit={handleEdit}
        onAssignPond={handleAssignPond}
        onApprove={handleApprove}
      />

      <AssignPondModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        staff={assigningStaff}
        ponds={ponds}
        onSave={handleSaveAssignPonds}
      />

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

