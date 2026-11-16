import { useState, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Droplets,
  Thermometer,
  Waves,
  Wind,
  Gauge,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react";
import {
  type TimeRange,
  TIME_RANGE_CONFIGS,
  aggregateWaterQualityReadings,
  formatXAxisTick,
  type AggregatedChartPoint,
} from "../utils/waterQualityAggregation";
import { formatVietnamDateTime } from "../../../utils/date";
import { formatMetricValue } from "../../../utils/formatNumber";

interface WaterQualityChartProps {
  waterQuality: any;
  loading?: boolean;
  error?: string | null;
}

interface StandardMetric {
  id: string;
  name: string;
  unit: string;
  color: string;
  icon: typeof Activity;
}

const STANDARD_METRICS: StandardMetric[] = [
  { id: "temperature", name: "Nhiệt độ", unit: "°C", color: "#f59e0b", icon: Thermometer },
  { id: "pH", name: "Độ pH", unit: "pH", color: "#06b6d4", icon: Droplets },
  { id: "dissolvedOxygen", name: "Oxy hòa tan (DO)", unit: "mg/L", color: "#14b8a6", icon: Wind },
  { id: "salinity", name: "Độ mặn", unit: "ppt", color: "#38bdf8", icon: Waves },
  { id: "turbidity", name: "Độ đục", unit: "NTU", color: "#c084fc", icon: Gauge },
  { id: "waterLevel", name: "Mực nước", unit: "m", color: "#f472b6", icon: Activity },
];

const TIME_RANGES: Array<{ id: TimeRange; label: string }> = [
  { id: "1h", label: "1 giờ" },
  { id: "6h", label: "6 giờ" },
  { id: "24h", label: "24 giờ" },
  { id: "7d", label: "7 ngày" },
  { id: "30d", label: "30 ngày" },
];

const WaterQualityChart = ({
  waterQuality,
  loading = false,
  error,
}: WaterQualityChartProps) => {
  const [selectedParam, setSelectedParam] = useState("temperature");
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("24h");

  const sensorReadings = waterQuality?.sensorReadings ?? [];
  const thresholds = Array.isArray(waterQuality?.thresholds) ? waterQuality.thresholds : [];

  // Danh sách 6 chỉ số môi trường đồng bộ với thiết kế AquaSense
  const PARAMETERS = useMemo(() => {
    return STANDARD_METRICS.map((std) => {
      const match = thresholds.find(
        (t: any) =>
          t.parameterId === std.id ||
          t.metricName === std.id ||
          (std.id === "temperature" && (t.parameterId === "temp" || t.metricName === "temp")) ||
          (std.id === "dissolvedOxygen" && (t.parameterId === "DO" || t.metricName === "DO" || t.metricName === "do")) ||
          (std.id === "pH" && (t.parameterId === "ph" || t.metricName === "ph")) ||
          (std.id === "waterLevel" && (t.parameterId === "water_level" || t.metricName === "water_level"))
      );
      return {
        id: std.id,
        name: std.name,
        unit: match?.unit || std.unit,
        color: std.color,
        icon: std.icon,
      };
    });
  }, [thresholds]);

  const currentParam = useMemo(() => {
    return (
      PARAMETERS.find((p) => p.id === selectedParam) ||
      PARAMETERS.find(
        (p) =>
          (selectedParam === "temperature" && p.id === "temp") ||
          (selectedParam === "temp" && p.id === "temperature")
      ) ||
      PARAMETERS[0]
    );
  }, [PARAMETERS, selectedParam]);

  const chartColor = currentParam.color;

  // Lấy ngưỡng cảnh báo cấu hình từ API cho chỉ số đang chọn (nếu có, không hardcode)
  const activeThreshold = useMemo(() => {
    if (!Array.isArray(thresholds) || thresholds.length === 0) return null;
    return (
      thresholds.find((t: any) => {
        const metricName = (t.metricName || t.parameterId || "").toLowerCase();
        const currentId = currentParam.id.toLowerCase();
        if (metricName === currentId) return true;
        if (currentId === "temperature" && (metricName === "temp" || metricName === "temperature")) return true;
        if (currentId === "ph" && metricName === "ph") return true;
        if (
          currentId === "dissolvedoxygen" &&
          (metricName === "do" || metricName === "dissolvedoxygen")
        )
          return true;
        if (
          currentId === "waterlevel" &&
          (metricName === "water_level" || metricName === "waterlevel")
        )
          return true;
        return false;
      }) || null
    );
  }, [thresholds, currentParam.id]);

  const hasThreshold =
    activeThreshold &&
    (typeof activeThreshold.minValue === "number" || typeof activeThreshold.normalMin === "number") &&
    (typeof activeThreshold.maxValue === "number" || typeof activeThreshold.normalMax === "number");

  const thresholdMin = activeThreshold?.minValue ?? activeThreshold?.normalMin ?? null;
  const thresholdMax = activeThreshold?.maxValue ?? activeThreshold?.normalMax ?? null;

  // Tổng hợp dữ liệu theo time-bucket và rolling time window
  const aggregation = useMemo(() => {
    return aggregateWaterQualityReadings(
      sensorReadings,
      currentParam.id,
      selectedTimeRange,
      hasThreshold ? { minValue: thresholdMin, maxValue: thresholdMax } : undefined
    );
  }, [sensorReadings, currentParam.id, selectedTimeRange, hasThreshold, thresholdMin, thresholdMax]);

  const {
    chartPoints,
    ticks,
    windowStart,
    windowEnd,
    totalValidSamples,
    yDomain,
    stats,
    gaps,
    hasSignificantGap,
  } = aggregation;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center dashboard-card p-10 text-[var(--text-muted)] min-h-[380px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent mb-3" />
        <p className="text-sm font-medium">Đang tải dữ liệu chất lượng nước...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center dashboard-card p-10 text-[var(--critical)] min-h-[380px]">
        <p className="text-sm font-medium">Không thể tải dữ liệu biểu đồ: {error}</p>
      </div>
    );
  }

  // Tình trạng hiện tại so với ngưỡng
  const isLatestOutOfThreshold =
    hasThreshold &&
    stats.latestValue !== null &&
    ((thresholdMin !== null && stats.latestValue < thresholdMin) ||
      (thresholdMax !== null && stats.latestValue > thresholdMax));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as AggregatedChartPoint;
      if (data.avg === null) return null;

      const isPointOutOfThreshold =
        hasThreshold &&
        ((thresholdMin !== null && data.avg < thresholdMin) ||
          (thresholdMax !== null && data.avg > thresholdMax));

      return (
        <div className="bg-[#03151e]/95 border border-[var(--panel-border-strong)] backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl text-left min-w-[210px] pointer-events-none animate-fadeIn">
          <p className="text-[11px] text-[var(--text-muted)] mb-2 flex items-center gap-1.5 font-mono">
            <Calendar size={12} className="text-teal-400" />
            <span>{data.displayTime}</span>
          </p>

          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: chartColor }}
            />
            <span className="text-xs text-[var(--text-body)] font-medium">
              {currentParam.name}:
            </span>
            <span className="text-sm font-mono font-bold text-white ml-auto">
              {formatMetricValue(data.avg)} {currentParam.unit}
            </span>
          </div>

          <div className="pt-2 border-t border-cyan-950/60 flex flex-col gap-1 text-[11px]">
            {hasThreshold ? (
              isPointOutOfThreshold ? (
                <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <AlertTriangle size={12} className="shrink-0" />
                  <span>
                    Vượt ngưỡng (chuẩn: {formatMetricValue(thresholdMin)} - {formatMetricValue(thresholdMax)} {currentParam.unit})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-teal-400 font-medium">
                  <CheckCircle2 size={12} className="shrink-0" />
                  <span>Trong ngưỡng an toàn</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 text-[var(--text-subtle)]">
                <Clock size={12} className="shrink-0 text-cyan-400" />
                <span>Chỉ số ổn định</span>
              </div>
            )}

            {data.count > 1 ? (
              <div className="mt-1 flex justify-between items-center text-[10px] text-[var(--text-muted)]">
                <span>
                  Dao động: {formatMetricValue(data.min)} - {formatMetricValue(data.max)} {currentParam.unit}
                </span>
                <span className="font-mono text-cyan-300">({data.count} mẫu đo)</span>
              </div>
            ) : (
              <div className="mt-0.5 text-[10px] text-[var(--text-subtle)]">
                <span>Bản ghi tức thời (1 mẫu)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col dashboard-card p-5 sm:p-6 text-left w-full shadow-md relative">
      {/* KHU VỰC 1: Header + Time Range Filter Toolbar */}
      <div className="flex flex-col gap-3.5 mb-4 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)] m-0">
            Xu hướng chất lượng nước
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Theo dõi diễn biến các chỉ số môi trường theo thời gian thực
          </p>
        </div>

        {/* Bộ lọc khoảng thời gian: 1h, 6h, 24h (mặc định), 7d, 30d */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] self-start sm:self-auto">
          {TIME_RANGES.map((t) => {
            const isSelected = selectedTimeRange === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTimeRange(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-teal-500/25 text-teal-300 border border-teal-400/60 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-white border border-transparent"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KHU VỰC 2: Sensor Parameter Selectors Row (Hỗ trợ cuộn ngang trên Mobile) */}
      <div className="mb-4 pb-2 border-b border-[var(--divider)]/40 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {PARAMETERS.map((param) => {
            const isActive = currentParam.id === param.id;
            const paramColor = param.color;
            const IconComponent = param.icon;

            return (
              <button
                key={param.id}
                type="button"
                onClick={() => setSelectedParam(param.id)}
                style={
                  isActive
                    ? {
                        borderColor: `${paramColor}88`,
                        color: paramColor,
                        backgroundColor: `${paramColor}20`,
                      }
                    : {}
                }
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition duration-200 cursor-pointer shrink-0
                  ${
                    isActive
                      ? "font-semibold shadow-sm"
                      : "border-[var(--panel-border)] text-[var(--text-muted)] bg-[var(--panel-bg-dark)] hover:text-white hover:border-[var(--panel-border-strong)]"
                  }
                `}
              >
                <IconComponent size={14} style={{ color: paramColor }} />
                <span>{param.name}</span>
                {param.unit && (
                  <span className="text-[10px] opacity-75">({param.unit})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* KHU VỰC 3: Summary Stat Box (Giá trị gần nhất, Thấp nhất, Cao nhất, Trung bình, Cập nhật cuối) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
        {/* Card 1: Gần nhất / Hiện tại */}
        <div className="p-2.5 rounded-xl bg-[var(--panel-bg-dark)]/80 border border-[var(--panel-border)]/70 flex flex-col justify-between">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Hiện tại
          </span>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-base sm:text-lg font-bold font-mono text-white">
              {stats.latestValue !== null ? formatMetricValue(stats.latestValue) : "--"}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {currentParam.unit}
            </span>
          </div>
          <div>
            {stats.latestValue === null ? (
              <span className="inline-block text-[10px] text-[var(--text-subtle)]">
                Chưa có dữ liệu
              </span>
            ) : hasThreshold ? (
              isLatestOutOfThreshold ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400">
                  <AlertTriangle size={10} /> Vượt ngưỡng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-400">
                  <CheckCircle2 size={10} /> Trong ngưỡng
                </span>
              )
            ) : (
              <span className="inline-block text-[10px] text-teal-400 font-medium">
                Bình thường
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Thấp nhất (Min) */}
        <div className="p-2.5 rounded-xl bg-[var(--panel-bg-dark)]/80 border border-[var(--panel-border)]/70 flex flex-col justify-between">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Thấp nhất (Min)
          </span>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-base sm:text-lg font-bold font-mono text-cyan-300">
              {stats.minValue !== null ? formatMetricValue(stats.minValue) : "--"}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {currentParam.unit}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-subtle)]">
            Trong {TIME_RANGE_CONFIGS[selectedTimeRange].label}
          </span>
        </div>

        {/* Card 3: Cao nhất (Max) */}
        <div className="p-2.5 rounded-xl bg-[var(--panel-bg-dark)]/80 border border-[var(--panel-border)]/70 flex flex-col justify-between">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Cao nhất (Max)
          </span>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-base sm:text-lg font-bold font-mono text-amber-300">
              {stats.maxValue !== null ? formatMetricValue(stats.maxValue) : "--"}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {currentParam.unit}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-subtle)]">
            Trong {TIME_RANGE_CONFIGS[selectedTimeRange].label}
          </span>
        </div>

        {/* Card 4: Trung bình (Avg) */}
        <div className="p-2.5 rounded-xl bg-[var(--panel-bg-dark)]/80 border border-[var(--panel-border)]/70 flex flex-col justify-between">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Trung bình (Avg)
          </span>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-base sm:text-lg font-bold font-mono text-teal-300">
              {stats.avgValue !== null ? formatMetricValue(stats.avgValue) : "--"}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {currentParam.unit}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-subtle)]">
            {stats.totalSamples} mẫu hợp lệ
          </span>
        </div>

        {/* Card 5: Cập nhật cuối */}
        <div className="p-2.5 rounded-xl bg-[var(--panel-bg-dark)]/80 border border-[var(--panel-border)]/70 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Cập nhật gần nhất
          </span>
          <div className="my-0.5 font-mono text-xs sm:text-[13px] font-semibold text-white truncate">
            {stats.latestTimestamp
              ? formatVietnamDateTime(new Date(stats.latestTimestamp), {
                  showSeconds: false,
                  dateFirst: true,
                })
              : "--"}
          </div>
          <span className="text-[10px] text-[var(--text-subtle)] flex items-center gap-1">
            <Clock size={10} className="text-teal-400" /> Đồng bộ thời gian thực
          </span>
        </div>
      </div>

      {/* KHU VỰC 4: Data Disruption Banner (Nếu có gián đoạn dữ liệu dài) */}
      {hasSignificantGap && gaps.length > 0 && totalValidSamples > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-3 animate-fadeIn">
          <AlertTriangle size={15} className="shrink-0 text-amber-400" />
          <span className="font-semibold">Dữ liệu gián đoạn:</span>
          <span className="text-[var(--text-muted)]">
            Phát hiện khoảng trống đo {gaps[0].description}. Biểu đồ tự động ngắt nét để bảo đảm tính trung thực của dữ liệu.
          </span>
        </div>
      )}

      {/* KHU VỰC 5: Chart Canvas Area (Responsive heights: Desktop 340px, Tablet 300px, Mobile 260px) */}
      <div className="w-full h-[260px] sm:h-[300px] md:h-[340px] relative overflow-hidden">
        {/* Overlay thông báo khi không có dữ liệu trong khoảng thời gian đã chọn */}
        {totalValidSamples === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#041920]/85 backdrop-blur-[2px] rounded-2xl p-6 text-center z-10 animate-fadeIn">
            <Info size={28} className="text-teal-400 mb-2 opacity-85" />
            <p className="text-sm font-semibold text-white">
              Không có dữ liệu trong khoảng {TIME_RANGE_CONFIGS[selectedTimeRange].label}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
              Chưa ghi nhận bản ghi đo của chỉ số {currentParam.name} từ cảm biến trong {TIME_RANGE_CONFIGS[selectedTimeRange].label} gần đây.
            </p>
            {selectedTimeRange !== "30d" && (
              <button
                type="button"
                onClick={() => setSelectedTimeRange("30d")}
                className="mt-3 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition cursor-pointer"
              >
                Mở rộng khoảng thời gian (30 ngày)
              </button>
            )}
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartPoints}
            margin={{ top: 14, right: 16, left: -14, bottom: 4 }}
          >
            <defs>
              <linearGradient id={`gradient-${currentParam.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.12} />
                <stop offset="90%" stopColor={chartColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(100, 160, 170, 0.07)"
              vertical={false}
              strokeDasharray="3 3"
            />

            {/* Trục X thời gian thực (Numeric Time Scale với Ticks chuẩn) */}
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={[windowStart, windowEnd]}
              ticks={ticks}
              tickFormatter={(ts) => formatXAxisTick(ts, selectedTimeRange)}
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={8}
            />

            {/* Trục Y tự điều chỉnh biên độ tối thiểu có khoảng đệm, tính cả ngưỡng cảnh báo */}
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-4}
              domain={yDomain}
              tickFormatter={(val) => formatMetricValue(Number(val))}
              padding={{ top: 12, bottom: 12 }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(45, 212, 195, 0.35)", strokeWidth: 1, strokeDasharray: "3 3" }}
              wrapperStyle={{ zIndex: 100 }}
            />

            {/* Đường ngưỡng cảnh báo ReferenceLine từ API (nếu có) */}
            {hasThreshold && thresholdMin !== null && (
              <ReferenceLine
                y={thresholdMin}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.2}
                strokeOpacity={0.8}
                label={{
                  value: `Min: ${formatMetricValue(thresholdMin)} ${currentParam.unit}`,
                  fill: "#fb7185",
                  fontSize: 10,
                  position: "insideBottomLeft",
                }}
              />
            )}
            {hasThreshold && thresholdMax !== null && (
              <ReferenceLine
                y={thresholdMax}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.2}
                strokeOpacity={0.8}
                label={{
                  value: `Max: ${formatMetricValue(thresholdMax)} ${currentParam.unit}`,
                  fill: "#fb7185",
                  fontSize: 10,
                  position: "insideTopLeft",
                }}
              />
            )}

            {/* Gradient Area Fill rất nhẹ (0.00-0.12) - KHÔNG stroke để triệt tiêu hoàn toàn lỗi cột màu dọc */}
            <Area
              type="monotone"
              dataKey="areaAvg"
              stroke="none"
              fill={`url(#gradient-${currentParam.id})`}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Đường Line Chart sắc nét 2.2px, không nối khoảng null, có dot tròn khi là điểm đơn độc */}
            <Line
              type="monotone"
              dataKey="avg"
              stroke={chartColor}
              strokeWidth={2.2}
              connectNulls={false}
              isAnimationActive={false}
              dot={(dotProps: any) => {
                const { cx, cy, payload } = dotProps;
                if (cx == null || cy == null || payload?.avg == null) return null;
                if (payload.isIsolatedPoint || totalValidSamples <= 15) {
                  return (
                    <circle
                      key={`dot-${payload.timestamp}`}
                      cx={cx}
                      cy={cy}
                      r={payload.isIsolatedPoint ? 4 : 2.5}
                      fill="#03151e"
                      stroke={chartColor}
                      strokeWidth={1.8}
                    />
                  );
                }
                return null;
              }}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                fill: chartColor,
                stroke: "#ffffff",
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Ghi chú chân biểu đồ: Ngưỡng an toàn & kết nối */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[var(--divider)]/30 text-[11px] text-[var(--text-subtle)]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: chartColor }} />
            <span>Đường đo thực tế ({currentParam.name})</span>
          </div>
          {hasThreshold && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-rose-400" />
              <span className="text-rose-300">
                Ngưỡng an toàn ({formatMetricValue(thresholdMin)} - {formatMetricValue(thresholdMax)} {currentParam.unit})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span>Hệ thống IoT AquaSense</span>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityChart;
