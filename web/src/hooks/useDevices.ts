import { useEffect, useState } from "react";
import type { Devices } from "../types/Devices";
import { getDevices } from "../services/deviceApi";

export const invalidateDevicesCache = () => {
    window.dispatchEvent(new Event("devices-updated"));
};

export const useDevices = () => {
    const [devices, setDevices] = useState<Devices[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            setDevices([]);
            const data = await getDevices();
            setDevices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi lấy danh sách thiết bị:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();

        const handleUpdate = () => {
            fetchDevices();
        };

        window.addEventListener("devices-updated", handleUpdate);
        return () => window.removeEventListener("devices-updated", handleUpdate);
    }, []);

    const total = devices.length;
    const active = devices.filter(
        (d) => d.status?.toUpperCase() === "ONLINE" || d.status?.toUpperCase() === "ACTIVE" || d.status === "Trực tuyến"
    ).length;
    const offline = devices.filter(
        (d) => d.status?.toUpperCase() === "OFFLINE" || d.status === "Ngoại tuyến"
    ).length;
    const warning = devices.filter(
        (d) =>
            d.status?.toUpperCase() === "WARNING" ||
            d.status === "Pin yếu" ||
            d.status === "Cảnh báo"
    ).length;

    return {
        devices,
        stats: { total, active, offline, warning },
        loading,
        refetch: fetchDevices,
    };
};
