import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface ParameterData {
  parameter: string;
  current: number;
  optimal: number;
}

export interface ParameterHealthRadarProps {
  data: ParameterData[];
  className?: string;
}

const WaterQualityRadar = ({
  data,
  className = "",
}: ParameterHealthRadarProps) => {
  return (
    <div className={`h-[240px] w-full flex flex-col justify-between ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          cx="50%"
          cy="50%"
          outerRadius="70%"
          className="outline-none"
        >
          <PolarGrid
            stroke="rgba(34, 211, 238, 0.25)"
          />

          <PolarAngleAxis
            dataKey="parameter"
            tick={{
              fill: "var(--text-primary)",
              fontSize: 12,
              fontWeight: 500,
            }}
          />

          <PolarRadiusAxis
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#09232c",
              border: "1px solid rgba(34, 211, 238, 0.3)",
              borderRadius: "8px",
              color: "#fff",
            }}
            labelStyle={{
              color: "#2dd4bf",
              fontWeight: 600,
            }}
            formatter={(value, name) => [
              `${value}%`,
              name === "current" ? "Hiện tại" : "Tối ưu",
            ]}
          />

          {/* Tối ưu */}
          <Radar
            name="optimal"
            dataKey="optimal"
            stroke="#fbbf24"
            fill="transparent"
            strokeWidth={2}
            strokeDasharray="5 5"
          />

          {/* Hiện tại */}
          <Radar
            name="current"
            dataKey="current"
            stroke="#2dd4bf"
            fill="#2dd4bf"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          Hiện tại
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Tối ưu
        </div>
      </div>
    </div>
  );
};

export default WaterQualityRadar;