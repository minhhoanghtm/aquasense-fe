import { useEffect, useState } from "react";
import {
    getAIPredictions,
    getAIRecommendations,
    getAnomalies,
    getParameterHealth,
    AI_ENDPOINTS_AVAILABLE,
    type AIPrediction,
    type AIRecommendation,
    type AnomalyItem,
    type ParameterHealth,
} from "../services/aiApi";
import { ApiError } from "../services/api";

export type PredictionAvailability =
    | "READY"
    | "TELEMETRY_MISSING"
    | "TELEMETRY_INVALID"
    | "TELEMETRY_STALE"
    | "TELEMETRY_FUTURE"
    | "AI_UNAVAILABLE";

const predictionAvailabilityFromError = (error: unknown): PredictionAvailability => {
    if (!(error instanceof ApiError)) return "AI_UNAVAILABLE";
    switch (error.code) {
        case "PREDICTION_TELEMETRY_MISSING": return "TELEMETRY_MISSING";
        case "PREDICTION_TELEMETRY_INVALID": return "TELEMETRY_INVALID";
        case "PREDICTION_TELEMETRY_STALE": return "TELEMETRY_STALE";
        case "PREDICTION_TELEMETRY_FUTURE": return "TELEMETRY_FUTURE";
        default: return "AI_UNAVAILABLE";
    }
};

export const useAIAnalysis = (pondId?: string, includeParameterHealth: boolean = true) => {
    const [predictions, setPredictions] = useState<AIPrediction[]>([]);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
    const [parameterHealth, setParameterHealth] = useState<ParameterHealth[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [predictionAvailability, setPredictionAvailability] = useState<PredictionAvailability>("READY");

    useEffect(() => {
        if (!pondId) {
            setPredictions([]);
            setRecommendations([]);
            setAnomalies([]);
            setParameterHealth([]);
            setLoading(false);
            setPredictionAvailability("READY");
            return;
        }

        let cancelled = false;
        const fetchAIData = async () => {
            try {
                setError(null);
                setPredictionAvailability("READY");
                setPredictions([]);
                setRecommendations([]);
                setAnomalies([]);
                setParameterHealth([]);
                setLoading(true);
                const parameterHealthRequest = includeParameterHealth
                    ? getParameterHealth()
                    : Promise.resolve([] as ParameterHealth[]);
                const [preds, recs, anoms, params] = await Promise.all([
                    getAIPredictions(pondId),
                    getAIRecommendations(pondId),
                    getAnomalies(pondId),
                    parameterHealthRequest,
                ]);

                if (!cancelled) {
                    setPredictions(preds);
                    setRecommendations(recs);
                    setAnomalies(anoms);
                    setParameterHealth(params);
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu AI:", error);
                if (!cancelled) {
                    setPredictionAvailability(predictionAvailabilityFromError(error));
                    setError(error instanceof Error ? error.message : "Không thể tải dữ liệu AI.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchAIData();
        return () => { cancelled = true; };
    }, [includeParameterHealth, pondId]);

    return {
        predictions,
        recommendations,
        anomalies,
        parameterHealth,
        loading,
        error,
        predictionAvailability,
        available: AI_ENDPOINTS_AVAILABLE,
    };
};
