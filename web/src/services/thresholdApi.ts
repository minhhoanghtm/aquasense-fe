import type { Threshold } from "../types/Threshold"
import { api } from "./api"

export const getPondThresholds = async (pondId: string): Promise<Threshold[]> => {
  return api<Threshold[]>(`/thresholdConfigs?pondId=${pondId}`)
}