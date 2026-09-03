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
  threshold: {
    normalMin: number;
    normalMax: number;
    dangerMin: number;
    dangerMax: number;
  };
};

const MetricCard = ({
  title,
  parameter,
  value,
  unit,
  threshold,
}: MetricCardProps) => {
  const level = getMetricStatus(value, threshold);

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

  const currentLevel = levelConfig[level];

  return (
    <div className="flex flex-col justify-center rounded-3xl border border-(--panel-border) bg-(--panel-bg) px-4 py-4">
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
        <ProgressCircle
          value={value}
          title={unit}
          threshold={{
            min: threshold.normalMin,
            max: threshold.normalMax,
          }}
          size={120}
          strokeWidth={10}
          status={level}
        />
      </div>

      {/* Threshold */}
      <div className="py-1 text-center text-xs text-(--text-muted)">
        Ngưỡng an toàn:{" "}
        <span className="text-(--text-body)">
          {threshold.normalMin} - {threshold.normalMax} {unit}
        </span>
      </div>

      {/* Level */}
      <div className="mt-2 flex items-center justify-center">
        <span
          className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium ${currentLevel.className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {currentLevel.label}
        </span>
      </div>
    </div>
  );
};

export default MetricCard;