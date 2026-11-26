import { useEffect, useRef, useState } from "react";
import type { Alerts } from "../types/Alerts";
import { getAlerts, getAlertRules, type AlertRule } from "../services/alertsApi";
import { getErrorMessage, isAbortError } from "../services/pondAccessControl";

export const useAlertsHistory = () => {
    const [alerts, setAlerts] = useState<Alerts[]>([]);
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestVersion = useRef(0);
    const activeController = useRef<AbortController | null>(null);

    useEffect(() => {
        const fetchAlertsData = async () => {
            const requestId = ++requestVersion.current;
            activeController.current?.abort();
            const controller = new AbortController();
            activeController.current = controller;

            try {
                setLoading(true);
                setError(null);
                const [alertsData, rulesData] = await Promise.all([
                    getAlerts(undefined, { signal: controller.signal }),
                    getAlertRules(),
                ]);

                if (controller.signal.aborted || requestId !== requestVersion.current) return;
                setAlerts(alertsData);
                setRules(rulesData);
            } catch (err) {
                if (isAbortError(err) || controller.signal.aborted || requestId !== requestVersion.current) return;
                console.error("Lỗi lấy dữ liệu cảnh báo:", err);
                setAlerts([]);
                setError(getErrorMessage(err, "Không thể tải dữ liệu cảnh báo."));
            } finally {
                if (requestId === requestVersion.current) setLoading(false);
            }
        };

        void fetchAlertsData();

        const handlePondRevoked = (event: Event) => {
            const revokedPondId = (event as CustomEvent<{ pondId?: string }>).detail?.pondId;
            if (!revokedPondId) return;
            setAlerts((prev) => prev.filter((a) => a.pondId !== revokedPondId));
        };

        const handleAuthCleared = () => {
            requestVersion.current += 1;
            activeController.current?.abort();
            activeController.current = null;
            setAlerts([]);
            setRules([]);
            setError(null);
            setLoading(false);
        };

        window.addEventListener("alerts-updated", fetchAlertsData);
        window.addEventListener("ponds-updated", fetchAlertsData);
        window.addEventListener("pond-access-revoked", handlePondRevoked);
        window.addEventListener("auth-cleared", handleAuthCleared);

        return () => {
            activeController.current?.abort();
            window.removeEventListener("alerts-updated", fetchAlertsData);
            window.removeEventListener("ponds-updated", fetchAlertsData);
            window.removeEventListener("pond-access-revoked", handlePondRevoked);
            window.removeEventListener("auth-cleared", handleAuthCleared);
        };
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
        error,
        refetch: () => {
            window.dispatchEvent(new Event("alerts-updated"));
        },
    };
};
