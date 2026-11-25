import { useEffect, useRef, useState } from "react";
import { getCurrentWaterQuality, type ThresholdConfigItem } from "../services/pondApi";
import type { SensorReading } from "../types/SensorReading";
import {
    MAX_SENSOR_READINGS,
    appendTelemetryReading,
    mapTelemetryPayloadToSensorReading,
    shouldFallbackTelemetryUpdate,
    type TelemetryMetricItem,
    type TelemetryUpdatedDetail,
    type WaterQualityData,
    type WaterQualitySensorReading,
} from "./waterQualityRealtime";

export {
    MAX_SENSOR_READINGS,
    appendTelemetryReading,
    mapTelemetryPayloadToSensorReading,
    shouldFallbackTelemetryUpdate,
};
export type {
    TelemetryMetricItem,
    TelemetryUpdatedDetail,
    WaterQualityData,
    WaterQualitySensorReading,
};

export const useWaterQuality = (pondId?: string) => {
    const [waterQuality, setWaterQuality] = useState<WaterQualityData<
        SensorReading,
        ThresholdConfigItem
    > | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        hasLoadedRef.current = false;

        if (!pondId) {
            return;
        }

        let cancelled = false;
        let requestVersion = 0;
        const fetchWaterQuality = async () => {
            const requestId = ++requestVersion;
            hasLoadedRef.current = false;
            try {
                setError(null);
                setLoading(true);
                // Clear data from the prior pond before the new request can resolve.
                setWaterQuality(null);

                const data = await getCurrentWaterQuality(pondId);

                if (!cancelled && requestId === requestVersion) {
                    hasLoadedRef.current = Array.isArray(data?.sensorReadings);
                    setWaterQuality(data);
                }
            } catch (error) {
                console.error("Lỗi lấy chỉ số nước:", error);
                if (!cancelled && requestId === requestVersion) {
                    hasLoadedRef.current = false;
                    setWaterQuality(null);
                    setError(error instanceof Error ? error.message : "Không thể tải dữ liệu cảm biến.");
                }
            } finally {
                if (!cancelled && requestId === requestVersion) setLoading(false);
            }
        };

        void fetchWaterQuality();
        const onTelemetryUpdate = (event: Event) => {
            const detail = (event as CustomEvent<TelemetryUpdatedDetail>).detail;
            if (detail?.pondId !== pondId) return;

            if (shouldFallbackTelemetryUpdate(hasLoadedRef.current, pondId, detail)) {
                void fetchWaterQuality();
                return;
            }

            setWaterQuality((prev) => appendTelemetryReading(prev, pondId, detail.data) ?? prev);
        };
        window.addEventListener("telemetry-updated", onTelemetryUpdate);
        return () => {
            cancelled = true;
            window.removeEventListener("telemetry-updated", onTelemetryUpdate);
        };
    }, [pondId]);

    return {
        waterQuality: pondId ? waterQuality : null,
        loading: pondId ? loading : false,
        error: pondId ? error : null,
    };
};
