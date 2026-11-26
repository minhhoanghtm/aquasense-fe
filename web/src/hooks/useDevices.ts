import { useEffect, useRef, useState, useCallback } from "react";
import type { Devices } from "../types/Devices";
import { getDevices } from "../services/deviceApi";
import { getErrorMessage, isAbortError } from "../services/pondAccessControl";

export const invalidateDevicesCache = () => {
  window.dispatchEvent(new Event("devices-updated"));
};

export const useDevices = () => {
  const [devices, setDevices] = useState<Devices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const activeController = useRef<AbortController | null>(null);

  const fetchDevices = useCallback(async () => {
    const requestId = ++requestVersion.current;
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;

    try {
      setLoading(true);
      setError(null);
      const data = await getDevices({ limit: 100 }, { signal: controller.signal });
      if (controller.signal.aborted || requestId !== requestVersion.current) return;
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted || requestId !== requestVersion.current) return;
      console.error("Lỗi lấy danh sách thiết bị:", err);
      setDevices([]);
      setError(getErrorMessage(err, "Không thể tải danh sách thiết bị IoT."));
    } finally {
      if (requestId === requestVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDevices();

    const handleUpdate = () => {
      void fetchDevices();
    };

    const handlePondRevoked = (event: Event) => {
      const revokedPondId = (event as CustomEvent<{ pondId?: string }>).detail?.pondId;
      if (!revokedPondId) return;
      setDevices((prev) => prev.filter((d) => d.pondId !== revokedPondId));
    };

    const handleAuthCleared = () => {
      requestVersion.current += 1;
      activeController.current?.abort();
      activeController.current = null;
      setDevices([]);
      setError(null);
      setLoading(false);
    };

    window.addEventListener("devices-updated", handleUpdate);
    window.addEventListener("ponds-updated", handleUpdate);
    window.addEventListener("pond-access-revoked", handlePondRevoked);
    window.addEventListener("auth-cleared", handleAuthCleared);

    return () => {
      activeController.current?.abort();
      window.removeEventListener("devices-updated", handleUpdate);
      window.removeEventListener("ponds-updated", handleUpdate);
      window.removeEventListener("pond-access-revoked", handlePondRevoked);
      window.removeEventListener("auth-cleared", handleAuthCleared);
    };
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
