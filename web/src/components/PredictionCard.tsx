import React from "react";
import ProgressBar from "./ProgressBar";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | string;

export interface PredictionCardProps {
  pondName?: string;
  riskLevel?: RiskLevel;
  riskLabel?: string;
  description?: string;
  confidenceScore?: number;
  confidenceLabel?: string;
  className?: string;
  onClick?: () => void;
}

const getRiskConfig = (risk?: string) => {
  const upper = risk?.toUpperCase();
  if (upper === "LOW" || upper === "RỦI RO THẤP" || upper === "THẤP") {
    return {
      label: "Rủi ro thấp",
      badge: "bg-teal-950/70 text-teal-400 border-teal-500/30",
      dot: "bg-teal-400",
      barColor: "bg-gradient-to-r from-teal-400 to-cyan-300",
    };
  }
  if (upper === "MEDIUM" || upper === "TRUNG BÌNH" || upper === "RỦI RO TRUNG BÌNH") {
    return {
      label: "Rủi ro trung bình",
      badge: "bg-amber-950/70 text-amber-400 border-amber-500/30",
      dot: "bg-amber-400",
      barColor: "bg-gradient-to-r from-amber-400 to-yellow-300",
    };
  }
  if (upper === "HIGH" || upper === "CAO" || upper === "RỦI RO CAO" || upper === "DANGER") {
    return {
      label: "Rủi ro cao",
      badge: "bg-rose-950/70 text-rose-400 border-rose-500/30",
      dot: "bg-rose-400",
      barColor: "bg-gradient-to-r from-rose-500 to-red-400",
    };
  }
  return {
    label: risk || "Rủi ro thấp",
    badge: "bg-teal-950/70 text-teal-400 border-teal-500/30",
    dot: "bg-teal-400",
    barColor: "bg-gradient-to-r from-teal-400 to-cyan-300",
  };
};

export const PredictionCard: React.FC<PredictionCardProps> = ({
  pondName = "Vuông A1",
  riskLevel = "LOW",
  riskLabel,
  description = "Điều kiện dự kiến ổn định. DO có thể giảm nhẹ trước bình minh.",
  confidenceScore = 94,
  confidenceLabel = "ĐỘ TIN CẬY",
  className = "",
  onClick,
}) => {
  const riskConfig = getRiskConfig(riskLabel || riskLevel);

  return (
    <div
      onClick={onClick}
      className={`bg-(--bg-gradient-top) border border-(--panel-border) rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-lg flex flex-col gap-4 text-left transition-all duration-200 hover:border-(--panel-border-strong) ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-bold text-(--text-heading)">
          {pondName}
        </h3>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${riskConfig.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${riskConfig.dot}`} />
          {riskLabel || riskConfig.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs md:text-sm text-(--text-body) leading-relaxed">
        {description}
      </p>

      {/* Progress Bar (reusing existing ProgressBar component) */}
      <div className="mt-1">
        <ProgressBar
          title={confidenceLabel}
          value={confidenceScore}
          barColor={riskConfig.barColor}
        />
      </div>
    </div>
  );
};

export default PredictionCard;

