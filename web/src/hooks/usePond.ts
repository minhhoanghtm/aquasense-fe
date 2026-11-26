import { useEffect, useState } from "react";
import type { Pond } from "../types/Pond";
import type { Devices } from "../types/Devices";
import { getPondDashboard } from "../services/pondApi";
import {
    getErrorMessage,
    isAbortError,
    isPondResourceRevocationError,
    isPondRevoked,
    reportRevokedPond,
} from "../services/pondAccessControl";

export const usePond = (pondId?: string) => {
    const [pond, setPond] = useState<Pond | null>(null);
    const [device, setDevice] = useState<Devices | null>(null);
    const [devices, setDevices] = useState<Devices[]>([]);
    const [loading, setLoading] = useState(Boolean(pondId && !isPondRevoked(pondId)));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pondId || isPondRevoked(pondId)) {
            setPond(null);
            setDevice(null);
            setDevices([]);
            setError(pondId && isPondRevoked(pondId) ? "Bạn không được phân công cho ao nuôi này!" : null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        let requestVersion = 0;
        let activeController: AbortController | null = null;
        let intervalId: number | null = null;

        const stopPolling = () => {
            if (intervalId !== null) {
                window.clearInterval(intervalId);
                intervalId = null;
            }
        };

        const abortCurrent = () => {
            if (activeController) {
                activeController.abort();
                activeController = null;
            }
        };

        const fetchPond = async () => {
            if (cancelled || isPondRevoked(pondId)) return;

            const requestId = ++requestVersion;
            abortCurrent();
            const controller = new AbortController();
            activeController = controller;

            try {
                setError(null);
                setLoading(true);
                // Never display the previous pond while a new selection is loading.
                setPond(null);
                setDevice(null);
                setDevices([]);

                const data = await getPondDashboard(pondId, { signal: controller.signal });
                const devicesList = Array.isArray(data.devices) ? data.devices : [];
                const dev = devicesList.length > 0 ? (devicesList[0] as Devices) : null;

                if (!cancelled && requestId === requestVersion && !isPondRevoked(pondId)) {
                    setPond(data.pond);
                    setDevice(dev);
                    setDevices(devicesList);
                }
            } catch (err) {
                if (isAbortError(err) || controller.signal.aborted) return;
                console.error("Lỗi lấy thông tin ao:", err);
                if (!cancelled && requestId === requestVersion) {
                    setDevice(null);
                    setDevices([]);
                    setPond(null);
                    const message = getErrorMessage(err, "Không thể tải thông tin ao.");
                    setError(message);
                    if (isPondResourceRevocationError(err, "http")) {
                        stopPolling();
                        reportRevokedPond(pondId, message);
                    }
                }
            } finally {
                if (!cancelled && requestId === requestVersion) setLoading(false);
            }
        };

        fetchPond();

        const handleUpdate = () => {
            if (!isPondRevoked(pondId)) void fetchPond();
        };

        const handleTelemetryUpdate = (event: Event) => {
            const detail = (event as CustomEvent<{ pondId?: string }>).detail;
            // The event only triggers a re-fetch; it never decides ONLINE locally.
            if (detail?.pondId === pondId && !isPondRevoked(pondId)) void fetchPond();
        };

        const handlePondRevoked = (event: Event) => {
            const detail = (event as CustomEvent<{ pondId?: string; message?: string }>).detail;
            if (detail?.pondId !== pondId) return;
            requestVersion += 1;
            stopPolling();
            abortCurrent();
            setPond(null);
            setDevice(null);
            setDevices([]);
            setLoading(false);
            setError(detail?.message || "Bạn không được phân công cho ao nuôi này!");
        };

        const handleAuthCleared = () => {
            requestVersion += 1;
            stopPolling();
            abortCurrent();
            setPond(null);
            setDevice(null);
            setDevices([]);
            setError(null);
            setLoading(false);
        };

        window.addEventListener("ponds-updated", handleUpdate);
        window.addEventListener("telemetry-updated", handleTelemetryUpdate);
        window.addEventListener("pond-access-revoked", handlePondRevoked);
        window.addEventListener("auth-cleared", handleAuthCleared);

        intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible" && !isPondRevoked(pondId)) {
                void fetchPond();
            }
        }, 30_000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && !isPondRevoked(pondId)) {
                void fetchPond();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            cancelled = true;
            requestVersion += 1;
            stopPolling();
            abortCurrent();
            window.removeEventListener("ponds-updated", handleUpdate);
            window.removeEventListener("telemetry-updated", handleTelemetryUpdate);
            window.removeEventListener("pond-access-revoked", handlePondRevoked);
            window.removeEventListener("auth-cleared", handleAuthCleared);
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
