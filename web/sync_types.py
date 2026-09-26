import os

types_dir = 'src/types'

user_content = '''export type Role = "ADMIN" | "MANAGER" | "FARMER";
export type UserRole = Role | string;
export type UserStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "PENDING_APPROVAL";

export interface User {
  // Backend actual fields
  userId?: string;
  fullName: string;
  phoneNumber?: string;
  email?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  dateOfBirth?: string | null;
  passwordHash?: string;
  role: Role | string;
  fcmToken?: string | null;
  isActive?: boolean;
  mustChangePassword?: boolean;
  tokenVersion?: number;
  createdAt?: string;
  updatedAt?: string;

  // Frontend aliases / backward compat
  id?: string;
  password?: string;
  status?: UserStatus;
  avatar?: string;
  avatarColor?: string;
  address?: string;
  bio?: string;
  department?: string;
  position?: string;
  assignedPondIds?: string[];
  joinDate?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
'''

pond_content = '''import type { Devices, Device } from "./Devices";

export type PondStatus = "ACTIVE" | "HARVESTED" | "EMPTY";

export interface Pond {
  // Backend actual fields
  pondId?: string;
  userId?: string;
  pondName?: string;
  areaM2?: number;
  depthM?: number;
  shrimpDensity?: number | string;
  status: PondStatus | string;
  createdAt?: string;
  updatedAt?: string;

  // Frontend aliases / backward compat
  id?: string;
  name?: string;
  area?: number;
  density?: string;
  createAt?: string;
  location?: string;
  stockingDate?: string;
  growthStage?: string;
  managerId?: string;
}

export interface PondWithDevices extends Pond {
  devices: Device[];
}
'''

device_content = '''export type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

export interface Devices {
  // Backend actual fields
  deviceId?: string;
  pondId?: string;
  deviceName?: string;
  macAddress?: string;
  firmwareVersion?: string | null;
  status: DeviceStatus | string;
  lastActiveAt?: string | null;

  // Frontend aliases / backward compat
  id?: string;
  name?: string;
  serialNumber?: string;
  createdAt?: string;
  node_code?: string;
  sensors?: string[];
  connection_type?: string;
  signal_strength?: number;
}

export type Device = Devices;
'''

alert_content = '''export type AlertStatus = "ACTIVE" | "RESOLVED" | string;
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
'''

ai_prediction_content = '''export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AIPrediction {
  // Backend actual fields
  predictionId?: string;
  pondId?: string;
  predictedTime?: string;
  predictedDO?: number;
  predictedPH?: number;
  riskScore?: number;
  riskLevel?: RiskLevel | string;

  // Frontend aliases / backward compat
  id?: string;
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
'''

manual_test_log_content = '''export interface ManualTestLog {
  // Backend actual fields
  logId?: string;
  pondId?: string;
  testedById?: string;
  testTime?: string;
  phValue?: number | null;
  salinity?: number | null;
  temperature?: number | null;
  note?: string | null;
  createdAt?: string;

  // Frontend aliases / backward compat
  id?: string;
  parameterId?: string;
  value?: number;
  notes?: string;
}
'''

sensor_reading_content = '''export interface SensorReading {
  // Backend actual fields (TelemetryData)
  telemetryId?: string;
  deviceId?: string;
  measuredAt?: string;
  dissolvedOxygen?: number | null;
  temperature?: number | null;
  ph?: number | null;
  salinity?: number | null;
  createdAt?: string;

  // Frontend aliases / backward compat
  id?: string;
  pondId?: string;
  parameterId?: string;
  value?: number;
  unit?: string;
  timestamp?: string;
  status?: string;
}
'''

threshold_content = '''export interface Threshold {
  // Backend actual fields (ThresholdConfig)
  thresholdId?: string;
  pondId?: string;
  metricName?: string;
  minCritical?: number;
  minWarning?: number;
  maxWarning?: number;
  maxCritical?: number;

  // Frontend aliases / backward compat
  id?: string;
  parameterId?: string;
  parameterName?: string;
  min?: number;
  max?: number;
  optimalMin?: number;
  optimalMax?: number;
}
'''

with open(os.path.join(types_dir, 'User.ts'), 'w', encoding='utf-8') as f:
    f.write(user_content)
with open(os.path.join(types_dir, 'Pond.ts'), 'w', encoding='utf-8') as f:
    f.write(pond_content)
with open(os.path.join(types_dir, 'Devices.ts'), 'w', encoding='utf-8') as f:
    f.write(device_content)
with open(os.path.join(types_dir, 'Alerts.ts'), 'w', encoding='utf-8') as f:
    f.write(alert_content)
with open(os.path.join(types_dir, 'AIPrediction.ts'), 'w', encoding='utf-8') as f:
    f.write(ai_prediction_content)
with open(os.path.join(types_dir, 'ManualTestLog.ts'), 'w', encoding='utf-8') as f:
    f.write(manual_test_log_content)
with open(os.path.join(types_dir, 'SensorReading.ts'), 'w', encoding='utf-8') as f:
    f.write(sensor_reading_content)
with open(os.path.join(types_dir, 'Threshold.ts'), 'w', encoding='utf-8') as f:
    f.write(threshold_content)
