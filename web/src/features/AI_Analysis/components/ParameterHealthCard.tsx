import React from "react";
import { Gauge } from "lucide-react";
import WaterQualityRadar, { type ParameterData } from "../../../components/WaterQualityRadar";

export interface ParameterHealthCardProps {
  title?: string;
  subtitle?: string;
  data?: ParameterData[];
  className?: string;
}

export const ParameterHealthCard: React.FC<ParameterHealthCardProps> = ({
  title = "Sức khỏe thông số",
  subtitle = "Hiện tại so với ngưỡng tối ưu",
  data = [],
  className = "",
}) => {
  return (
    <div
      className={`bg-(--panel-bg) border border-(--panel-border) rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between text-left ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-(--text-heading) m-0">
            {title}
          </h3>
          <p className="text-xs text-(--text-muted) mt-0.5">{subtitle}</p>
        </div>

        {/* Icon Gauge */}
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/70 text-teal-400 shadow-[0_0_10px_rgba(45,212,195,0.2)]">
          <Gauge className="h-4 w-4" />
        </div>
      </div>

      {/* Radar Chart */}
      <div className="my-1 flex-1 flex items-center justify-center w-full min-h-[240px]">
        {data.length > 0 ? <WaterQualityRadar data={data} /> : <p className="text-sm text-(--text-muted)">Chưa có dữ liệu sức khỏe thông số.</p>}
      </div>
    </div>
  );
};

export default ParameterHealthCard;


