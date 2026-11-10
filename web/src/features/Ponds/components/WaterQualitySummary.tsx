import React, { memo } from "react";
import ProgressBar from "../../../components/ProgressBar";
import { Bubbles } from "lucide-react";

export type WaterQualityMetric = {
  id: string;
  title: string;
  value: number;
};

interface WaterQualitySummaryProps {
  metrics?: WaterQualityMetric[];
}

const WaterQualitySummary: React.FC<WaterQualitySummaryProps> = memo(({
  metrics = [],
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
        {metrics.length > 0 ? metrics.map((metric) => (
          <div key={metric.id}>
            <ProgressBar title={metric.title} value={metric.value} />
          </div>
        )) : <p className="text-sm text-(--text-muted)">Chưa có dữ liệu chất lượng nước cho ao được chọn.</p>}
      </div>
    </div>
  );
});
WaterQualitySummary.displayName = "WaterQualitySummary";

export default WaterQualitySummary;

