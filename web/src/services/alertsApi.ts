import type { Alerts } from "../types/Alerts";
import { api } from "./api";

export interface AlertRule {
    id: string;
    iconType?: string;
    title: string;
    subtitle: string;
}

export interface AlertQuery {
    pondId?: string;
    isResolved?: boolean;
    startDate?: string;
    endDate?: string;
    limit?: number;
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
    const alerts = await getAlerts({ pondId });
    return alerts.filter((alert) => alert.pondId === pondId);
};

export const getAlerts = async (query?: AlertQuery): Promise<Alerts[]> => {
    const params = new URLSearchParams({ limit: String(query?.limit ?? 500) });
    if (query?.pondId) params.set("pondId", query.pondId);
    if (query?.isResolved !== undefined) params.set("isResolved", String(query.isResolved));
    if (query?.startDate) params.set("startDate", query.startDate);
    if (query?.endDate) params.set("endDate", query.endDate);

    const res = await api<any>(`/alerts?${params.toString()}`);
    // Backend returns the paginated payload inside the common response envelope.
    const rawList = res?.data ?? (Array.isArray(res) ? res : []);
    return Array.isArray(rawList) ? rawList.map(normalizeAlert) : [];
};

/** PATCH /alerts/:id/resolve — authorization is enforced by the backend. */
export const resolveAlert = async (alertId: string, resolutionNote?: string): Promise<Alerts> => {
    const result = await api<any>(`/alerts/${alertId}/resolve`, {
        method: "PATCH",
        body: JSON.stringify(resolutionNote?.trim() ? { resolutionNote: resolutionNote.trim() } : {}),
    });
    return normalizeAlert(result);
};

export const getAlertRules = async (): Promise<AlertRule[]> => {
    // The real backend does not currently expose alert rules.
    return [];
};
