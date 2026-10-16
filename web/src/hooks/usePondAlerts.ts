import { useEffect, useState } from "react";
import type { Alerts } from "../types/Alerts";
import { getAlertPondById } from "../services/alertsApi";

export const usePondAlerts = (pondId: string) => {
    const [alerts, setAlerts] = useState<Alerts[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pondId) {
            setAlerts([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const fetchAlerts = async () => {
            try {
                setError(null);
                setAlerts([]);
                setLoading(true);

                const data = await getAlertPondById(pondId);

                if (!cancelled) setAlerts(data);
            } catch (error) {
                console.error("Lỗi lấy cảnh báo của ao:", error);
                if (!cancelled) setError(error instanceof Error ? error.message : "Không thể tải cảnh báo ao.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchAlerts();
        return () => { cancelled = true; };
    }, [pondId]);

    return {
        alerts,
        loading,
        error,
    };
};
