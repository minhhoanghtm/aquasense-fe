import { useEffect, useState } from "react";
import {
    getAIPredictions,
    getAIRecommendations,
    getAnomalies,
    getParameterHealth,
    type AIPrediction,
    type AIRecommendation,
    type AnomalyItem,
    type ParameterHealth,
} from "../services/aiApi";

export const useAIAnalysis = (pondId?: string) => {
    const [predictions, setPredictions] = useState<AIPrediction[]>([]);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
    const [parameterHealth, setParameterHealth] = useState<ParameterHealth[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAIData = async () => {
            try {
                setLoading(true);
                const [preds, recs, anoms, params] = await Promise.all([
                    getAIPredictions(pondId),
                    getAIRecommendations(pondId),
                    getAnomalies(pondId),
                    getParameterHealth(),
                ]);

                setPredictions(preds);
                setRecommendations(recs);
                setAnomalies(anoms);
                setParameterHealth(params);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu AI:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAIData();
    }, [pondId]);

    return {
        predictions,
        recommendations,
        anomalies,
        parameterHealth,
        loading,
    };
};
