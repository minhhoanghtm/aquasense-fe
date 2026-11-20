import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Bell, Lightbulb, TrendingUp, Info, Clock } from "lucide-react";
import type { Pond } from "../../../types/Pond";
import { useAIAnalysis } from "../../../hooks/useAIAnalysis";
import { getTimeAgo, formatVietnamDateTime } from "../../../utils/date";

interface AIPredictionProps {
  pondId: string;
  pond?: Pond | null;
  alerts?: any[];
  className?: string;
}

const DASHBOARD_ALERT_PREVIEW_LIMIT = 5;

const AIPrediction = ({ pondId, pond, alerts, className }: AIPredictionProps) => {
  const [activeTab, setActiveTab] = useState<"prediction" | "alerts" | "recommendations">("prediction");
  const { predictions, recommendations, loading, error, available, predictionAvailability } = useAIAnalysis(pondId, false);

  // Lọc chỉ thông tin của ao đang được chọn
  const prediction = useMemo(() => {
    return (
      predictions.find((item) => item.pondId === pondId) ||
      (pond?.name ? predictions.find((item) => item.pondName === pond.name) : undefined)
    );
  }, [predictions, pondId, pond]);

  const confidenceScore = prediction?.confidenceScore ?? (
    typeof prediction?.confidence === "number" ? Math.round(prediction.confidence * 100) : undefined
  );

  // Lọc cảnh báo nghiêm ngặt chỉ thuộc về ao đang được chọn
  const pondAlerts = useMemo(() => {
    const rawAlerts = Array.isArray(alerts) ? alerts : [];
    return rawAlerts.filter((alert: any) => {
      if (!pondId && !pond?.name) return true;
      const aPondId =
        alert.pondId || alert.pond_id || alert.pond?.id || alert.pond?.pondId;
      if (pondId && aPondId === pondId) return true;
      if (
        pond?.name &&
        alert.pondName &&
        alert.pondName.trim().toLowerCase() === pond.name.trim().toLowerCase()
      ) {
        return true;
      }
      if (aPondId && pondId && aPondId !== pondId) return false;
      return false;
    });
  }, [alerts, pondId, pond]);

  // Lọc khuyến nghị cho ao này
  const pondRecommendations = useMemo(() => {
    return recommendations
      .filter((item) => !item.pondId || item.pondId === pondId)
      .map((item) => item.content)
      .filter(Boolean);
  }, [recommendations, pondId]);

  // Khuyến nghị dự phòng thông minh theo mức rủi ro của ao
  const smartFallbackRecommendation = useMemo(() => {
    if (!prediction) return null;
    if (prediction.riskLevel === "HIGH" || prediction.riskLevel === "CRITICAL") {
      return "Cảnh báo rủi ro cao: Vui lòng bật quạt nước tăng cường và giảm 30% lượng thức ăn cữ tới.";
    }
    if (prediction.riskLevel === "MEDIUM") {
      return "Chỉ số nước có dấu hiệu biến động: Duy trì quạt nước và kiểm tra lại nồng độ DO sau 1 giờ.";
    }
    return "Môi trường nước ao ổn định. Duy trì chế độ cho ăn và vận hành bình thường.";
  }, [prediction]);

  const displayedRecommendations =
    pondRecommendations.length > 0
      ? pondRecommendations
      : smartFallbackRecommendation
      ? [smartFallbackRecommendation]
      : [];
  const visibleAlerts = pondAlerts.slice(0, DASHBOARD_ALERT_PREVIEW_LIMIT);

  const emptyState = (text: string) => (
    <p className="py-5 text-xs text-[var(--text-muted)] text-center">{text}</p>
  );

  const predictionErrorMessage = () => {
    switch (predictionAvailability) {
      case "TELEMETRY_STALE":
        return "Dữ liệu cảm biến đã quá 15 phút; hãy cập nhật telemetry trước khi dự báo.";
      case "TELEMETRY_FUTURE":
        return "Dấu thời gian telemetry không hợp lệ (nằm trong tương lai).";
      case "TELEMETRY_MISSING":
      case "TELEMETRY_INVALID":
        return "Thiếu hoặc không hợp lệ dữ liệu cảm biến cần thiết; chưa tạo dự báo.";
      default:
        return `Dịch vụ dự báo Backend/AI chưa sẵn sàng: ${error ?? "không rõ lỗi"}`;
    }
  };

  return (
    <div className={`dashboard-card p-5 sm:p-6 text-left flex flex-col shadow-md w-full flex-[0_0_auto] ${className || ""}`}>
      {/* Title */}
      <div className="flex items-center mb-4 shrink-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] text-[var(--accent)] shrink-0">
          <Sparkles size={20} className="animate-pulse" />
        </div>
        <div className="flex flex-col ml-3.5 min-w-0 flex-1">
          <h4
            className="text-[var(--text-heading)] font-semibold text-base leading-tight tracking-wide truncate block w-full"
            title={`Trợ lý AI${pond?.name ? ` • ${pond.name}` : ""}`}
          >
            Trợ lý AI{pond?.name ? ` • ${pond.name}` : ""}
          </h4>
          <span className="text-[9px] text-[var(--text-muted)] font-bold tracking-wider mt-0.5 uppercase">
            {available ? "DỰ BÁO TỪ BACKEND" : "BACKEND CHƯA CÓ API AI"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] rounded-xl mb-3.5 gap-1 shrink-0">
        {([
          ["prediction", Sparkles, "Dự đoán", prediction ? 1 : 0],
          ["alerts", Bell, "Cảnh báo", pondAlerts.length],
          ["recommendations", Lightbulb, "Khuyến nghị", displayedRecommendations.length],
        ] as const).map(([tab, Icon, label, count]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold cursor-pointer flex-1 transition-all duration-200 ${
              activeTab === tab
                ? "bg-[var(--panel-highlight)] text-[var(--text-heading)] border border-[var(--panel-border-strong)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-heading)] border border-transparent hover:bg-[var(--panel-highlight)]"
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
            <span
              className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${
                tab === "alerts" && count > 0
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-[var(--panel-bg)] text-[var(--text-muted)]"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab: Dự đoán */}
      {activeTab === "prediction" && (
        <div className="flex flex-col pr-1">
          {!available ? (
            emptyState("Backend chưa cung cấp API dự báo AI.")
          ) : error ? (
            emptyState(predictionErrorMessage())
          ) : loading ? (
            emptyState("Đang tải dự báo cho ao đã chọn...")
          ) : prediction?.description ? (
            <>
              <p className="text-sm text-[var(--text-heading)] font-semibold leading-relaxed mb-3">
                {prediction.description}
              </p>
              {prediction.isFallback && (
                <p className="text-xs text-amber-300 border border-amber-500/40 bg-amber-950/30 rounded-lg px-3 py-2 mb-3">
                  Kết quả ước tính theo HEURISTIC_RULE — không phải AI model đã được phê duyệt.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] rounded-xl p-3 mb-3">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold tracking-wider mb-1.5 uppercase">
                    Xu hướng
                  </span>
                  <div className="flex items-center gap-1.5 text-[var(--text-heading)] font-semibold text-sm">
                    <TrendingUp size={16} className="text-[var(--accent)]" />
                    <span>{prediction.parameterId || "Chưa xác định"}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold tracking-wider mb-1.5 uppercase">
                    Mức rủi ro
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-heading)]">
                    {prediction.riskLabel || prediction.riskLevel || "Chưa đánh giá"}
                  </span>
                </div>
              </div>
              {typeof confidenceScore === "number" && (
                <div className="pt-1 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold tracking-wider uppercase">
                      Độ tin cậy
                    </span>
                    <span className="text-xs text-[var(--accent)] font-bold">
                      {confidenceScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--panel-bg-dark)] rounded-full mt-2 overflow-hidden border border-[var(--panel-border)]">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${confidenceScore}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            emptyState(`Chưa có dữ liệu dự báo AI cho ${pond?.name ? `ao "${pond.name}"` : "ao này"}.`)
          )}
        </div>
      )}

      {/* Tab: Cảnh báo */}
      {activeTab === "alerts" && (
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1 pb-1">
          {pondAlerts.length > 0 ? (
            <>
              {visibleAlerts.map((alert: any, index: number) => (
                <div
                  key={alert.id ?? index}
                  className="relative flex flex-col w-full pl-3.5 pr-2.5 py-2.5 bg-[var(--panel-bg-dark)]/40 border border-[var(--panel-border)]/50 hover:border-cyan-500/30 hover:bg-[var(--panel-highlight)] rounded-xl transition-all shadow-sm text-left"
                >
                  <span className="absolute left-1.5 top-3 bottom-3 w-[3px] bg-[var(--critical)] rounded-full" />
                  <p className="font-semibold text-xs text-[var(--text-heading)] leading-snug">
                    {alert.message || alert.title || "Cảnh báo chỉ số"}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mt-1.5 pt-1 border-t border-[var(--panel-border)]/20">
                    <span className="flex items-center gap-1 font-mono text-cyan-300/80">
                      <Clock size={10} />
                      {formatVietnamDateTime(alert.createdAt || alert.time, {
                        showSeconds: false,
                      })}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {getTimeAgo(alert.createdAt || alert.time)}
                    </span>
                  </div>
                </div>
              ))}
              {pondAlerts.length > DASHBOARD_ALERT_PREVIEW_LIMIT && (
                <Link
                  to="/alerts"
                  className="text-center text-xs font-medium text-teal-400 hover:text-teal-300 py-1"
                >
                  Xem tất cả {pondAlerts.length} cảnh báo
                </Link>
              )}
            </>
          ) : (
            emptyState(`Ao "${pond?.name || "này"}" không có cảnh báo nào.`)
          )}
        </div>
      )}

      {/* Tab: Khuyến nghị */}
      {activeTab === "recommendations" && (
        <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1 pb-1">
          {displayedRecommendations.length > 0 ? (
            displayedRecommendations.map((recommendation, index) => (
              <div
                key={`${recommendation}-${index}`}
                className="flex gap-2.5 items-start p-3 bg-[var(--success-bg)] border border-[var(--success-bg)] rounded-xl"
              >
                <Info size={15} className="text-[var(--success)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--text-body)] leading-relaxed text-left">
                  {recommendation}
                </p>
              </div>
            ))
          ) : (
            emptyState(`Chưa có khuyến nghị AI cho ${pond?.name ? `ao "${pond.name}"` : "ao này"}.`)
          )}
        </div>
      )}
    </div>
  );
};

export default AIPrediction;
