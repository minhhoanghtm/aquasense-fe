import { useEffect, useState, useCallback } from "react";
import type { Devices } from "../types/Devices";
import { getDevices } from "../services/deviceApi";

export const invalidateDevicesCache = () => {
  window.dispatchEvent(new Event("devices-updated"));
};

export const useDevices = () => {
  const [devices, setDevices] = useState<Devices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDevices({ limit: 100 });
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách thiết bị:", err);
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách thiết bị IoT."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();

    const handleUpdate = () => {
      fetchDevices();
    };

    window.addEventListener("devices-updated", handleUpdate);
    return () => window.removeEventListener("devices-updated", handleUpdate);
  }, [fetchDevices]);

  const total = devices.length;
  const active = devices.filter(
    (d) =>
      d.status?.toUpperCase() === "ONLINE" ||
      d.status?.toUpperCase() === "ACTIVE" ||
      d.status === "Trực tuyến"
  ).length;
  const offline = devices.filter(
    (d) =>
      d.status?.toUpperCase() === "OFFLINE" ||
      d.status === "Ngoại tuyến"
  ).length;
  const warning = devices.filter(
    (d) =>
      d.status?.toUpperCase() === "WARNING" ||
      d.status?.toUpperCase() === "MAINTENANCE" ||
      d.status === "Pin yếu" ||
      d.status === "Cảnh báo" ||
      d.status === "Bảo trì" ||
      d.status === "Đang bảo trì" ||
      d.status === "Hỏng"
  ).length;

  return {
    devices,
    stats: { total, active, offline, warning },
    loading,
    error,
    refetch: fetchDevices,
  };
};
