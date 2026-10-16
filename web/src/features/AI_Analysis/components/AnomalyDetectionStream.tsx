import React from "react";
import { Zap, AlertTriangle } from "lucide-react";

export interface AnomalyItem {
  id: string;
  title: string;
  subtitle: string;
  level?: "WARNING" | "DANGER" | "INFO";
}

export interface AnomalyDetectionStreamProps {
  title?: string;
  subtitle?: string;
  anomalies?: AnomalyItem[];
  className?: string;
}

export const AnomalyDetectionStream: React.FC<AnomalyDetectionStreamProps> = ({
  title = "Luồng phát hiện bất thường",
  subtitle = "Các bất thường do AI đánh dấu",
  anomalies = [],
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

        {/* Zap Icon */}
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-950/70 text-teal-400 shadow-[0_0_10px_rgba(45,212,195,0.2)]">
          <Zap className="h-4 w-4" />
        </div>
      </div>

      {/* Anomalies List */}
      <div className="divide-y divide-(--panel-border) mt-0.5">
        {anomalies.length > 0 ? anomalies.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 py-2.5 sm:py-3 first:pt-1.5 last:pb-0.5 transition-colors hover:bg-slate-900/20 px-1.5 rounded-lg"
          >
            {/* Warning Icon Box */}
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-400 mt-0.5">
              <AlertTriangle className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-(--text-heading) leading-snug">
                {item.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-(--text-muted) mt-0.5 leading-relaxed">
                {item.subtitle}
              </p>
            </div>
          </div>
        )) : <p className="py-6 text-sm text-(--text-muted)">Chưa có bất thường được AI ghi nhận.</p>}
      </div>
    </div>
  );
};

export default AnomalyDetectionStream;


