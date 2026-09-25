import { useState } from "react";
import Title from "../../components/Title";
import DeviceStats from "../../features/Sensors_Devices/DeviceStats";
import LatestReading from "../../features/Sensors_Devices/LatestReading";
import DeviceList from "../../features/Sensors_Devices/DeviceList";
import DeviceFormModal from "../../features/Sensors_Devices/DeviceFormModal";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useDevices, invalidateDevicesCache } from "../../hooks/useDevices";
import { useWaterQuality } from "../../hooks/useWaterQuality";
import {
  createDevice,
  updateDevice,
  deleteDevice,
} from "../../services/deviceApi";
import type { Devices as DeviceType } from "../../types/Devices";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Devices() {
  useDocumentTitle("Cảm biến & Thiết bị");

  const { ponds } = usePonds();
  const selectedPondId = ponds.length > 0 ? ponds[0].id : "";
  const { pond, device } = usePond(selectedPondId);
  const { devices, stats, refetch } = useDevices();
  const { waterQuality } = useWaterQuality(selectedPondId);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceType | null>(null);

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

  // Format latest readings if available
  const latestReading =
    waterQuality?.sensorReadings && waterQuality.sensorReadings.length > 0
      ? waterQuality.sensorReadings[waterQuality.sensorReadings.length - 1]
      : null;

  const dynamicMetrics = latestReading?.metrics?.map((m: any) => ({
    id: m.name,
    label: m.name.toUpperCase(),
    value: `${m.value} ${m.unit || ""}`.trim(),
    color: m.name === "pH" || m.name === "temperature" ? "cyan" : "amber",
  }));

  const handleAddNew = () => {
    setEditingDevice(null);
    setIsFormOpen(true);
  };

  const handleEditDevice = (dev: DeviceType) => {
    setEditingDevice(dev);
    setIsFormOpen(true);
  };

  const handleDeleteDevice = async (dev: DeviceType) => {
    const devId = dev.deviceId || dev.id;
    if (window.confirm(`Bạn có chắc chắn muốn xóa thiết bị "${dev.name || dev.deviceName}"?`)) {
      try {
        await deleteDevice(devId);
        showToast(`Đã xóa thiết bị "${dev.name || dev.deviceName}" thành công!`, "success");
        invalidateDevicesCache();
        refetch();
      } catch (err: any) {
        showToast(err.message || "Không thể xóa thiết bị", "error");
      }
    }
  };

  const handleSaveDevice = async (data: {
    deviceName: string;
    macAddress: string;
    pondId: string;
    firmwareVersion?: string;
    status?: string;
  }) => {
    if (editingDevice) {
      const devId = editingDevice.deviceId || editingDevice.id;
      await updateDevice(devId, data);
      showToast(`Đã cập nhật thiết bị "${data.deviceName}"!`, "success");
    } else {
      await createDevice(data);
      showToast(`Đã đăng ký thiết bị mới "${data.deviceName}"!`, "success");
    }
    invalidateDevicesCache();
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

      {/* Header Title */}
      <Title
        title="Cảm biến & Thiết bị"
        description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
        pond={pond}
        device={device}
      />

      {/* Thống kê thiết bị đầu trang */}
      <DeviceStats
        total={stats.total}
        active={stats.active}
        offline={stats.offline}
        warning={stats.warning}
      />

      {/* Danh sách thiết bị */}
      <DeviceList
        devices={devices}
        onAddNew={handleAddNew}
        onEditDevice={handleEditDevice}
        onDeleteDevice={handleDeleteDevice}
      />

      {/* Giá trị đo gần nhất */}
      <LatestReading
        deviceCode={device?.node_code || device?.serialNumber}
        deviceName={device?.name || "Gateway ESP32"}
        metrics={dynamicMetrics}
      />

      {/* Modal Thêm/Sửa thiết bị */}
      <DeviceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveDevice}
        initialData={editingDevice}
        ponds={ponds}
      />
    </div>
  );
}


