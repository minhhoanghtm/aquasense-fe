import React from "react";
import { LatestReadingCard, type ReadingMetric } from "../../components/LatestReadingCard";

interface LatestReadingProps {
  deviceCode?: string;
  deviceName?: string;
  metrics?: ReadingMetric[];
  className?: string;
}

const defaultProbeMetrics: ReadingMetric[] = [
  {
    id: "ph",
    label: "PH",
    value: "7.8",
    color: "cyan",
  },
  {
    id: "temperature",
    label: "NHIỆT ĐỘ",
    value: "29.4°C",
    color: "cyan",
  },
  {
    id: "do",
    label: "DO",
    value: "4.2 mg/L",
    color: "amber",
  },
  {
    id: "signal",
    label: "TÍN HIỆU",
    value: "18%",
    color: "cyan",
  },
];

export const LatestReading: React.FC<LatestReadingProps> = ({
  deviceCode = "DO-PROBE-004",
  deviceName = "Mẫu DO A1-04",
  metrics = defaultProbeMetrics,
  className = "",
}) => {
  return (
    <LatestReadingCard
      deviceCode={deviceCode}
      title={deviceName}
      metrics={metrics}
      className={className}
    />
  );
};

export default LatestReading;
