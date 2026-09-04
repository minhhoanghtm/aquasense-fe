import React from "react";
import { Sparkles } from "lucide-react";
import PredictionCard, { type PredictionCardProps } from "./PredictionCard";

export interface WaterQualityRiskForecastProps {
  title?: string;
  subtitle?: string;
  items?: PredictionCardProps[];
  className?: string;
}

const DEFAULT_ITEMS: PredictionCardProps[] = [
  {
    pondName: "Vuông A1",
    riskLevel: "LOW",
    riskLabel: "Rủi ro thấp",
    description: "Điều kiện dự kiến ổn định. DO có thể giảm nhẹ trước bình minh.",
    confidenceScore: 94,
    confidenceLabel: "ĐỘ TIN CẬY",
  },
  {
    pondName: "Vuông B2",
    riskLevel: "MEDIUM",
    riskLabel: "Rủi ro trung bình",
    description: "Độ mặn tăng do bay hơi. Nên thay nước một phần.",
    confidenceScore: 87,
    confidenceLabel: "ĐỘ TIN CẬY",
  },
  {
    pondName: "Vuông D3",
    riskLevel: "HIGH",
    riskLabel: "Rủi ro cao",
    description: "DO phục hồi chậm hơn bình thường. Tăng sục khí và kiểm tra mẫu.",
    confidenceScore: 91,
    confidenceLabel: "ĐỘ TIN CẬY",
  },
];

export const WaterQualityRiskForecast: React.FC<WaterQualityRiskForecastProps> = ({
  title = "Dự báo rủi ro chất lượng nước",
  subtitle = "Dự đoán AI · 24–72 giờ tới",
  items = DEFAULT_ITEMS,
  className = "",
}) => {
  return (
    <div
      className={`bg-(--panel-bg) border border-(--panel-border) rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col gap-4 text-left ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-(--text-heading) m-0">
            {title}
          </h2>
          <p className="text-xs text-(--text-muted) mt-0.5">{subtitle}</p>
        </div>

        {/* AI Sparkles badge */}
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/70 text-teal-400 shadow-[0_0_10px_rgba(45,212,195,0.2)]">
          <Sparkles className="h-4 w-4 animate-pulse" />
        </div>
      </div>

      {/* 3-Column Grid of PredictionCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item, index) => (
          <PredictionCard
            key={item.pondName || index}
            pondName={item.pondName}
            riskLevel={item.riskLevel}
            riskLabel={item.riskLabel}
            description={item.description}
            confidenceScore={item.confidenceScore}
            confidenceLabel={item.confidenceLabel}
            onClick={item.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default WaterQualityRiskForecast;


