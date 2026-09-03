import { useEffect, useState } from "react";
import type { Alerts } from "../types/Alerts";
import { getAlertPondById } from "../services/alertsApi";

export const usePondAlerts = (pondId: string) => {
    const [alerts, setAlerts] = useState<Alerts[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!pondId) {
            setAlerts([]);
            return;
        }

        const fetchAlerts = async () => {
            try {
                setLoading(true);

                const data = await getAlertPondById(pondId);

                setAlerts(data);
            } catch (error) {
                console.error("Lỗi lấy cảnh báo của ao:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, [pondId]);

    return {
        alerts,
        loading,
    };
};