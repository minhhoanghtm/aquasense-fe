import type { Devices } from "../types/Devices";
import { api } from "./api";

export const getDevicesByPondId = async (pondId: string): Promise<Devices[] | null> => {
    return await api<Devices[]>(`/devices?pondId=${pondId}`);
}