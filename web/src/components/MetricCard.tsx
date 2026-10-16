import React from "react";
import ProgressCircle from "./ProgressCircle";
import { getMetricStatus } from "../utils/metricStatus";
import {
  DropletsIcon,
  ThermometerIcon,
  WavesIcon,
  WindIcon,
  GaugeIcon,
  ActivityIcon,
} from "lucide-react";

type MetricCardProps = {
  title: string;
  parameter: string;
  value: number;
  unit: string;
  threshold?: {
    normalMin?: number;
    normalMax?: number;
    dangerMin?: number;
    dangerMax?: number;
    minValue?: number;
    maxValue?: number;
  };
};

const MetricCard = ({
  title,
  parameter,
  value,
  unit,
  threshold,
}: MetricCardProps) => {
  const normalMin = threshold?.normalMin ?? threshold?.minValue;
  const normalMax = threshold?.normalMax ?? threshold?.maxValue;
  const hasThreshold = typeof normalMin === "number" && typeof normalMax === "number";
  const dangerMin = threshold?.dangerMin;
  const dangerMax = threshold?.dangerMax;
  const level = hasThreshold
    ? getMetricStatus(value, { normalMin, normalMax, dangerMin, dangerMax })
    : undefined;

  const iconMap: Record<string, React.ReactNode> = {
    pH: <DropletsIcon size={20} />,
    temperature: <ThermometerIcon size={20} />,
    salinity: <WavesIcon size={20} />,
    dissolvedOxygen: <WindIcon size={20} />,
    turbidity: <GaugeIcon size={20} />,
    waterLevel: <ActivityIcon size={20} />,
  };

  const icon = iconMap[parameter];

  const levelConfig = {
    normal: {
      label: "Tốt",
      className:
        "bg-[var(--success-bg)] text-[var(--success)]",
    },

    warning: {
      label: "Cảnh báo",
      className:
        "bg-[var(--warning-bg)] text-[var(--warning)]",
    },

    danger: {
      label: "Nguy hiểm",
      className:
        "bg-[var(--critical-bg)] text-[var(--critical)]",
    },
  };

  const currentLevel = level ? levelConfig[level] : null;

  return (
    <div className="flex flex-col justify-center dashboard-card px-4 py-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between">
        <span className="text-sm font-medium text-(--text-body)">
          {title}
        </span>

        <div className="text-(--leaf-highlight)">
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="flex justify-center py-2">
        {hasThreshold ? <ProgressCircle
          value={value}
          title={unit}
          threshold={{
            min: normalMin,
            max: normalMax,
          }}
          size={120}
          strokeWidth={10}
          status={level}
        /> : <span className="text-3xl font-semibold text-(--text-primary)">{value} {unit}</span>}
      </div>

      {/* Threshold */}
      <div className="py-1 text-center text-xs text-(--text-muted)">
        {hasThreshold ? <>Ngưỡng an toàn: <span className="text-(--text-body)">{normalMin} - {normalMax} {unit}</span></> : "Chưa có ngưỡng được cấu hình từ backend."}
      </div>

      {/* Level */}
      {currentLevel && <div className="mt-2 flex items-center justify-center">
        <span
          className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium ${currentLevel.className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {currentLevel.label}
        </span>
      </div>}
    </div>
  );
};

export default MetricCard;
