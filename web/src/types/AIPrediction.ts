export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AIPrediction {
  predictionId?: string;
  id?: string;
  pondId: string;
  predictedTime: string;
  predictedDO: number;
  predictedPH: number;
  riskScore: number;
  riskLevel: RiskLevel;
  // Extra UI helpers
  parameterId?: string;
  predictedValue?: number;
  unit?: string;
  confidence?: number;
  confidenceScore?: number;
  confidenceLabel?: string;
  riskLabel?: string;
  description?: string;
  pondName?: string;
  trend?: "UP" | "DOWN" | "STABLE";
  predictionWindow?: string;
}
