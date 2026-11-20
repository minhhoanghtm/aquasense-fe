import React from "react";
import { Sparkles } from "lucide-react";
import PredictionCard, { type PredictionCardProps } from "./PredictionCard";

export interface WaterQualityRiskForecastProps {
  title?: string;
  subtitle?: string;
  items?: PredictionCardProps[];
  className?: string;
}

export const WaterQualityRiskForecast: React.FC<WaterQualityRiskForecastProps> = ({
  title = "Dự báo rủi ro chất lượng nước",
  subtitle = "Dự báo ngắn hạn · 2 giờ tới",
  items = [],
  className = "",
}) => {
  return (
    <div
      className={`bg-(--panel-bg) border border-(--panel-border) rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col gap-3 text-left ${className}`}
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
        <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/70 text-teal-400 shadow-[0_0_10px_rgba(45,212,195,0.2)]">
          <Sparkles className="h-4 w-4 animate-pulse" />
        </div>
      </div>

      {/* 3-Column Grid of PredictionCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.length > 0 ? items.map((item, index) => (
          <PredictionCard
            key={item.pondName || index}
            pondName={item.pondName}
            riskLevel={item.riskLevel}
            riskLabel={item.riskLabel}
            description={item.description}
            confidenceScore={item.confidenceScore}
            confidenceLabel={item.confidenceLabel}
            predictionSource={item.predictionSource}
            isFallback={item.isFallback}
            onClick={item.onClick}
          />
        )) : <p className="col-span-full py-6 text-sm text-(--text-muted)">Chưa có dự báo từ hệ thống.</p>}
      </div>
    </div>
  );
};

export default WaterQualityRiskForecast;


