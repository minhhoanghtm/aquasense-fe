import { useEffect, useState } from "react";
import { getCurrentWaterQuality } from "../services/pondApi";

export const useWaterQuality = (pondId?: string) => {
    const [waterQuality, setWaterQuality] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pondId) {
            setWaterQuality(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const fetchWaterQuality = async () => {
            try {
                setError(null);
                setLoading(true);

                const data = await getCurrentWaterQuality(pondId);

                if (!cancelled) setWaterQuality(data);
            } catch (error) {
                console.error("Lỗi lấy chỉ số nước:", error);
                if (!cancelled) setError(error instanceof Error ? error.message : "Không thể tải dữ liệu cảm biến.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchWaterQuality();
        const onTelemetryUpdate = (event: Event) => {
            const detail = (event as CustomEvent<{ pondId?: string }>).detail;
            if (detail?.pondId === pondId) void fetchWaterQuality();
        };
        window.addEventListener("telemetry-updated", onTelemetryUpdate);
        return () => {
            cancelled = true;
            window.removeEventListener("telemetry-updated", onTelemetryUpdate);
        };
    }, [pondId]);

    return {
        waterQuality,
        loading,
        error,
    };
};
