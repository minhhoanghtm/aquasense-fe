import { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    DropletsIcon,
    ThermometerIcon,
    WavesIcon,
    WindIcon,
    GaugeIcon,
    ActivityIcon,
} from "lucide-react";

interface WaterQualityChartProps {
    waterQuality: any;
}

// const PARAMETERS = [
//     { id: "temperature", name: "Nhiệt độ", unit: "°C", color: "#f6b94c" },
//     { id: "pH", name: "pH", unit: "", color: "#2dd4c3" },
//     { id: "dissolvedOxygen", name: "Oxy hòa tan", unit: "mg/L", color: "#35e1d0" },
//     { id: "salinity", name: "Độ mặn", unit: "ppt", color: "#3b82f6" },
//     { id: "turbidity", name: "Độ đục", unit: "NTU", color: "#a855f7" },
//     { id: "waterLevel", name: "Mực nước", unit: "m", color: "#ec4899" },
// ];

const iconMap: Record<string, React.ReactNode> = {
    pH: <DropletsIcon size={14} />,
    temperature: <ThermometerIcon size={14} />,
    salinity: <WavesIcon size={14} />,
    dissolvedOxygen: <WindIcon size={14} />,
    turbidity: <GaugeIcon size={14} />,
    waterLevel: <ActivityIcon size={14} />,
};

const WaterQualityChart = ({ waterQuality }: WaterQualityChartProps) => {
    // console.log(waterQuality);
    const [selectedParam, setSelectedParam] = useState("temperature");

    const sensorReadings = waterQuality?.sensorReadings ?? [];

    if (sensorReadings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-8 mt-6 text-slate-400 min-h-[300px]">
                <p className="text-sm">Đang tải dữ liệu biểu đồ...</p>
            </div>
        );
    }
    const PARAMETERS = waterQuality.thresholds.map((item: any) => {
        return {
            id: item.parameterId,
            name: item.parameterName,
            unit: item.unit,
        };
    });
    // console.log(PARAMETERS);

    // Sắp xếp dữ liệu theo thời gian tăng dần
    const sortedReadings = [...sensorReadings].sort(
        (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const currentParam = PARAMETERS.find((p: any) => p.id === selectedParam) ?? PARAMETERS[0];

    const chartData = sortedReadings.map((reading: any) => {
        const metric = reading.metrics.find((m: any) => m.name === selectedParam);
        const dateObj = new Date(reading.timestamp);

        const pad = (n: number) => n.toString().padStart(2, "0");
        const displayTime = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())} ${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}`;
        const shortTime = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;

        return {
            time: shortTime,
            value: metric ? metric.value : null,
            displayTime,
        };
    });

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-(--panel-bg-dark) border border-(--panel-border-strong) backdrop-blur-xl p-3 rounded-xl shadow-xl text-left">
                    <p className="text-[10px] text-(--text-muted) mb-1 font-mono">{data.displayTime}</p>
                    <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentParam.color }} />
                        <span>{currentParam.name}:</span>
                        <span className="text-(--accent-bright) font-mono">
                            {payload[0].value} {currentParam.unit}
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-6 mt-6 text-left w-full">
            {/* Chart Header */}
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Xu hướng chất lượng nước</h3>
                    <p className="text-xs text-(--text-muted)">Xem diễn biến thông số chất lượng nước trong ngày</p>
                </div>

                {/* Parameter Selectors */}
                <div className="flex flex-wrap items-center gap-2">
                    {PARAMETERS.map((param: any) => {
                        const isActive = selectedParam === param.id;
                        const paramColor = param.color;

                        return (
                            <button
                                key={param.id}
                                onClick={() => setSelectedParam(param.id)}
                                style={
                                    isActive
                                        ? {
                                            borderColor: `${paramColor}66`,
                                            color: paramColor,
                                            backgroundColor: `${paramColor}15`,
                                        }
                                        : {}
                                }
                                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition duration-200 cursor-pointer
                  ${isActive
                                        ? "border-strong font-semibold shadow-sm"
                                        : "border-[rgba(45,212,195,0.12)] text-slate-400 bg-[rgba(8,39,49,0.3)] hover:text-white hover:border-[rgba(45,212,195,0.3)] hover:bg-[rgba(8,39,49,0.5)]"
                                    }
                `}
                            >
                                <span style={{ color: paramColor }}>
                                    {iconMap[param.id]}
                                </span>
                                <span>{param.name}</span>
                                {param.unit && (
                                    <span className="text-[10px] opacity-60">({param.unit})</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chart Canvas */}
            <div className="w-full h-[320px] md:h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${selectedParam}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentParam.color} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={currentParam.color} stopOpacity={0.0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid stroke="rgba(100, 160, 170, 0.08)" vertical={false} strokeDasharray="3 3" />

                        <XAxis
                            dataKey="time"
                            stroke="var(--text-muted)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />

                        <YAxis
                            stroke="var(--text-muted)"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            dx={-5}
                            domain={["auto", "auto"]}
                            padding={{ top: 20, bottom: 20 }}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(45, 212, 195, 0.2)", strokeWidth: 1 }} />

                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={currentParam.color}
                            strokeWidth={2.5}
                            fill={`url(#gradient-${selectedParam})`}
                            dot={{ r: 3, strokeWidth: 1, fill: "var(--bg-primary)", stroke: currentParam.color }}
                            activeDot={{ r: 5, strokeWidth: 2, fill: currentParam.color, stroke: "#ffffff" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WaterQualityChart;