import { useEffect, useState } from "react";
import type { Pond } from "../types/Pond";
import type { Devices } from "../types/Devices";
import { getPondDashboard } from "../services/pondApi";

export const usePond = (pondId?: string) => {
    const [pond, setPond] = useState<Pond | null>(null);
    const [device, setDevice] = useState<Devices | null>(null);
    const [devices, setDevices] = useState<Devices[]>([]);
    const [loading, setLoading] = useState(!!pondId);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pondId) {
            setPond(null);
            setDevice(null);
            setDevices([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const fetchPond = async () => {
            try {
                setError(null);
                setLoading(true);

                const data = await getPondDashboard(pondId);
                const devicesList = Array.isArray(data.devices) ? data.devices : [];
                const dev = devicesList.length > 0 ? (devicesList[0] as Devices) : null;

                if (!cancelled) {
                    setPond(data.pond);
                    setDevice(dev);
                    setDevices(devicesList);
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin ao:", error);
                if (!cancelled) setError(error instanceof Error ? error.message : "Không thể tải thông tin ao.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchPond();

        const handleUpdate = () => {
            fetchPond();
        };

        window.addEventListener("ponds-updated", handleUpdate);
        return () => {
            cancelled = true;
            window.removeEventListener("ponds-updated", handleUpdate);
        };
    }, [pondId]);

    return {
        pond,
        device,
        devices,
        loading,
        error,
    };
};
