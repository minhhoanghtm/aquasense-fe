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
        let requestVersion = 0;
        const fetchPond = async () => {
            const requestId = ++requestVersion;
            try {
                setError(null);
                setLoading(true);
                // Never display the previous pond while a new selection is loading.
                setPond(null);
                setDevice(null);
                setDevices([]);

                const data = await getPondDashboard(pondId);
                const devicesList = Array.isArray(data.devices) ? data.devices : [];
                const dev = devicesList.length > 0 ? (devicesList[0] as Devices) : null;

                if (!cancelled && requestId === requestVersion) {
                    setPond(data.pond);
                    setDevice(dev);
                    setDevices(devicesList);
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin ao:", error);
                if (!cancelled && requestId === requestVersion) {
                    setDevice(null);
                    setDevices([]);
                    setPond(null);
                    setError(error instanceof Error ? error.message : "Không thể tải thông tin ao.");
                }
            } finally {
                if (!cancelled && requestId === requestVersion) setLoading(false);
            }
        };

        fetchPond();

        const handleUpdate = () => {
            fetchPond();
        };

        window.addEventListener("ponds-updated", handleUpdate);
        const handleTelemetryUpdate = (event: Event) => {
            const detail = (event as CustomEvent<{ pondId?: string }>).detail;
            // The event only triggers a re-fetch; it never decides ONLINE locally.
            if (detail?.pondId === pondId) void fetchPond();
        };
        window.addEventListener("telemetry-updated", handleTelemetryUpdate);

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") void fetchPond();
        }, 30_000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") void fetchPond();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            cancelled = true;
            window.removeEventListener("ponds-updated", handleUpdate);
            window.removeEventListener("telemetry-updated", handleTelemetryUpdate);
            window.clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
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
