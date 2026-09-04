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

    const dangerCount = alerts.filter(
        (a) => a.alertLevel === "DANGER" || a.level === "DANGER"
    ).length;

    const warningCount = alerts.filter(
        (a) => a.alertLevel === "WARNING" || a.level === "WARNING"
    ).length;

    const resolvedCount = alerts.filter(
        (a) =>
            a.status === "RESOLVED" ||
            a.status === "ĐÃ XỬ LÝ" ||
            a.status === "Đã xử lý" ||
            a.isRead
    ).length;

    return {
        alerts,
        rules,
        summary: {
            danger: dangerCount,
            warning: warningCount,
            resolved: resolvedCount,
        },
        loading,
    };
};
