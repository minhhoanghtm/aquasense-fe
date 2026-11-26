import { useEffect, useState } from "react";
import type { Alerts } from "../types/Alerts";
import { getAlertPondById } from "../services/alertsApi";
import {
    getErrorMessage,
    isAbortError,
    isPondResourceRevocationError,
    isPondRevoked,
    reportRevokedPond,
} from "../services/pondAccessControl";

export const usePondAlerts = (pondId: string) => {
    const [alerts, setAlerts] = useState<Alerts[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pondId || isPondRevoked(pondId)) {
            setAlerts([]);
            setError(pondId && isPondRevoked(pondId) ? "Bạn không được phân công cho ao nuôi này!" : null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        let requestVersion = 0;
        let activeController: AbortController | null = null;

        const abortCurrent = () => {
            if (activeController) {
                activeController.abort();
                activeController = null;
            }
        };

        const fetchAlerts = async () => {
            if (cancelled || isPondRevoked(pondId)) return;

            const requestId = ++requestVersion;
            abortCurrent();
            const controller = new AbortController();
            activeController = controller;

            try {
                setError(null);
                setAlerts([]);
                setLoading(true);

                const data = await getAlertPondById(pondId, { signal: controller.signal });

                if (!cancelled && requestId === requestVersion && !isPondRevoked(pondId)) {
                    setAlerts(data);
                }
            } catch (err) {
                if (isAbortError(err) || controller.signal.aborted) return;
                console.error("Lỗi lấy cảnh báo của ao:", err);
                if (!cancelled && requestId === requestVersion) {
                    setAlerts([]);
                    const message = getErrorMessage(err, "Không thể tải cảnh báo ao.");
                    setError(message);
                    if (isPondResourceRevocationError(err, "http")) {
                        reportRevokedPond(pondId, message);
                    }
                }
            } finally {
                if (!cancelled && requestId === requestVersion) setLoading(false);
            }
        };

        fetchAlerts();

        const onAlertsUpdate = (event: Event) => {
            const detail = (event as CustomEvent<{ pondId?: string }>).detail;
            if ((!detail?.pondId || detail.pondId === pondId) && !isPondRevoked(pondId)) {
                void fetchAlerts();
            }
        };

        const handlePondRevoked = (event: Event) => {
            const detail = (event as CustomEvent<{ pondId?: string; message?: string }>).detail;
            if (detail?.pondId !== pondId) return;
            requestVersion += 1;
            abortCurrent();
            setAlerts([]);
            setLoading(false);
            setError(detail?.message || "Bạn không được phân công cho ao nuôi này!");
        };

        const handleAuthCleared = () => {
            requestVersion += 1;
            abortCurrent();
            setAlerts([]);
            setError(null);
            setLoading(false);
        };

        window.addEventListener("alerts-updated", onAlertsUpdate);
        window.addEventListener("pond-access-revoked", handlePondRevoked);
        window.addEventListener("auth-cleared", handleAuthCleared);

        return () => {
            cancelled = true;
            requestVersion += 1;
            abortCurrent();
            window.removeEventListener("alerts-updated", onAlertsUpdate);
            window.removeEventListener("pond-access-revoked", handlePondRevoked);
            window.removeEventListener("auth-cleared", handleAuthCleared);
        };
    }, [pondId]);

    return {
        alerts,
        loading,
        error,
    };
};
