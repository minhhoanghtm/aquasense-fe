export type AlertStatus = "ACTIVE" | "RESOLVED" | string;
export type AlertLevel = "WARNING" | "CRITICAL" | "DANGER" | "NORMAL" | string;

export interface AiRecommendation {
  recommendationId?: string;
  id?: string;
  alertId?: string;
  actionSuggestion: string;
  chemicalDosage?: string;
}

export type Alerts = {
  alertId?: string;
  id: string;
  pondId: string;
  metricName?: string;
  triggeredValue?: number;
  alertLevel: AlertLevel;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  recommendation?: AiRecommendation;
  // Backward compatibility fields
  level?: AlertLevel;
  value?: number | string;
  parameterId?: string;
  title?: string;
  pondName?: string;
  unit?: string;
  message?: string;
  isRead?: boolean;
  time?: string;
  source?: string;
  deviceId?: string;
  predictionId?: string | null;
  thresholdId?: string;
};

export type Alert = Alerts;