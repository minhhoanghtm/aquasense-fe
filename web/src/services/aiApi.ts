import { api } from "./api";

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
    const endpoint = pondId ? `/aiPredictions?pondId=${pondId}` : "/aiPredictions";
    return await api<AIPrediction[]>(endpoint);
};

export const getAIRecommendations = async (pondId?: string): Promise<AIRecommendation[]> => {
    const endpoint = pondId ? `/aiRecommendations?pondId=${pondId}` : "/aiRecommendations";
    return await api<AIRecommendation[]>(endpoint);
};

export const getAnomalies = async (pondId?: string): Promise<AnomalyItem[]> => {
    const endpoint = pondId ? `/anomalies?pondId=${pondId}` : "/anomalies";
    return await api<AnomalyItem[]>(endpoint);
};

export const getParameterHealth = async (): Promise<ParameterHealth[]> => {
    return await api<ParameterHealth[]>("/parameterHealth");
};
