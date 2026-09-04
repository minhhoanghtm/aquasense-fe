import type { Devices } from "../types/Devices";
import { api } from "./api";

export const getDevices = async (): Promise<Devices[]> => {
    return await api<Devices[]>("/devices");
};

export const getDevicesByPondId = async (pondId: string): Promise<Devices[] | null> => {
    return await api<Devices[]>(`/devices?pondId=${pondId}`);
};

export const getDeviceById = async (id: string): Promise<Devices | null> => {
    return await api<Devices>(`/devices/${id}`);
};