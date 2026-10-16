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

export const useAIAnalysis = (pondId?: string, includeParameterHealth: boolean = true) => {
    const [predictions, setPredictions] = useState<AIPrediction[]>([]);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
    const [parameterHealth, setParameterHealth] = useState<ParameterHealth[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!pondId) {
            setPredictions([]);
            setRecommendations([]);
            setAnomalies([]);
            setParameterHealth([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const fetchAIData = async () => {
            try {
                setError(null);
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
                if (!cancelled) setError(error instanceof Error ? error.message : "Không thể tải dữ liệu AI.");
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
        available: AI_ENDPOINTS_AVAILABLE,
    };
};
