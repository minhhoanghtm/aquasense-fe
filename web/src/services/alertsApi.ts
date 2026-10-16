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
    const alertLevel = raw.alertLevel || raw.alert_level || raw.level || "";
    const status = raw.status || (raw.isResolved ? "RESOLVED" : "");

    return {
        id: alertId,
        alertId: alertId,
        pondId: raw.pondId || raw.pond_id || raw.pond?.pondId || raw.pond?.id || "",
        metricName: raw.metricName || raw.metric_name || raw.parameterId || "",
        triggeredValue: raw.triggeredValue ?? raw.triggered_value ?? raw.value,
        alertLevel: alertLevel,
        level: alertLevel,
        status: status,
        createdAt: raw.createdAt || raw.created_at || raw.time || "",
        resolvedAt: raw.resolvedAt || raw.resolved_at || null,
        resolutionNote: raw.resolutionNote || raw.resolution_note || null,
        recommendation: raw.recommendation,
        title: raw.title || raw.message || raw.metricName || "",
        pondName: raw.pondName || raw.pond?.pondName || raw.pond?.name || "",
        unit: raw.unit || "",
        message: raw.message || "",
        isRead: raw.isRead ?? (status === "RESOLVED"),
        time: raw.time || raw.createdAt || raw.created_at || "",
        source: raw.source || raw.device?.deviceName || "",
        deviceId: raw.deviceId || raw.device_id || raw.device?.deviceId || "",
        predictionId: raw.predictionId || null,
        thresholdId: raw.thresholdId || "",
    };
};

export const getAlertPondById = async (pondId: string): Promise<Alerts[]> => {
    // QueryAlertDto supports deviceId and isResolved, but not pondId. Fetching
    // the verified collection route and filtering its returned pond relation
    // avoids silently sending an ignored query parameter.
    const alerts = await getAlerts();
    return alerts.filter((alert) => alert.pondId === pondId);
};

export const getAlerts = async (): Promise<Alerts[]> => {
    const res = await api<any>("/alerts");
    // Backend returns the paginated payload inside the common response envelope.
    const rawList = res?.data ?? (Array.isArray(res) ? res : []);
    return Array.isArray(rawList) ? rawList.map(normalizeAlert) : [];
};

export const getAlertRules = async (): Promise<AlertRule[]> => {
    // The real backend does not currently expose alert rules.
    return [];
};
