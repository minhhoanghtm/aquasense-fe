import { api } from "./api";

// Verified against PredictionsController:
// GET /predictions/pond/:pondId/latest
// GET /predictions/pond/:pondId/history
// POST /predictions/pond/:pondId/trigger
// POST /predictions/trigger-active
export const AI_ENDPOINTS_AVAILABLE = true;

export interface AIPrediction {
    id: string;
    pondId: string;
    pondName?: string;
    parameterId: string;
    currentValue?: number;
    predictedValue: number;
    unit: string;
    predictionHorizon: number;
    predictionTime: string;
    confidence?: number;
    confidenceScore?: number;
    confidenceLabel?: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | string;
    riskLabel?: string;
    description?: string;
    model: string;
    createdAt: string;
}

export interface RawAiPrediction {
    predictionId: string;
    pondId: string;
    predictedTime: string;
    predictedDO: number;
    predictedPH: number;
    riskScore: number;
    riskLevel: string;
    isFallback: boolean;
    predictionSource: string;
}

export interface AIRecommendation {
    id: string;
    pondId: string;
    predictionId?: string;
    parameterId?: string;
    title: string;
    content: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: string;
    createdAt: string;
}

export interface AnomalyItem {
    id: string;
    pondId?: string;
    title: string;
    subtitle: string;
    level?: "WARNING" | "DANGER" | "INFO";
    createdAt?: string;
}

export interface ParameterHealth {
    parameter: string;
    current: number;
    optimal: number;
}

export const getAIPredictions = async (pondId?: string): Promise<AIPrediction[]> => {
    if (!pondId) return [];

    try {
        const raw = await api<RawAiPrediction>(`/predictions/pond/${pondId}/latest`);

        if (!raw || !raw.predictionId) return [];

        return [{
            id: raw.predictionId,
            pondId: raw.pondId,
            parameterId: "DO / pH",
            predictedValue: raw.predictedDO,
            unit: "mg/L",
            predictionHorizon: 2,
            predictionTime: raw.predictedTime,
            confidenceLabel: raw.isFallback ? "ƯỚC TÍNH HEURISTIC" : undefined,
            riskLevel: raw.riskLevel,
            riskLabel: raw.riskLevel === "LOW" ? "Rủi ro thấp" : raw.riskLevel === "MEDIUM" ? "Rủi ro trung bình" : "Rủi ro cao",
            description: `Dự báo sau 2 giờ: DO ${raw.predictedDO} mg/L, pH ${raw.predictedPH}. Điểm rủi ro: ${(raw.riskScore * 100).toFixed(0)}%.`,
            model: raw.predictionSource,
            createdAt: raw.predictedTime,
        }];
    } catch {
        return [];
    }
};

/**
 * Lấy lịch sử dự báo AI của ao nuôi
 * GET /predictions/pond/:pondId/history
 */
export const getPredictionHistory = async (pondId: string, limit: number = 20): Promise<RawAiPrediction[]> => {
    if (!pondId) return [];
    try {
        const res = await api<RawAiPrediction[]>(`/predictions/pond/${pondId}/history?limit=${limit}`);
        return Array.isArray(res) ? res : [];
    } catch {
        return [];
    }
};

/**
 * Kích hoạt tính toán dự báo AI ngay cho một ao nuôi
 * POST /predictions/pond/:pondId/trigger
 */
export const triggerPondPrediction = async (pondId: string): Promise<RawAiPrediction> => {
    return api<RawAiPrediction>(`/predictions/pond/${pondId}/trigger`, {
        method: "POST",
    });
};

/**
 * Kích hoạt tính toán dự báo AI cho tất cả các ao đang hoạt động
 * POST /predictions/trigger-active
 */
export const triggerActivePondsNow = async (): Promise<{ message: string }> => {
    return api<{ message: string }>("/predictions/trigger-active", {
        method: "POST",
    });
};

export const getAIRecommendations = async (pondId?: string): Promise<AIRecommendation[]> => {
    if (!AI_ENDPOINTS_AVAILABLE || !pondId) return [];
    return [];
};

export const getAnomalies = async (pondId?: string): Promise<AnomalyItem[]> => {
    if (!AI_ENDPOINTS_AVAILABLE || !pondId) return [];
    return [];
};

export const getParameterHealth = async (): Promise<ParameterHealth[]> => {
    return [];
};
