import React from "react";
import ProgressBar from "../../../components/ProgressBar";

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
      badge: "bg-teal-950/70 text-teal-400 border border-teal-500/30",
      dot: "bg-teal-400",
      barColor: "bg-gradient-to-r from-teal-400 to-cyan-300",
    };
  }
  if (upper === "MEDIUM" || upper === "TRUNG BÌNH" || upper === "RỦI RO TRUNG BÌNH") {
    return {
      label: "Rủi ro trung bình",
      badge: "bg-amber-950/70 text-amber-400 border border-amber-500/30",
      dot: "bg-amber-400",
      barColor: "bg-gradient-to-r from-teal-400 to-cyan-300",
    };
  }
  if (upper === "HIGH" || upper === "CAO" || upper === "RỦI RO CAO" || upper === "DANGER") {
    return {
      label: "Rủi ro cao",
      badge: "bg-rose-950/70 text-rose-400 border border-rose-500/30",
      dot: "bg-rose-400",
      barColor: "bg-gradient-to-r from-teal-400 to-cyan-300",
    };
  }
  return {
    label: risk || "Rủi ro thấp",
    badge: "bg-teal-950/70 text-teal-400 border border-teal-500/30",
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
      className={`bg-(--panel-bg) border border-(--panel-border) rounded-2xl p-4 sm:p-4.5 shadow-lg flex flex-col justify-between gap-3 text-left transition-all duration-200 hover:border-(--panel-border-strong) ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Header: Pond Name + Risk Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-(--text-heading)">
          {pondName}
        </h3>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${riskConfig.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${riskConfig.dot}`} />
          {riskLabel || riskConfig.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-(--text-body) leading-relaxed min-h-[36px]">
        {description}
      </p>

      {/* Progress Bar (calling existing ProgressBar component) */}
      <div className="mt-0.5">
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

