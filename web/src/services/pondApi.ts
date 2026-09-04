// services/pondApi.ts

import type { Pond, PondWithDevices } from "../types/Pond";
import type { SensorReading } from "../types/SensorReading";
import type { Threshold } from "../types/Threshold";
import { api } from "./api";
import { getDevicesByPondId } from "./deviceApi";

//get all Ponds
export const getPonds = async (): Promise<Pond[]> => {
  return await api<Pond[]>("/ponds");
};

//get pond with devices
export const getPondsWithDevices = async (): Promise<PondWithDevices[]> => {
  const ponds = await getPonds();

  return Promise.all(
    ponds.map(async (pond) => {
      const devices = await getDevicesByPondId(pond.id);
      return { ...pond, devices: devices || [] };
    })
  );
};

//get pond dashboard data
export const getPondDashboard = async (pondId: string) => {
  const [pond, thresholds, sensorReadings, alerts, devices] =
    await Promise.all([
      api<Pond>(`/ponds/${pondId}`),

      api<Threshold[]>(
        `/thresholdConfigs?pondId=${pondId}`,
      ),

      api(`/sensorReadings?pondId=${pondId}`),

      api(`/alerts?pondId=${pondId}`),

      api(`/devices?pondId=${pondId}`),
    ]);

  return {
    pond,
    thresholds,
    sensorReadings,
    alerts,
    devices,
  };
};

//get current water quality
export const getCurrentWaterQuality = async (
  pondId: string
) => {
  const [sensorReadings, thresholds] = await Promise.all([
    api<SensorReading[]>(
      `/sensorReadings?pondId=${pondId}`
    ),

    api<Threshold[]>(
      `/thresholdConfigs?pondId=${pondId}`
    ),
  ]);

  return {
    sensorReadings,
    thresholds,
  };
};

export interface FeedingScheduleItem {
  id: string;
  pondId: string;
  time: string;
  title: string;
  description: string;
  completed: boolean;
}

export const getFeedingSchedules = async (pondId?: string): Promise<FeedingScheduleItem[]> => {
  const endpoint = pondId ? `/feedingSchedules?pondId=${pondId}` : "/feedingSchedules";
  return await api<FeedingScheduleItem[]>(endpoint);
};

