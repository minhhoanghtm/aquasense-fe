export type AlertStatus = "ACTIVE" | "RESOLVED" | string;
export type AlertLevel = "WARNING" | "CRITICAL" | "DANGER" | "NORMAL" | string;

export interface AiRecommendation {
  // Backend actual fields
  recommendationId?: string;
  alertId?: string;
  actionSuggestion: string;
  chemicalDosage?: string | null;

  // Frontend aliases
  id?: string;
}

export interface Alerts {
  // Backend actual fields
  alertId?: string;
  pondId?: string;
  deviceId?: string | null;
  message?: string | null;
  resolvedById?: string | null;
  metricName?: string;
  triggeredValue?: number;
  alertLevel: AlertLevel;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  recommendation?: AiRecommendation;

  // Frontend aliases / backward compat
  id?: string;
  level?: AlertLevel;
  value?: number | string;
  parameterId?: string;
  title?: string;
  pondName?: string;
  unit?: string;
  isRead?: boolean;
  time?: string;
  source?: string;
  predictionId?: string | null;
  thresholdId?: string;
}

export type Alert = Alerts;
