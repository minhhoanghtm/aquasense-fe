import type { Alerts } from "../types/Alerts";
import { api } from "./api";

export interface AlertRule {
    id: string;
    iconType?: string;
    title: string;
    subtitle: string;
}

export const normalizeAlert = (raw: any): Alerts => {
    if (!raw) return {} as Alerts;
    const alertId = raw.alertId || raw.id || "";
    const alertLevel = raw.alertLevel || raw.alert_level || raw.level || "WARNING";
    const status = raw.status || (raw.isResolved ? "RESOLVED" : "ACTIVE");

    return {
        id: alertId,
        alertId: alertId,
        pondId: raw.pondId || raw.pond_id || raw.pond?.pondId || raw.pond?.id || "",
        metricName: raw.metricName || raw.metric_name || raw.parameterId || "",
        triggeredValue: raw.triggeredValue ?? raw.triggered_value ?? raw.value ?? 0,
        alertLevel: alertLevel,
        level: alertLevel,
        status: status,
        createdAt: raw.createdAt || raw.created_at || raw.time || new Date().toISOString(),
        resolvedAt: raw.resolvedAt || raw.resolved_at || null,
        resolutionNote: raw.resolutionNote || raw.resolution_note || null,
        recommendation: raw.recommendation,
        title: raw.title || raw.message || raw.metricName || "Cảnh báo chất lượng nước",
        pondName: raw.pondName || raw.pond?.pondName || raw.pond?.name || "",
        unit: raw.unit || "",
        message: raw.message || `Cảnh báo chỉ số ${raw.metricName || ""}`,
        isRead: raw.isRead ?? (status === "RESOLVED"),
        time: raw.time || raw.createdAt || raw.created_at || "",
        source: raw.source || raw.device?.deviceName || "",
        deviceId: raw.deviceId || raw.device_id || raw.device?.deviceId || "",
        predictionId: raw.predictionId || null,
        thresholdId: raw.thresholdId || "",
    };
};

export const getAlertPondById = async (pondId: string): Promise<Alerts[]> => {
    try {
        const res = await api<any>(`/alerts?pondId=${pondId}`);
        const rawList = Array.isArray(res) ? res : res?.data || [];
        return Array.isArray(rawList) ? rawList.map(normalizeAlert) : [];
    } catch (error) {
        console.error("Lỗi getAlertPondById:", error);
        return [];
    }
};

export const getAlerts = async (): Promise<Alerts[]> => {
    try {
        const res = await api<any>("/alerts");
        const rawList = Array.isArray(res) ? res : res?.data || [];
        return Array.isArray(rawList) ? rawList.map(normalizeAlert) : [];
    } catch (error) {
        console.error("Lỗi getAlerts:", error);
        return [];
    }
};

export const getAlertRules = async (): Promise<AlertRule[]> => {
    try {
        const res = await api<any>("/alertRules");
        const rawList = Array.isArray(res) ? res : res?.data || [];
        return Array.isArray(rawList) ? rawList : [];
    } catch {
        return [];
    }
};