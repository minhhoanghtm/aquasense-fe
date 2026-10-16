// The real backend currently exposes no AI prediction controller.
// Swagger currently exposes no AI prediction endpoints.
export const AI_ENDPOINTS_AVAILABLE = false;

export interface AIPrediction {
    id: string;
    pondId: string;
    pondName?: string;
    parameterId: string;
    currentValue: number;
    predictedValue: number;
    unit: string;
    predictionHorizon: number;
    predictionTime: string;
    confidence: number;
    confidenceScore?: number;
    confidenceLabel?: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | string;
    riskLabel?: string;
    description?: string;
    model: string;
    createdAt: string;
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
    if (!AI_ENDPOINTS_AVAILABLE || !pondId) return [];
    return [];
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
