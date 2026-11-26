import { useEffect, useState } from "react";
import { getCurrentWaterQuality } from "../services/pondApi";
import {
    getErrorMessage,
    isAbortError,
    isPondResourceRevocationError,
    isPondRevoked,
    reportRevokedPond,
} from "../services/pondAccessControl";

export const useWaterQuality = (pondId?: string) => {
    const [waterQuality, setWaterQuality] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pondId || isPondRevoked(pondId)) {
            setWaterQuality(null);
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

        const fetchWaterQuality = async () => {
            if (cancelled || isPondRevoked(pondId)) return;

            const requestId = ++requestVersion;
            abortCurrent();
            const controller = new AbortController();
            activeController = controller;

            try {
                setError(null);
                setLoading(true);
                // Clear data from the prior pond before the new request can resolve.
                setWaterQuality(null);

                const data = await getCurrentWaterQuality(pondId, { signal: controller.signal });

                if (!cancelled && requestId === requestVersion && !isPondRevoked(pondId)) {
                    setWaterQuality(data);
                }
            } catch (err) {
                if (isAbortError(err) || controller.signal.aborted) return;
                console.error("Lỗi lấy chỉ số nước:", err);
                if (!cancelled && requestId === requestVersion) {
                    setWaterQuality(null);
                    const message = getErrorMessage(err, "Không thể tải dữ liệu cảm biến.");
                    setError(message);
                    if (isPondResourceRevocationError(err, "http")) {
                        reportRevokedPond(pondId, message);
                    }
                }
            } finally {
                if (!cancelled && requestId === requestVersion) setLoading(false);
            }
        };

        fetchWaterQuality();

        const onTelemetryUpdate = (event: Event) => {
            const detail = (event as CustomEvent<{ pondId?: string }>).detail;
            if (detail?.pondId === pondId && !isPondRevoked(pondId)) {
                void fetchWaterQuality();
            }
        };

        const handlePondRevoked = (event: Event) => {
            const detail = (event as CustomEvent<{ pondId?: string; message?: string }>).detail;
            if (detail?.pondId !== pondId) return;
            requestVersion += 1;
            abortCurrent();
            setWaterQuality(null);
            setLoading(false);
            setError(detail?.message || "Bạn không được phân công cho ao nuôi này!");
        };

        const handleAuthCleared = () => {
            requestVersion += 1;
            abortCurrent();
            setWaterQuality(null);
            setError(null);
            setLoading(false);
        };

        window.addEventListener("telemetry-updated", onTelemetryUpdate);
        window.addEventListener("pond-access-revoked", handlePondRevoked);
        window.addEventListener("auth-cleared", handleAuthCleared);

        return () => {
            cancelled = true;
            requestVersion += 1;
            abortCurrent();
            window.removeEventListener("telemetry-updated", onTelemetryUpdate);
            window.removeEventListener("pond-access-revoked", handlePondRevoked);
            window.removeEventListener("auth-cleared", handleAuthCleared);
        };
    }, [pondId]);

    return {
        waterQuality,
        loading,
        error,
    };
};
