import React from "react";
import ProgressBar from "../../../components/ProgressBar";
import { Bubbles } from "lucide-react";

export type WaterQualityMetric = {
  id: string;
  title: string;
  value: number;
};

const defaultMetrics: WaterQualityMetric[] = [
  {
    id: "overall",
    title: "Chất lượng nước tổng thể",
    value: 92,
  },
  {
    id: "sensor-connection",
    title: "Kết nối cảm biến",
    value: 98,
  },
  {
    id: "optimal-parameters",
    title: "Thông số tối ưu",
    value: 84,
  },
];

interface WaterQualitySummaryProps {
  metrics?: WaterQualityMetric[];
}

const WaterQualitySummary: React.FC<WaterQualitySummaryProps> = ({
  metrics = defaultMetrics,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-5 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base text-left md:text-lg font-bold text-(--text-heading)">
          Tóm tắt chất lượng nước
        </h2>
        <Bubbles className="h-6 w-6 text-(--accent)" />
      </div>

      <div className="flex flex-col gap-3">
        {metrics.map((metric) => (
          <div key={metric.id}>
            <ProgressBar title={metric.title} value={metric.value} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaterQualitySummary;

