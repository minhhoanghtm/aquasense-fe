import { useEffect, useState } from "react";
import type { Alerts } from "../types/Alerts";
import { getAlerts, getAlertRules, type AlertRule } from "../services/alertsApi";

export const useAlertsHistory = () => {
    const [alerts, setAlerts] = useState<Alerts[]>([]);
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAlertsData = async () => {
            try {
                setLoading(true);
                const [alertsData, rulesData] = await Promise.all([
                    getAlerts(),
                    getAlertRules(),
                ]);

                setAlerts(alertsData);
                setRules(rulesData);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu cảnh báo:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlertsData();
    }, []);

    const safeAlerts = Array.isArray(alerts) ? alerts : [];

    const dangerCount = safeAlerts.filter(
        (a) => a.alertLevel === "CRITICAL" || a.alertLevel === "DANGER" || a.level === "DANGER" || a.level === "CRITICAL"
    ).length;

    const warningCount = safeAlerts.filter(
        (a) => a.alertLevel === "WARNING" || a.level === "WARNING"
    ).length;

    const resolvedCount = safeAlerts.filter(
        (a) =>
            a.status === "RESOLVED" ||
            String(a.status).toUpperCase() === "RESOLVED" ||
            String(a.status).toUpperCase() === "ĐÃ XỬ LÝ" ||
            a.isRead
    ).length;

    return {
        alerts: safeAlerts,
        rules,
        summary: {
            danger: dangerCount,
            warning: warningCount,
            resolved: resolvedCount,
        },
        loading,
    };
};
