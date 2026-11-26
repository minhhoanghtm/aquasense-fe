import { useState, useEffect, useCallback, useMemo } from "react";
import Title from "../../components/Title";
import PondDevices from "../../features/Ponds/components/PondDevices";
import { PondInfo } from "../../features/Ponds/components/PondInfo";
import PondList from "../../features/Ponds/components/PondList";
import WaterQualitySummary from "../../features/Ponds/components/WaterQualitySummary";
import PondFormModal from "../../features/Ponds/components/PondFormModal";
import ThresholdConfigModal from "../../features/Ponds/components/ThresholdConfigModal";
import ManualTestLogModal from "../../features/Ponds/components/ManualTestLogModal";
import AssignFarmerToPondModal from "../../features/Ponds/components/AssignFarmerToPondModal";
import Dropdown, { type DropdownOption } from "../../components/Dropdown";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds, invalidatePondsCache } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useWaterQuality } from "../../hooks/useWaterQuality";
import { useTelemetryRealtime } from "../../hooks/useTelemetryRealtime";
import {
  getFeedingSchedules,
  createPond,
  updatePond,
  deletePond,
  type FeedingScheduleItem,
  type CreatePondPayload,
} from "../../services/pondApi";
import { getDevicesByPondId } from "../../services/deviceApi";
import { getFarms } from "../../services/farmApi";
import { getStaffList } from "../../services/staffApi";
import type { Farm } from "../../types/Farm";
import type { Devices } from "../../types/Devices";
import type { Pond, PondStatus } from "../../types/Pond";
import type { User } from "../../types/User";
import { CheckCircle2, AlertCircle, Search, Plus, Building2 } from "lucide-react";
import { getCurrentUser } from "../../services/authApi";
import { canManagePonds } from "../../lib/rolePermissions";
import {
  getErrorMessage,
  isAbortError,
  isPondResourceRevocationError,
  isPondRevoked,
  reportRevokedPond,
} from "../../services/pondAccessControl";

export const Monitoring = () => {
  useDocumentTitle("Quản lý vuông nuôi");
  const currentUser = getCurrentUser();
  const canManage = canManagePonds(currentUser?.role);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PondStatus | "">("");
  const [farmFilter, setFarmFilter] = useState<string>("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);

  useEffect(() => {
    if (!canManage) return;
    getFarms({ limit: 100 })
      .then((res) => {
        setFarms(res.data || []);
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách trại nuôi:", err);
      });
    getStaffList({ limit: 100 })
      .then((res) => {
        setStaffList(res.data || []);
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách nhân sự:", err);
      });
  }, [canManage]);

  const farmOptions: DropdownOption[] = useMemo(
    () => [
      {
        label: `Tất cả trại nuôi ${farms.length > 0 ? `(${farms.length})` : ""}`,
        value: "",
      },
      ...farms.map((f) => ({
        label: f.farmName,
        value: f.farmId,
        badge: f.pondCount !== undefined ? `${f.pondCount} ao` : undefined,
        description: f.address || undefined,
      })),
    ],
    [farms]
  );

  const statusOptions: DropdownOption[] = useMemo(
    () => [
      { label: "Tất cả trạng thái", value: "" },
      { label: "Đang nuôi", value: "ACTIVE" },
      { label: "Đã thu hoạch", value: "HARVESTED" },
      { label: "Ao trống", value: "EMPTY" },
    ],
    []
  );

  const { ponds, pagination, refetch, loading: pondsLoading, error: pondsError } = usePonds({
    page,
    limit: 10,
    search,
    status: statusFilter || undefined,
    farmId: farmFilter || undefined,
  });
  const [selectedPondId, setSelectedPondId] = useState<string>("");
  const [pondDevices, setPondDevices] = useState<Devices[]>([]);
  const [pondDevicesError, setPondDevicesError] = useState<string | null>(null);
  const [feedingSchedules, setFeedingSchedules] = useState<FeedingScheduleItem[]>([]);

  // Modals state
  const [isPondFormOpen, setIsPondFormOpen] = useState(false);
  const [editingPond, setEditingPond] = useState<Pond | null>(null);

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [selectedPondForThreshold, setSelectedPondForThreshold] = useState<Pond | null>(null);

  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [selectedPondForLog, setSelectedPondForLog] = useState<Pond | null>(null);

  const [isAssignFarmerOpen, setIsAssignFarmerOpen] = useState(false);
  const [selectedPondForAssign, setSelectedPondForAssign] = useState<Pond | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  useEffect(() => {
    if (pondsLoading) return;
    const validPonds = ponds.filter((p) => !isPondRevoked(p.id || p.pondId));
    if (validPonds.length === 0) {
      setSelectedPondId("");
      return;
    }
    if (!selectedPondId || isPondRevoked(selectedPondId) || !validPonds.some((p) => (p.id || p.pondId) === selectedPondId)) {
      setSelectedPondId(validPonds[0].id || validPonds[0].pondId || "");
    }
  }, [ponds, selectedPondId, pondsLoading]);

  const { pond, device, loading: pondLoading, error: pondError } = usePond(selectedPondId);
  const { waterQuality, loading: waterQualityLoading, error: waterQualityError } = useWaterQuality(selectedPondId);
  const selectedPondDeviceIds = useMemo(
    () => pondDevices.map((d) => d.deviceId || d.id).filter((id): id is string => Boolean(id)),
    [pondDevices],
  );
  useTelemetryRealtime(selectedPondId, selectedPondDeviceIds);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setPondDevices([]);
    setFeedingSchedules([]);
    setPondDevicesError(null);

    if (!selectedPondId || isPondRevoked(selectedPondId)) {
      return () => {
        cancelled = true;
        controller.abort();
      };
    }

    void (async () => {
      try {
        const [devices, schedules] = await Promise.all([
          getDevicesByPondId(selectedPondId, { signal: controller.signal }),
          getFeedingSchedules(selectedPondId),
        ]);

        if (!cancelled && !isPondRevoked(selectedPondId)) {
          setPondDevices(devices);
          setFeedingSchedules(schedules);
        }
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) return;
        if (!cancelled) {
          setPondDevices([]);
          setFeedingSchedules([]);
          const message = getErrorMessage(error, `Không thể tải thiết bị cho mã ao ${selectedPondId}.`);
          setPondDevicesError(message);
          if (isPondResourceRevocationError(error, "http")) {
            reportRevokedPond(selectedPondId, message);
          }
        }
      }
    })();

    const handleRevoked = (event: Event) => {
      const revokedId = (event as CustomEvent<{ pondId?: string; message?: string }>).detail?.pondId;
      if (revokedId !== selectedPondId) return;
      controller.abort();
      setPondDevices([]);
      setFeedingSchedules([]);
      setPondDevicesError("Bạn không được phân công cho ao nuôi này!");
    };

    window.addEventListener("pond-access-revoked", handleRevoked);

    return () => {
      cancelled = true;
      controller.abort();
      window.removeEventListener("pond-access-revoked", handleRevoked);
    };
  }, [selectedPondId]);

  // Handlers
  const handleAddNewPond = useCallback(() => {
    setEditingPond(null);
    setIsPondFormOpen(true);
  }, []);

  const handleEditPond = useCallback((p: Pond) => {
    setEditingPond(p);
    setIsPondFormOpen(true);
  }, []);

  const handleOpenThresholds = useCallback((p: Pond) => {
    setSelectedPondForThreshold(p);
    setIsThresholdModalOpen(true);
  }, []);

  const handleOpenManualLogs = useCallback((p: Pond) => {
    setSelectedPondForLog(p);
    setIsManualLogModalOpen(true);
  }, []);

  const handleOpenAssignFarmer = useCallback((p: Pond) => {
    setSelectedPondForAssign(p);
    setIsAssignFarmerOpen(true);
  }, []);

  const handleDeletePond = useCallback(async (p: Pond) => {
    const pondId = p.pondId || p.id;
    if (!pondId) {
      showToast("Không xác định được ao nuôi cần xóa.", "error");
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa vuông nuôi "${p.name}"?`)) {
      try {
        await deletePond(pondId);
        showToast(`Đã xóa vuông nuôi "${p.name}" thành công!`, "success");
        invalidatePondsCache();
        refetch();
      } catch (err: any) {
        showToast(err.message || "Không thể xóa ao nuôi", "error");
      }
    }
  }, [refetch, showToast]);

  const handleSavePond = async (data: CreatePondPayload) => {
    if (editingPond) {
      const pondId = editingPond.pondId || editingPond.id;
      if (!pondId) {
        showToast("Không xác định được ao nuôi cần cập nhật.", "error");
        return;
      }
      await updatePond(pondId, data);
      showToast(`Đã cập nhật vuông nuôi "${data.pondName}"!`, "success");
    } else {
      const created = await createPond(data);
      showToast(`Đã tạo vuông nuôi mới "${data.pondName}"!`, "success");
      if (created.id) {
        setSelectedPondId(created.id);
      }
    }
    invalidatePondsCache();
    refetch();
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5 relative text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold animate-slideDown backdrop-blur-md ${
            toastMessage.type === "success"
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

      <div>
        <Title
          title="Quản lý vuông nuôi"
          description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
          pond={pond}
          device={device}
        />
      </div>

      {/* Toolbar: Search, Status filter, Add button */}
      <div className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border)] shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:flex-1 sm:flex-wrap min-w-0">
          {/* Search box with icon */}
          <div className="flex h-10 w-full sm:w-auto sm:flex-1 sm:max-w-xs shrink-0 items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] px-3 text-xs text-[var(--text-primary)] hover:border-cyan-500 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]/40 transition-colors">
            <Search size={15} className="shrink-0 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm vuông nuôi..."
              aria-label="Tìm tên ao"
              className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Farm filter dropdown - Chỉ dành cho Admin / Manager */}
          {canManage && (
            <div className="w-full sm:w-56">
              <Dropdown
                value={farmFilter}
                options={farmOptions}
                onChange={(val) => {
                  setFarmFilter(val);
                  setPage(1);
                }}
                icon={<Building2 size={14} className="text-cyan-400" />}
                placeholder="Lọc theo trại nuôi"
                searchPlaceholder="Tìm kiếm trại nuôi..."
              />
            </div>
          )}

          {/* Status filter dropdown */}
          <div className="w-full sm:w-44">
            <Dropdown
              value={statusFilter}
              options={statusOptions}
              onChange={(val) => {
                setStatusFilter(val as PondStatus | "");
                setPage(1);
              }}
              placeholder="Tất cả trạng thái"
              searchPlaceholder="Tìm trạng thái..."
            />
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleAddNewPond}
            className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] text-xs font-bold hover:brightness-110 shadow-md shadow-[var(--accent)]/20 transition cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Thêm vuông nuôi</span>
          </button>
        )}
      </div>

      {pondsLoading && ponds.length === 0 ? (
        <div className="dashboard-card p-6 text-sm text-[var(--text-muted)] text-center">
          Đang tải danh sách vuông nuôi...
        </div>
      ) : pondsError ? (
        <div role="alert" className="dashboard-card border-rose-900/50 p-6 text-sm text-rose-300 text-center">
          Không thể tải danh sách vuông nuôi: {pondsError}
        </div>
      ) : ponds.length === 0 ? (
        <div className="dashboard-card p-6 text-sm text-[var(--text-muted)] text-center">
          {search || statusFilter || farmFilter ? "Không tìm thấy vuông nuôi phù hợp bộ lọc." : "Bạn chưa được cấp quyền truy cập vuông nuôi nào."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start min-w-0">
            {/* Cột trái: Danh sách vuông & Thiết bị kết nối */}
            <div className="lg:col-span-4 min-w-0 flex flex-col gap-4 sm:gap-5">
              <PondList
                ponds={ponds}
                selectedId={selectedPondId}
                loading={pondsLoading}
                onSelect={(id) => setSelectedPondId(id)}
                pagination={pagination}
                onPageChange={setPage}
                showAssignmentInfo={canManage}
                staffList={staffList}
                onAssignFarmer={canManage ? handleOpenAssignFarmer : undefined}
              />
              {pondDevicesError ? (
                <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200">
                  {pondDevicesError}
                </div>
              ) : (
                <PondDevices devices={pondDevices} />
              )}
            </div>

            {/* Cột phải: Thông số chi tiết & Thao tác */}
            <div className="lg:col-span-8 min-w-0 flex flex-col gap-4 sm:gap-5">
              <PondInfo
                pond={pond}
                sensorReadings={pondError || waterQualityError ? [] : waterQuality?.sensorReadings}
                feedingSchedules={pondError ? [] : feedingSchedules}
                loadingSensors={waterQualityLoading || pondLoading}
                onEditPond={canManage ? handleEditPond : undefined}
                onOpenThresholds={handleOpenThresholds}
                onOpenManualLogs={handleOpenManualLogs}
                onDeletePond={canManage ? handleDeletePond : undefined}
                showAssignmentInfo={canManage}
                staffList={staffList}
                onAssignFarmer={canManage ? handleOpenAssignFarmer : undefined}
              />
            </div>
          </div>

          <div>
            <WaterQualitySummary />
          </div>
        </>
      )}

      {/* Modals */}
      <PondFormModal
        isOpen={isPondFormOpen}
        onClose={() => setIsPondFormOpen(false)}
        onSubmit={handleSavePond}
        initialData={editingPond}
        farms={farms}
      />

      <ThresholdConfigModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        pond={selectedPondForThreshold}
      />

      <ManualTestLogModal
        isOpen={isManualLogModalOpen}
        onClose={() => setIsManualLogModalOpen(false)}
        pond={selectedPondForLog}
      />

      {canManage && (
        <AssignFarmerToPondModal
          isOpen={isAssignFarmerOpen}
          onClose={() => {
            setIsAssignFarmerOpen(false);
            setSelectedPondForAssign(null);
          }}
          pond={selectedPondForAssign}
          staffList={staffList}
          onSuccess={async () => {
            showToast(
              `Đã cập nhật phân công Farmer cho vuông "${
                selectedPondForAssign?.pondName || selectedPondForAssign?.name || ""
              }" thành công!`,
              "success"
            );
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default Monitoring;
