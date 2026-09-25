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
} from "../../services/pondApi";
import { getDevicesByPondId } from "../../services/deviceApi";
import type { Devices } from "../../types/Devices";
import type { Pond } from "../../types/Pond";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const Monitoring = () => {
  useDocumentTitle("Quản lý vuông nuôi");

  const { ponds, refetch } = usePonds();
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
    if (ponds.length > 0) {
      if (!selectedPondId || !ponds.some((p) => p.id === selectedPondId)) {
        setSelectedPondId(ponds[0].id);
      }
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

  const handleSavePond = async (data: {
    pondName: string;
    areaM2: number;
    depthM: number;
    shrimpDensity: number;
    status?: string;
  }) => {
    if (editingPond) {
      const pondId = editingPond.pondId || editingPond.id;
      await updatePond(pondId, data);
      showToast(`Đã cập nhật vuông nuôi "${data.pondName}"!`, "success");
    } else {
      const created = await createPond(data);
      showToast(`Đã tạo vuông nuôi mới "${data.pondName}"!`, "success");
      setSelectedPondId(created.id);
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Cột trái: Danh sách vuông & Thiết bị kết nối */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
          <PondList
            ponds={ponds}
            selectedId={selectedPondId}
            onSelect={(id) => setSelectedPondId(id)}
            onAddNew={handleAddNewPond}
          />
          <PondDevices devices={pondDevices} />
        </div>

        {/* Cột phải: Thông số chi tiết & Thao tác */}
        <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
          <PondInfo
            pond={pond}
            sensorReadings={waterQuality?.sensorReadings}
            feedingSchedules={feedingSchedules}
            onEditPond={handleEditPond}
            onOpenThresholds={handleOpenThresholds}
            onOpenManualLogs={handleOpenManualLogs}
            onDeletePond={handleDeletePond}
          />
        </div>
      </div>

      <div>
        <WaterQualitySummary />
      </div>

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



