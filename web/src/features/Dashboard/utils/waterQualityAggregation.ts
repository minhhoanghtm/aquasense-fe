import { formatVietnamDateTime, formatVietnamTime } from "../../../utils/date.ts";

export type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

export interface TimeRangeConfig {
  id: TimeRange;
  label: string;
  durationMs: number;
  bucketIntervalMs: number;
  tickIntervalMs: number;
  gapThresholdMs: number;
}

export const TIME_RANGE_CONFIGS: Record<TimeRange, TimeRangeConfig> = {
  "1h": {
    id: "1h",
    label: "1 giờ",
    durationMs: 1 * 60 * 60 * 1000,
    bucketIntervalMs: 1 * 60 * 1000, // 1 phút
    tickIntervalMs: 10 * 60 * 1000, // 10 phút
    gapThresholdMs: 15 * 60 * 1000, // 15 phút
  },
  "6h": {
    id: "6h",
    label: "6 giờ",
    durationMs: 6 * 60 * 60 * 1000,
    bucketIntervalMs: 5 * 60 * 1000, // 5 phút
    tickIntervalMs: 1 * 60 * 60 * 1000, // 1 giờ
    gapThresholdMs: 1 * 60 * 60 * 1000, // 1 giờ
  },
  "24h": {
    id: "24h",
    label: "24 giờ",
    durationMs: 24 * 60 * 60 * 1000,
    bucketIntervalMs: 15 * 60 * 1000, // 15 phút
    tickIntervalMs: 3 * 60 * 60 * 1000, // 3 giờ
    gapThresholdMs: 3 * 60 * 60 * 1000, // 3 giờ
  },
  "7d": {
    id: "7d",
    label: "7 ngày",
    durationMs: 7 * 24 * 60 * 60 * 1000,
    bucketIntervalMs: 1 * 60 * 60 * 1000, // 1 giờ
    tickIntervalMs: 24 * 60 * 60 * 1000, // 1 ngày
    gapThresholdMs: 12 * 60 * 60 * 1000, // 12 giờ
  },
  "30d": {
    id: "30d",
    label: "30 ngày",
    durationMs: 30 * 24 * 60 * 60 * 1000,
    bucketIntervalMs: 6 * 60 * 60 * 1000, // 6 giờ
    tickIntervalMs: 5 * 24 * 60 * 60 * 1000, // 5 ngày
    gapThresholdMs: 48 * 60 * 60 * 1000, // 48 giờ
  },
};

export const METRIC_VALIDATORS: Record<string, (val: number) => boolean> = {
  temperature: (v) => !isNaN(v) && v > 0 && v < 60,
  temp: (v) => !isNaN(v) && v > 0 && v < 60,
  pH: (v) => !isNaN(v) && v >= 0 && v <= 14,
  ph: (v) => !isNaN(v) && v >= 0 && v <= 14,
  dissolvedOxygen: (v) => !isNaN(v) && v >= 0 && v <= 30,
  DO: (v) => !isNaN(v) && v >= 0 && v <= 30,
  salinity: (v) => !isNaN(v) && v >= 0 && v <= 60,
  turbidity: (v) => !isNaN(v) && v >= 0 && v <= 1000,
  waterLevel: (v) => !isNaN(v) && v >= 0 && v <= 15,
  water_level: (v) => !isNaN(v) && v >= 0 && v <= 15,
};

export interface RawReadingItem {
  id?: string;
  pondId?: string;
  deviceId?: string;
  timestamp?: string | Date | number;
  recordedAt?: string | Date | number;
  measuredAt?: string | Date | number;
  createdAt?: string | Date | number;
  metrics?: Array<{ name: string; value: number | string | null; unit?: string }>;
  temperature?: number | null;
  temp?: number | null;
  ph?: number | null;
  pH?: number | null;
  dissolvedOxygen?: number | null;
  DO?: number | null;
  salinity?: number | null;
  turbidity?: number | null;
  waterLevel?: number | null;
  water_level?: number | null;
  parameterId?: string;
  value?: number | null;
}

export interface AggregatedChartPoint {
  timestamp: number; // numeric epoch ms for time scale X-axis
  displayTime: string; // for tooltip: "DD/MM/YYYY HH:mm"
  avg: number | null; // actual value for Line chart (connectNulls=false)
  areaAvg: number | null; // value for subtle Area fill (null if isolated point to prevent vertical column artifact!)
  min: number | null;
  max: number | null;
  count: number;
  rawValues: number[];
  isIsolatedPoint?: boolean; // true if this point has no contiguous adjacent neighbors
}

export interface MetricSummaryStats {
  latestValue: number | null;
  latestTimestamp: number | null;
  minValue: number | null;
  maxValue: number | null;
  avgValue: number | null;
  totalSamples: number;
}

export interface DataGapInfo {
  start: number;
  end: number;
  durationMs: number;
  durationHours: number;
  description: string;
}

export interface AggregationResult {
  chartPoints: AggregatedChartPoint[];
  ticks: number[];
  windowStart: number;
  windowEnd: number;
  totalValidSamples: number;
  yDomain: [number, number];
  stats: MetricSummaryStats;
  gaps: DataGapInfo[];
  hasSignificantGap: boolean;
}

/**
 * Format tick label on XAxis according to time range and Asia/Ho_Chi_Minh timezone
 */
export const formatXAxisTick = (timestamp: number, range: TimeRange): string => {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return "";

  if (range === "1h" || range === "6h" || range === "24h") {
    return formatVietnamTime(d, false);
  }

  if (range === "7d") {
    const timeStr = formatVietnamTime(d, false);
    const dayMonth = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
    }).format(d);
    // If exact midnight, just show DD/MM
    if (timeStr === "00:00") {
      return dayMonth;
    }
    return `${timeStr} ${dayMonth}`;
  }

  // 30d: Return DD/MM
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
  }).format(d);
};

/**
 * Calculate appropriate Y-axis domain based on parameter, active values, and threshold boundaries.
 * Prevents tiny sensor jitter (e.g. 29.7°C vs 29.8°C) from appearing as massive spikes,
 * while ensuring threshold lines remain visible if configured.
 */
export const calculateYAxisDomain = (
  paramId: string,
  values: number[],
  threshold?: { minValue?: number | null; maxValue?: number | null }
): [number, number] => {
  let minSpan = 3.0;
  let padding = 0.5;
  let decimals = 1;

  if (paramId === "pH" || paramId === "ph") {
    minSpan = 1.0;
    padding = 0.2;
    decimals = 2;
  } else if (paramId === "dissolvedOxygen" || paramId === "DO") {
    minSpan = 2.0;
    padding = 0.5;
    decimals = 1;
  } else if (paramId === "salinity") {
    minSpan = 4.0;
    padding = 1.0;
    decimals = 1;
  } else if (paramId === "turbidity") {
    minSpan = 15.0;
    padding = 5.0;
    decimals = 0;
  } else if (paramId === "waterLevel" || paramId === "water_level") {
    minSpan = 0.4;
    padding = 0.1;
    decimals = 2;
  } else if (paramId === "temperature" || paramId === "temp") {
    minSpan = 3.0;
    padding = 0.8;
    decimals = 1;
  }

  if (values.length === 0) {
    let yMin = 0;
    let yMax = 10;
    switch (paramId) {
      case "pH":
      case "ph":
        yMin = 6.5;
        yMax = 9.0;
        break;
      case "dissolvedOxygen":
      case "DO":
        yMin = 3.0;
        yMax = 9.0;
        break;
      case "salinity":
        yMin = 10.0;
        yMax = 30.0;
        break;
      case "turbidity":
        yMin = 0;
        yMax = 50;
        break;
      case "waterLevel":
      case "water_level":
        yMin = 0.8;
        yMax = 2.0;
        break;
      case "temperature":
      case "temp":
      default:
        yMin = 25.0;
        yMax = 33.0;
        break;
    }

    if (threshold) {
      if (typeof threshold.minValue === "number" && !isNaN(threshold.minValue)) {
        yMin = Math.min(yMin, threshold.minValue - padding);
      }
      if (typeof threshold.maxValue === "number" && !isNaN(threshold.maxValue)) {
        yMax = Math.max(yMax, threshold.maxValue + padding);
      }
    }

    return [yMin, yMax];
  }

  let rawMin = Math.min(...values);
  let rawMax = Math.max(...values);

  // Expand domain to include threshold lines if they exist
  if (threshold) {
    if (typeof threshold.minValue === "number" && !isNaN(threshold.minValue)) {
      rawMin = Math.min(rawMin, threshold.minValue);
    }
    if (typeof threshold.maxValue === "number" && !isNaN(threshold.maxValue)) {
      rawMax = Math.max(rawMax, threshold.maxValue);
    }
  }

  const diff = rawMax - rawMin;
  let yMin = rawMin;
  let yMax = rawMax;

  if (diff < minSpan) {
    const center = (rawMin + rawMax) / 2;
    yMin = center - minSpan / 2;
    yMax = center + minSpan / 2;
  } else {
    yMin = rawMin - padding;
    yMax = rawMax + padding;
  }

  // Prevent values from going below logical physical limits
  if (paramId === "pH" || paramId === "ph") {
    yMin = Math.max(0, yMin);
    yMax = Math.min(14, yMax);
  } else if (paramId !== "temperature" && paramId !== "temp") {
    yMin = Math.max(0, yMin);
  }

  const factor = Math.pow(10, decimals);
  yMin = Math.floor(yMin * factor) / factor;
  yMax = Math.ceil(yMax * factor) / factor;

  return [yMin, yMax];
};

/**
 * Extract metric value from a reading record supporting all backend & frontend formats
 */
const extractMetricValue = (r: RawReadingItem, paramId: string): number | null => {
  // 1. Check inside `metrics` array
  if (Array.isArray(r.metrics)) {
    const metric = r.metrics.find(
      (m) =>
        m.name === paramId ||
        (paramId === "temperature" && m.name === "temp") ||
        (paramId === "temp" && m.name === "temperature") ||
        (paramId === "dissolvedOxygen" && (m.name === "DO" || m.name === "do")) ||
        (paramId === "DO" && m.name === "dissolvedOxygen") ||
        (paramId === "pH" && m.name === "ph") ||
        (paramId === "ph" && m.name === "pH") ||
        (paramId === "waterLevel" && m.name === "water_level") ||
        (paramId === "water_level" && m.name === "waterLevel")
    );
    if (metric && metric.value !== null && metric.value !== undefined) {
      const v = Number(metric.value);
      if (!isNaN(v)) return v;
    }
  }

  // 2. Check direct property on `r`
  const directCandidates: Record<string, any[]> = {
    temperature: [r.temperature, r.temp],
    temp: [r.temp, r.temperature],
    pH: [r.pH, r.ph],
    ph: [r.ph, r.pH],
    dissolvedOxygen: [r.dissolvedOxygen, r.DO],
    DO: [r.DO, r.dissolvedOxygen],
    salinity: [r.salinity],
    turbidity: [r.turbidity],
    waterLevel: [r.waterLevel, r.water_level],
    water_level: [r.water_level, r.waterLevel],
  };

  const candidates = directCandidates[paramId] || [(r as any)[paramId]];
  for (const c of candidates) {
    if (c !== null && c !== undefined) {
      const v = Number(c);
      if (!isNaN(v)) return v;
    }
  }

  // 3. Check parameterId / value format
  if (
    r.parameterId === paramId ||
    (paramId === "temperature" && r.parameterId === "temp") ||
    (paramId === "pH" && r.parameterId === "ph") ||
    (paramId === "dissolvedOxygen" && r.parameterId === "DO") ||
    (paramId === "waterLevel" && r.parameterId === "water_level")
  ) {
    if (r.value !== null && r.value !== undefined) {
      const v = Number(r.value);
      if (!isNaN(v)) return v;
    }
  }

  return null;
};

/**
 * Perform time-bucket aggregation on raw sensor readings for a chosen rolling time range.
 * Eliminates Recharts vertical column/pillar artifacts, detects data gaps, and calculates
 * precise summary stats.
 */
export const aggregateWaterQualityReadings = (
  readings: RawReadingItem[],
  paramId: string,
  timeRange: TimeRange,
  threshold?: { minValue?: number | null; maxValue?: number | null },
  currentTimeMs: number = Date.now()
): AggregationResult => {
  const config = TIME_RANGE_CONFIGS[timeRange];
  const validator = METRIC_VALIDATORS[paramId] || ((v: number) => !isNaN(v));

  // 1. Extract valid points: { timestamp: number, value: number }
  const validPoints: Array<{ timestamp: number; value: number }> = [];

  readings.forEach((r) => {
    const rawTs =
      r.timestamp ??
      r.recordedAt ??
      r.measuredAt ??
      r.createdAt;

    if (!rawTs) return;
    const ts = typeof rawTs === "number" ? rawTs : new Date(rawTs).getTime();
    if (isNaN(ts) || ts <= 0) return;

    const val = extractMetricValue(r, paramId);
    if (val !== null && validator(val)) {
      validPoints.push({ timestamp: ts, value: val });
    }
  });

  // 2. Sort ascending by timestamp & deduplicate identical timestamps
  validPoints.sort((a, b) => a.timestamp - b.timestamp);

  // 3. Calculate rolling time window
  const latestTs =
    validPoints.length > 0
      ? validPoints[validPoints.length - 1].timestamp
      : currentTimeMs;
  const windowEnd = Math.max(currentTimeMs, latestTs);
  const windowStart = windowEnd - config.durationMs;

  // 4. Filter points within the window [windowStart, windowEnd]
  const windowPoints = validPoints.filter(
    (p) => p.timestamp >= windowStart && p.timestamp <= windowEnd
  );

  // 5. Calculate real summary stats (never distorted by nulls or artificial zeros)
  let stats: MetricSummaryStats = {
    latestValue: null,
    latestTimestamp: null,
    minValue: null,
    maxValue: null,
    avgValue: null,
    totalSamples: windowPoints.length,
  };

  if (windowPoints.length > 0) {
    const latestP = windowPoints[windowPoints.length - 1];
    const vals = windowPoints.map((p) => p.value);
    const sum = vals.reduce((acc, v) => acc + v, 0);

    stats = {
      latestValue: Math.round(latestP.value * 100) / 100,
      latestTimestamp: latestP.timestamp,
      minValue: Math.round(Math.min(...vals) * 100) / 100,
      maxValue: Math.round(Math.max(...vals) * 100) / 100,
      avgValue: Math.round((sum / vals.length) * 100) / 100,
      totalSamples: windowPoints.length,
    };
  }

  // 6. Detect data gaps (disruptions longer than gapThresholdMs)
  const gaps: DataGapInfo[] = [];
  if (windowPoints.length > 0) {
    for (let i = 0; i < windowPoints.length - 1; i++) {
      const diff = windowPoints[i + 1].timestamp - windowPoints[i].timestamp;
      if (diff >= config.gapThresholdMs) {
        const hours = Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
        const startStr = formatVietnamTime(new Date(windowPoints[i].timestamp), false);
        const endStr = formatVietnamTime(new Date(windowPoints[i + 1].timestamp), false);
        gaps.push({
          start: windowPoints[i].timestamp,
          end: windowPoints[i + 1].timestamp,
          durationMs: diff,
          durationHours: hours,
          description: `${startStr} - ${endStr} (${hours}h)`,
        });
      }
    }

    // Check gap at the end (from latest point to windowEnd)
    const endDiff = windowEnd - windowPoints[windowPoints.length - 1].timestamp;
    if (endDiff >= config.gapThresholdMs) {
      const hours = Math.round((endDiff / (1000 * 60 * 60)) * 10) / 10;
      const startStr = formatVietnamTime(
        new Date(windowPoints[windowPoints.length - 1].timestamp),
        false
      );
      gaps.push({
        start: windowPoints[windowPoints.length - 1].timestamp,
        end: windowEnd,
        durationMs: endDiff,
        durationHours: hours,
        description: `Từ ${startStr} đến nay (${hours}h)`,
      });
    }
  }

  const hasSignificantGap = gaps.length > 0;

  // 7. Time-bucket aggregation
  const bucketSize = config.bucketIntervalMs;
  const numBuckets = Math.ceil(config.durationMs / bucketSize);
  const rawChartPoints: AggregatedChartPoint[] = [];
  const allAggregatedValues: number[] = [];

  let pointIndex = 0;

  for (let i = 0; i < numBuckets; i++) {
    const bStart = windowStart + i * bucketSize;
    const bEnd = bStart + bucketSize;
    const midpoint = Math.floor((bStart + bEnd) / 2);

    const bucketValues: number[] = [];

    while (
      pointIndex < windowPoints.length &&
      windowPoints[pointIndex].timestamp < bEnd
    ) {
      if (windowPoints[pointIndex].timestamp >= bStart) {
        bucketValues.push(windowPoints[pointIndex].value);
      }
      pointIndex++;
    }

    if (bucketValues.length > 0) {
      const min = Math.min(...bucketValues);
      const max = Math.max(...bucketValues);
      const sum = bucketValues.reduce((acc, v) => acc + v, 0);
      const avg = Math.round((sum / bucketValues.length) * 100) / 100;

      allAggregatedValues.push(avg);

      rawChartPoints.push({
        timestamp: midpoint,
        displayTime: formatVietnamDateTime(new Date(midpoint), {
          showSeconds: false,
          dateFirst: true,
        }),
        avg,
        areaAvg: avg, // will be revised in anti-pillar pass
        min,
        max,
        count: bucketValues.length,
        rawValues: bucketValues,
        isIsolatedPoint: false,
      });
    } else {
      // Empty bucket: null value so Recharts breaks the line honestly (connectNulls=false)
      rawChartPoints.push({
        timestamp: midpoint,
        displayTime: formatVietnamDateTime(new Date(midpoint), {
          showSeconds: false,
          dateFirst: true,
        }),
        avg: null,
        areaAvg: null,
        min: null,
        max: null,
        count: 0,
        rawValues: [],
        isIsolatedPoint: false,
      });
    }
  }

  // 8. Anti-Pillar Second Pass:
  // In Recharts, an Area component with a single point surrounded by nulls will draw
  // a vertical stroke down to baseline and fill a vertical stripe.
  // By setting `areaAvg = null` for isolated points, the Area element ignores them,
  // completely eliminating vertical artifact columns while Line still renders the point!
  for (let i = 0; i < rawChartPoints.length; i++) {
    if (rawChartPoints[i].avg !== null) {
      const hasPrev = i > 0 && rawChartPoints[i - 1].avg !== null;
      const hasNext = i < rawChartPoints.length - 1 && rawChartPoints[i + 1].avg !== null;

      if (!hasPrev && !hasNext) {
        // Isolated point
        rawChartPoints[i].areaAvg = null;
        rawChartPoints[i].isIsolatedPoint = true;
      } else {
        rawChartPoints[i].areaAvg = rawChartPoints[i].avg;
        rawChartPoints[i].isIsolatedPoint = false;
      }
    }
  }

  // 9. Generate clean, regular tick timestamps along the X-axis
  const ticks: number[] = [];
  const tickStep = config.tickIntervalMs;
  const firstTick = Math.ceil(windowStart / tickStep) * tickStep;

  for (let t = firstTick; t <= windowEnd; t += tickStep) {
    ticks.push(t);
  }

  if (ticks.length < 2) {
    ticks.length = 0;
    ticks.push(windowStart, windowEnd);
  }

  // 10. Calculate Y-axis domain including thresholds
  const yDomain = calculateYAxisDomain(paramId, allAggregatedValues, threshold);

  return {
    chartPoints: rawChartPoints,
    ticks,
    windowStart,
    windowEnd,
    totalValidSamples: windowPoints.length,
    yDomain,
    stats,
    gaps,
    hasSignificantGap,
  };
};
