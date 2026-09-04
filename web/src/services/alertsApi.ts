import type { Alerts } from "../types/Alerts";
import { api } from "./api";

export interface AlertRule {
    id: string;
    iconType?: string;
    title: string;
    subtitle: string;
}

export const getAlertPondById = async (pondId: string): Promise<Alerts[]> => {
    return await api<Alerts[]>(`/alerts?pondId=${pondId}`);
};

export const getAlerts = async (): Promise<Alerts[]> => {
    return await api<Alerts[]>("/alerts");
};

export const getAlertRules = async (): Promise<AlertRule[]> => {
    return await api<AlertRule[]>("/alertRules");
};