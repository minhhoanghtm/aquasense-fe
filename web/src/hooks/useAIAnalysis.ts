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
import {
    getErrorMessage,
    isAbortError,
    isPondResourceRevocationError,
    isPondRevoked,
    reportRevokedPond,
} from "../services/pondAccessControl";

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
        if (!pondId || isPondRevoked(pondId)) {
            setPredictions([]);
            setRecommendations([]);
            setAnomalies([]);
            setParameterHealth([]);
            setError(pondId && isPondRevoked(pondId) ? "Bạn không được phân công cho ao nuôi này!" : null);
            setLoading(false);
            setPredictionAvailability("READY");
            return;
        }

        let cancelled = false;
        let requestVersion = 0;
        let activeController: AbortController | null = null;

        const abortCurrent = () => {
            if (activeController) {
                activeController.abort();
                activeController = null;
            }
        };

        const fetchAIData = async () => {
            if (cancelled || isPondRevoked(pondId)) return;

            const requestId = ++requestVersion;
            abortCurrent();
            const controller = new AbortController();
            activeController = controller;

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
                    getAIPredictions(pondId, { signal: controller.signal }),
                    getAIRecommendations(pondId),
                    getAnomalies(pondId),
                    parameterHealthRequest,
                ]);

                if (!cancelled && requestId === requestVersion && !isPondRevoked(pondId)) {
                    setPredictions(preds);
                    setRecommendations(recs);
                    setAnomalies(anoms);
                    setParameterHealth(params);
                }
            } catch (err) {
                if (isAbortError(err) || controller.signal.aborted) return;
                console.error("Lỗi lấy dữ liệu AI:", err);
                if (!cancelled && requestId === requestVersion) {
                    setPredictions([]);
                    setRecommendations([]);
                    setAnomalies([]);
                    setParameterHealth([]);
                    setPredictionAvailability(predictionAvailabilityFromError(err));
                    const message = getErrorMessage(err, "Không thể tải dữ liệu AI.");
                    setError(message);
                    if (isPondResourceRevocationError(err, "http")) {
                        reportRevokedPond(pondId, message);
                    }
                }
            } finally {
                if (!cancelled && requestId === requestVersion) setLoading(false);
            }
        };

        fetchAIData();

        const handlePondRevoked = (event: Event) => {
            const detail = (event as CustomEvent<{ pondId?: string; message?: string }>).detail;
            if (detail?.pondId !== pondId) return;
            requestVersion += 1;
            abortCurrent();
            setPredictions([]);
            setRecommendations([]);
            setAnomalies([]);
            setParameterHealth([]);
            setLoading(false);
            setPredictionAvailability("AI_UNAVAILABLE");
            setError(detail?.message || "Bạn không được phân công cho ao nuôi này!");
        };

        const handleAuthCleared = () => {
            requestVersion += 1;
            abortCurrent();
            setPredictions([]);
            setRecommendations([]);
            setAnomalies([]);
            setParameterHealth([]);
            setError(null);
            setLoading(false);
            setPredictionAvailability("READY");
        };

        window.addEventListener("pond-access-revoked", handlePondRevoked);
        window.addEventListener("auth-cleared", handleAuthCleared);

        return () => {
            cancelled = true;
            requestVersion += 1;
            abortCurrent();
            window.removeEventListener("pond-access-revoked", handlePondRevoked);
            window.removeEventListener("auth-cleared", handleAuthCleared);
        };
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
