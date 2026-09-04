import { useEffect, useState } from "react";
import type { Devices } from "../types/Devices";
import { getDevices } from "../services/deviceApi";

export const useDevices = () => {
    const [devices, setDevices] = useState<Devices[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                setLoading(true);
                const data = await getDevices();
                setDevices(data);
            } catch (error) {
                console.error("Lỗi lấy danh sách thiết bị:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
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
    };
};
