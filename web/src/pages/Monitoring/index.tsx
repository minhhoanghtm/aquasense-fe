import { useState, useEffect } from "react";
import Title from "../../components/Title";
import PondDevices from "../../features/Ponds/components/PondDevices";
import { PondInfo } from "../../features/Ponds/components/PondInfo";
import PondList from "../../features/Ponds/components/PondList";
import WaterQualitySummary from "../../features/Ponds/components/WaterQualitySummary";
import PondFormModal from "../../features/Ponds/components/PondFormModal";
import ThresholdConfigModal from "../../features/Ponds/components/ThresholdConfigModal";
import ManualTestLogModal from "../../features/Ponds/components/ManualTestLogModal";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds, invalidatePondsCache } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useWaterQuality } from "../../hooks/useWaterQuality";
import {
  getFeedingSchedules,
  createPond,
  updatePond,
  deletePond,
  type FeedingScheduleItem,
  type CreatePondPayload,
} from "../../services/pondApi";
import { getDevicesByPondId } from "../../services/deviceApi";
import type { Devices } from "../../types/Devices";
import type { Pond, PondStatus } from "../../types/Pond";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getCurrentUser } from "../../services/authApi";
import { canManagePonds } from "../../lib/rolePermissions";

export const Monitoring = () => {
  useDocumentTitle("Quản lý vuông nuôi");
  const canManage = canManagePonds(getCurrentUser()?.role);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PondStatus | "">("");
  const { ponds, pagination, refetch, loading: pondsLoading, error: pondsError } = usePonds({ page, limit: 10, search, status: statusFilter || undefined });
  const [selectedPondId, setSelectedPondId] = useState<string>("");
  const [pondDevices, setPondDevices] = useState<Devices[]>([]);
  const [feedingSchedules, setFeedingSchedules] = useState<FeedingScheduleItem[]>([]);

  // Modals state
  const [isPondFormOpen, setIsPondFormOpen] = useState(false);
  const [editingPond, setEditingPond] = useState<Pond | null>(null);

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [selectedPondForThreshold, setSelectedPondForThreshold] = useState<Pond | null>(null);

  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [selectedPondForLog, setSelectedPondForLog] = useState<Pond | null>(null);

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

  useEffect(() => {
    if (ponds.length === 0) {
      setSelectedPondId("");
      return;
    }
    if (!selectedPondId || !ponds.some((p) => p.id === selectedPondId)) {
      setSelectedPondId(ponds[0].id || "");
    }
  }, [ponds, selectedPondId]);

  const { pond, device } = usePond(selectedPondId);
  const { waterQuality } = useWaterQuality(selectedPondId);

  useEffect(() => {
    if (selectedPondId) {
      getDevicesByPondId(selectedPondId).then((devs) => {
        if (devs) setPondDevices(devs);
      });
      getFeedingSchedules(selectedPondId).then((scheds) => {
        if (scheds) setFeedingSchedules(scheds);
      });
    } else {
      setPondDevices([]);
      setFeedingSchedules([]);
    }
  }, [selectedPondId]);

  // Handlers
  const handleAddNewPond = () => {
    setEditingPond(null);
    setIsPondFormOpen(true);
  };

  const handleEditPond = (p: Pond) => {
    setEditingPond(p);
    setIsPondFormOpen(true);
  };

  const handleOpenThresholds = (p: Pond) => {
    setSelectedPondForThreshold(p);
    setIsThresholdModalOpen(true);
  };

  const handleOpenManualLogs = (p: Pond) => {
    setSelectedPondForLog(p);
    setIsManualLogModalOpen(true);
  };

  const handleDeletePond = async (p: Pond) => {
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
  };

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

      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm tên ao" aria-label="Tìm tên ao" className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-xs text-[var(--text-primary)]" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as PondStatus | ""); setPage(1); }} aria-label="Lọc trạng thái ao" className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-xs text-[var(--text-primary)]">
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang nuôi</option>
          <option value="HARVESTED">Đã thu hoạch</option>
          <option value="EMPTY">Ao trống</option>
        </select>
        {canManage && <button type="button" onClick={handleAddNewPond} className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-[#041920]">Thêm ao</button>}
      </div>

      {pondsLoading ? (
        <div className="rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-6 text-sm text-(--text-muted)">
          Đang tải danh sách vuông nuôi...
        </div>
      ) : pondsError ? (
        <div className="rounded-3xl border border-rose-900/50 bg-(--panel-bg) p-6 text-sm text-rose-300">
          Không thể tải danh sách vuông nuôi: {pondsError}
        </div>
      ) : ponds.length === 0 ? (
        <div className="rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-6 text-sm text-(--text-muted)">
          {search || statusFilter ? "Không tìm thấy ao phù hợp bộ lọc." : "Bạn chưa được cấp quyền truy cập ao nuôi nào."}
        </div>
      ) : (
        <>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Cột trái: Danh sách vuông & Thiết bị kết nối */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
          <PondList
            ponds={ponds}
            selectedId={selectedPondId}
            onSelect={(id) => setSelectedPondId(id)}
          />
          <PondDevices devices={pondDevices} />
        </div>

        {/* Cột phải: Thông số chi tiết & Thao tác */}
        <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
          <PondInfo
            pond={pond}
            sensorReadings={waterQuality?.sensorReadings}
            feedingSchedules={feedingSchedules}
            onEditPond={canManage ? handleEditPond : undefined}
            onOpenThresholds={handleOpenThresholds}
            onOpenManualLogs={handleOpenManualLogs}
            onDeletePond={canManage ? handleDeletePond : undefined}
          />
        </div>
      </div>

      {pagination.totalPages > 1 && <div className="flex items-center justify-end gap-3 text-xs text-[var(--text-muted)]">
        <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-[var(--panel-border)] px-3 py-2 disabled:opacity-50">Trước</button>
        <span>Trang {pagination.page}/{pagination.totalPages} · {pagination.total} ao</span>
        <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-[var(--panel-border)] px-3 py-2 disabled:opacity-50">Sau</button>
      </div>}

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
    </div>
  );
};

export default Monitoring;



