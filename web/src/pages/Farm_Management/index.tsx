import { useState, useEffect, useCallback } from "react";
import Title from "../../components/Title";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { FarmStats } from "../../features/Farms/components/FarmStats";
import { FarmToolbar } from "../../features/Farms/components/FarmToolbar";
import { FarmCard } from "../../features/Farms/components/FarmCard";
import { FarmTable } from "../../features/Farms/components/FarmTable";
import { FarmFormModal } from "../../features/Farms/components/FarmFormModal";
import { FarmPondsModal } from "../../features/Farms/components/FarmPondsModal";
import { AssignFarmManagerModal } from "../../features/Farms/components/AssignFarmManagerModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import {
  getFarms,
  createFarm,
  updateFarm,
  deleteFarm,
} from "../../services/farmApi";
import { getStaffList } from "../../services/staffApi";
import { getCurrentUser } from "../../services/authApi";
import { canManagePonds } from "../../lib/rolePermissions";
import type {
  Farm,
  CreateFarmPayload,
  UpdateFarmPayload,
} from "../../types/Farm";
import type { User } from "../../types/User";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function FarmManagement() {
  useDocumentTitle("Quản lý trại nuôi");

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role?.toUpperCase() === "ADMIN";
  const isAdminOrManager = canManagePonds(currentUser?.role);

  // Data states
  const [farms, setFarms] = useState<Farm[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination states
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 12,
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isPondsModalOpen, setIsPondsModalOpen] = useState(false);
  const [selectedFarmForPonds, setSelectedFarmForPonds] = useState<Farm | null>(null);

  const [isAssignManagerOpen, setIsAssignManagerOpen] = useState(false);
  const [selectedFarmForManager, setSelectedFarmForManager] = useState<Farm | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    farm: Farm | null;
    loading: boolean;
  }>({
    isOpen: false,
    farm: null,
    loading: false,
  });

  // Toast feedback
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load staff list to display Manager assignment info accurately
  useEffect(() => {
    if (!isAdminOrManager) return;
    getStaffList({ limit: 100 })
      .then((res) => {
        setStaffList(res.data || []);
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách nhân sự:", err);
      });
  }, [isAdminOrManager]);

  // Load farms from backend
  const fetchFarmsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFarms({
        page,
        limit: 12,
        search: search.trim() || undefined,
      });
      setFarms(res.data || []);
      setPagination({
        total: res.total,
        totalPages: res.totalPages,
        page: res.page,
        limit: res.limit,
      });
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách trại nuôi:", err);
      setError(err?.message || "Không thể kết nối đến máy chủ để lấy danh sách trại nuôi.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchFarmsList();
  }, [fetchFarmsList]);

  // Debounce search page reset
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // Create or Update
  const handleFormSubmit = async (payload: CreateFarmPayload | UpdateFarmPayload) => {
    setFormSubmitting(true);
    try {
      if (editingFarm) {
        await updateFarm(editingFarm.farmId, payload);
        showToast(`Cập nhật thông tin trại "${payload.farmName}" thành công!`, "success");
      } else {
        await createFarm(payload as CreateFarmPayload);
        showToast(`Thêm trại nuôi mới "${payload.farmName}" thành công!`, "success");
      }
      setIsFormOpen(false);
      setEditingFarm(null);
      await fetchFarmsList();
    } catch (err: any) {
      throw err;
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.farm) return;
    setDeleteConfirm((prev) => ({ ...prev, loading: true }));
    try {
      await deleteFarm(deleteConfirm.farm.farmId);
      showToast(`Đã xóa trại nuôi "${deleteConfirm.farm.farmName}" thành công!`, "success");
      setDeleteConfirm({ isOpen: false, farm: null, loading: false });
      await fetchFarmsList();
    } catch (err: any) {
      const msg = err?.message || "Không thể xóa trại nuôi này!";
      showToast(msg, "error");
      setDeleteConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5 text-left relative animate-fadeIn pb-12">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[120] flex items-center gap-3 px-4 py-3 rounded-2xl border bg-[#03161e]/95 backdrop-blur-xl shadow-2xl animate-slideIn">
          {toast.type === "success" && <CheckCircle2 className="text-emerald-400" size={18} />}
          {toast.type === "error" && <AlertCircle className="text-rose-400" size={18} />}
          {toast.type === "info" && <AlertCircle className="text-cyan-400" size={18} />}
          <span className="text-xs sm:text-sm font-semibold text-[var(--text-heading)]">
            {toast.text}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Title
          title="Quản lý trại nuôi"
          description="Hệ thống quản lý quy hoạch cơ sở, danh sách các trại nuôi và vuông nuôi trực thuộc"
          pond={null}
        />
      </div>

      {/* Stats summary */}
      <FarmStats farms={farms} totalFarms={pagination.total} />

      {/* Toolbar */}
      <FarmToolbar
        search={search}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddNew={
          isAdmin
            ? () => {
                setEditingFarm(null);
                setIsFormOpen(true);
              }
            : undefined
        }
        totalFiltered={pagination.total}
      />

      {/* Main Content Area */}
      {loading && farms.length === 0 ? (
        <div className="dashboard-card p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-teal-400" />
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Đang tải dữ liệu các trại nuôi...
          </p>
        </div>
      ) : error && farms.length === 0 ? (
        <div className="dashboard-card border-rose-900/50 p-8 text-center text-rose-300 text-xs sm:text-sm">
          <AlertCircle size={24} className="mx-auto mb-2 text-rose-400" />
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchFarmsList}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 border border-rose-500/30 text-xs font-semibold transition"
          >
            Thử tải lại
          </button>
        </div>
      ) : farms.length === 0 ? (
        <div className="dashboard-card p-12 text-center flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[var(--text-muted)] mb-3">
            <Building2 size={32} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-heading)]">
            {search ? "Không tìm thấy trại nuôi phù hợp" : "Chưa có trại nuôi nào"}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mt-1 leading-relaxed">
            {search
              ? "Hãy thử thay đổi từ khóa tìm kiếm theo tên hoặc địa chỉ trại nuôi."
              : "Bạn chưa thiết lập trại nuôi nào trong hệ thống. Hãy tạo trại nuôi đầu tiên để quản lý các vuông nuôi."}
          </p>
          {!search && isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditingFarm(null);
                setIsFormOpen(true);
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] text-xs sm:text-sm font-bold hover:brightness-110 shadow-md transition cursor-pointer"
            >
              + Thêm trại nuôi mới
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {farms.map((farm) => (
                <FarmCard
                  key={farm.farmId}
                  farm={farm}
                  showAssignmentInfo={isAdminOrManager}
                  staffList={staffList}
                  canAssignManager={isAdmin}
                  onAssignManager={
                    isAdmin
                      ? (f) => {
                          setSelectedFarmForManager(f);
                          setIsAssignManagerOpen(true);
                        }
                      : undefined
                  }
                  onViewPonds={(f) => {
                    setSelectedFarmForPonds(f);
                    setIsPondsModalOpen(true);
                  }}
                  onEdit={
                    isAdmin
                      ? (f) => {
                          setEditingFarm(f);
                          setIsFormOpen(true);
                        }
                      : undefined
                  }
                  onDelete={
                    isAdmin
                      ? (f) => {
                          setDeleteConfirm({
                            isOpen: true,
                            farm: f,
                            loading: false,
                          });
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <FarmTable
              farms={farms}
              showAssignmentInfo={isAdminOrManager}
              staffList={staffList}
              canAssignManager={isAdmin}
              onAssignManager={
                isAdmin
                  ? (f) => {
                       setSelectedFarmForManager(f);
                       setIsAssignManagerOpen(true);
                    }
                  : undefined
              }
              onViewPonds={(f) => {
                setSelectedFarmForPonds(f);
                setIsPondsModalOpen(true);
              }}
              onEdit={
                isAdmin
                  ? (f) => {
                      setEditingFarm(f);
                      setIsFormOpen(true);
                    }
                  : undefined
              }
              onDelete={
                isAdmin
                  ? (f) => {
                      setDeleteConfirm({
                        isOpen: true,
                        farm: f,
                        loading: false,
                      });
                    }
                  : undefined
              }
            />
          )}

          {/* Phân trang */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 text-xs text-[var(--text-muted)] px-2">
              <span>
                Trang <strong className="text-white font-semibold">{pagination.page}</strong> / {pagination.totalPages}
                {" · "}Tổng cộng {pagination.total} trại nuôi
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] text-xs text-[var(--text-primary)] hover:border-teal-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] text-xs text-[var(--text-primary)] hover:border-teal-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <span>Sau</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Thêm / Chỉnh sửa */}
      <FarmFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFarm(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingFarm}
        loading={formSubmitting}
      />

      {/* Modal Phân quyền Quản lý cho Trại (Chỉ dành cho Admin) */}
      <AssignFarmManagerModal
        isOpen={isAssignManagerOpen}
        onClose={() => {
          setIsAssignManagerOpen(false);
          setSelectedFarmForManager(null);
        }}
        farm={selectedFarmForManager}
        onSuccess={async () => {
          showToast(`Đã phân quyền Quản lý phụ trách trại "${selectedFarmForManager?.farmName}" thành công!`, "success");
          await fetchFarmsList();
        }}
      />

      {/* Modal Chi tiết vuông nuôi */}
      <FarmPondsModal
        isOpen={isPondsModalOpen}
        onClose={() => {
          setIsPondsModalOpen(false);
          setSelectedFarmForPonds(null);
        }}
        farm={selectedFarmForPonds}
      />

      {/* Modal Xác nhận Xóa */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, farm: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa trại nuôi"
        description={
          <div>
            Bạn có chắc chắn muốn xóa trại nuôi{" "}
            <strong className="text-white">{deleteConfirm.farm?.farmName}</strong> không?
            <p className="mt-2 text-rose-300 text-xs">
              Lưu ý: Nếu trại này đang chứa các vuông nuôi, máy chủ sẽ từ chối xóa để bảo vệ toàn vẹn dữ liệu. Bạn cần chuyển hoặc xóa các vuông nuôi trước.
            </p>
          </div>
        }
        confirmText="Xóa trại nuôi"
        cancelText="Hủy bỏ"
        variant="danger"
        loading={deleteConfirm.loading}
      />
    </div>
  );
}
