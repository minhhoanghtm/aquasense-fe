import { useState } from "react";
import { Sparkles, Bell, Lightbulb, TrendingUp, Info } from "lucide-react";
import type { Pond } from "../../../types/Pond";
import { useAIAnalysis } from "../../../hooks/useAIAnalysis";

interface AIPredictionProps {
  pondId: string;
  pond?: Pond | null;
}

const AIPrediction = ({ pondId, pond }: AIPredictionProps) => {
  const [activeTab, setActiveTab] = useState<"prediction" | "alerts" | "recommendations">("prediction");
  const { predictions, recommendations, loading, error, available } = useAIAnalysis(pondId, false);
  const prediction = predictions.find((item) => item.pondId === pondId);
  const confidenceScore = prediction?.confidenceScore ?? (
    typeof prediction?.confidence === "number" ? Math.round(prediction.confidence * 100) : undefined
  );
  const recommendationsText = recommendations.map((item) => item.content).filter(Boolean);

  const emptyState = (text: string) => (
    <p className="py-5 text-xs text-[var(--text-muted)]">{text}</p>
  );

  return (
    <div className="border border-[var(--panel-border-strong)] bg-[#061d24]/65 backdrop-blur-md p-5 rounded-xl text-left flex flex-col h-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] w-full">
      <div className="flex items-center mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] text-[var(--accent)]">
          <Sparkles size={20} className="animate-pulse" />
        </div>
        <div className="flex flex-col ml-3.5">
          <h4 className="text-[var(--text-heading)] font-semibold text-base leading-tight tracking-wide">
            Trợ lý AI{pond?.name ? ` • ${pond.name}` : ""}
          </h4>
          <span className="text-[9px] text-[var(--text-muted)] font-bold tracking-wider mt-0.5 uppercase">
            {available ? "DỰ BÁO TỪ BACKEND" : "BACKEND CHƯA CÓ API AI"}
          </span>
        </div>
      </div>

      <div className="flex p-1 bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] rounded-xl mb-4 gap-1">
        {([
          ["prediction", Sparkles, "Dự đoán", predictions.length],
          ["alerts", Bell, "Cảnh báo", 0],
          ["recommendations", Lightbulb, "Khuyến nghị", recommendationsText.length],
        ] as const).map(([tab, Icon, label, count]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer flex-1 transition-all duration-200 ${activeTab === tab
              ? "bg-[var(--panel-highlight)] text-[var(--text-heading)] border border-[var(--panel-border-strong)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-heading)] border border-transparent hover:bg-[var(--panel-highlight)]"}`}
          >
            <Icon size={14} />
            <span>{label}</span>
            {(tab === "alerts" || tab === "recommendations") && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold bg-[var(--panel-bg)] text-[var(--text-muted)]">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "prediction" && (
        <div className="flex flex-col flex-1">
          {!available ? emptyState("Backend chưa cung cấp API dự báo AI.") : error ? emptyState(`Không thể tải dự báo: ${error}`) : loading ? emptyState("Đang tải dự báo cho ao đã chọn...") : prediction?.description ? (
            <>
              <p className="text-sm text-[var(--text-heading)] font-semibold leading-relaxed mb-4">{prediction.description}</p>
              <div className="grid grid-cols-2 gap-4 bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] rounded-xl p-3.5 mb-5">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold tracking-wider mb-1.5 uppercase">Xu hướng</span>
                  <div className="flex items-center gap-1.5 text-[var(--text-heading)] font-semibold text-sm">
                    <TrendingUp size={16} className="text-[var(--accent)]" />
                    <span>{prediction.parameterId || "Chưa xác định"}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold tracking-wider mb-1.5 uppercase">Mức rủi ro</span>
                  <span className="text-xs font-semibold text-[var(--text-heading)]">{prediction.riskLabel || prediction.riskLevel || "Chưa đánh giá"}</span>
                </div>
              </div>
              {typeof confidenceScore === "number" && (
                <div className="mt-auto pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold tracking-wider uppercase">Độ tin cậy</span>
                    <span className="text-xs text-[var(--accent)] font-bold">{confidenceScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--panel-bg-dark)] rounded-full mt-2 overflow-hidden border border-[var(--panel-border)]">
                    <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500 ease-out" style={{ width: `${confidenceScore}%` }} />
                  </div>
                </div>
              )}
            </>
          ) : emptyState("Chưa có dự báo AI từ backend cho ao này.")}
        </div>
      )}

      {activeTab === "alerts" && emptyState("Chưa có cảnh báo AI từ backend cho ao này.")}

      {activeTab === "recommendations" && (
        <div className="flex flex-col gap-3 flex-1">
          {recommendationsText.length > 0 ? recommendationsText.map((recommendation, index) => (
            <div key={`${recommendation}-${index}`} className="flex gap-3 items-start p-3 bg-[var(--success-bg)] border border-[var(--success-bg)] rounded-xl">
              <Info size={16} className="text-[var(--success)] mt-0.5 shrink-0" />
              <p className="text-xs text-[var(--text-body)] leading-relaxed">{recommendation}</p>
            </div>
          )) : emptyState("Chưa có khuyến nghị AI từ backend cho ao này.")}
        </div>
      )}
    </div>
  );
};

export default AIPrediction;
