export type Alerts = {
  id: string;
  pondId: string;
  deviceId: string;
  thresholdId: string;
  parameterId: string;
  value: number;
  alertLevel: "NORMAL" | "WARNING" | "DANGER";
  message: string;
  isRead: boolean;
  createdAt: string
}