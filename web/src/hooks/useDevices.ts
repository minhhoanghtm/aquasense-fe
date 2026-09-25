import { useEffect, useState } from "react";
import type { Devices } from "../types/Devices";
import { getDevices } from "../services/deviceApi";

let cachedDevices: Devices[] = [];

export const invalidateDevicesCache = () => {
    cachedDevices = [];
    window.dispatchEvent(new Event("devices-updated"));
};

export const useDevices = () => {
    const [devices, setDevices] = useState<Devices[]>(cachedDevices);
    const [loading, setLoading] = useState(cachedDevices.length === 0);

    const fetchDevices = async (force: boolean = false) => {
        try {
            if (cachedDevices.length === 0 || force) {
                setLoading(true);
            }
            const data = await getDevices();
            cachedDevices = data;
            setDevices(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách thiết bị:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();

        const handleUpdate = () => {
            fetchDevices(true);
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
        refetch: () => fetchDevices(true),
    };
};
