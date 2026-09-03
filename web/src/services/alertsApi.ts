import type { Alerts } from "../types/Alerts";
import { api } from "./api";

export const getAlertPondById = async (pondId: string) => {
    return await api<Alerts[]>(`/alerts?pondId=${pondId}`);
};

export const getAlerts = async () => {
    return await api<Alerts[]>("/alerts");
};