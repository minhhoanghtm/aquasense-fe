import { useState, useEffect, useMemo, useRef } from "react";
import Title from "../../components/Title";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import WaterQualityRiskForecast from "../../features/AI_Analysis/components/WaterQualityRiskForecast";
import AnomalyDetectionStream from "../../features/AI_Analysis/components/AnomalyDetectionStream";
import ParameterHealthCard from "../../features/AI_Analysis/components/ParameterHealthCard";
import Dropdown, { type DropdownOption } from "../../components/Dropdown";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useAIAnalysis } from "../../hooks/useAIAnalysis";
import {
    triggerPondPrediction,
    triggerActivePondsNow,
    getPredictionHistory,
    type RawAiPrediction,
} from "../../services/aiApi";
import { Sparkles, Play, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { getCurrentUser } from "../../services/authApi";
import { formatVietnamDateTime } from "../../utils/date";

export default function AIAnalysis() {
    useDocumentTitle("Phân tích AI");

    const { ponds } = usePonds();
    const [selectedPondId, setSelectedPondId] = useState("");

    const pondOptions: DropdownOption[] = useMemo(
        () =>
            ponds.map((p) => ({
                label: p.name || p.pondName || `Vuông ${p.id}`,
                value: p.id || p.pondId || "",
            })),
        [ponds]
    );

    const verifiedPondNames = useMemo(
        () => new Map(
            ponds.flatMap((pond) => {
                const pondId = pond.id || pond.pondId;
                const pondName = pond.name || pond.pondName;
                return pondId && pondName ? [[pondId, pondName] as const] : [];
            }),
        ),
        [ponds],
    );

    const [history, setHistory] = useState<RawAiPrediction[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const historyRequestId = useRef(0);
    const [triggering, setTriggering] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const currentUser = getCurrentUser();
    const canTrigger = currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

    useEffect(() => {
        if (!selectedPondId && ponds.length > 0) {
            setSelectedPondId(ponds[0].id || "");
        }
    }, [ponds, selectedPondId]);

    const { pond, device } = usePond(selectedPondId);
    const { predictions, anomalies, parameterHealth, available } = useAIAnalysis(selectedPondId || undefined);

    const showToast = (text: string, type: "success" | "error" = "success") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    const loadHistory = async (pondId: string) => {
        if (!pondId) return;

        const requestId = ++historyRequestId.current;

        setHistoryLoading(true);
        setHistoryError(null);
        setHistory([]);

        try {
            const data = await getPredictionHistory(pondId, 10);
            if (requestId === historyRequestId.current) {
                setHistory(data);
            }
        } catch (err) {
            if (requestId === historyRequestId.current) {
                setHistoryError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải lịch sử dự báo."
                );
            }
        } finally {
            if (requestId === historyRequestId.current) {
                setHistoryLoading(false);
            }
        }
    };

    useEffect(() => {
        if (selectedPondId) {
            loadHistory(selectedPondId);
        } else {
            historyRequestId.current += 1;
            setHistory([]);
            setHistoryError(null);
            setHistoryLoading(false);
        }
    }, [selectedPondId]);

    const handleTriggerSingle = async () => {
        if (!selectedPondId) return;
        setTriggering(true);
        try {
            const prediction = await triggerPondPrediction(selectedPondId);
            showToast(
                prediction.isFallback
                    ? "Dự báo đang dùng quy tắc dự phòng; kiểm tra dữ liệu cảm biến và trạng thái dịch vụ AI."
                    : "Đã kích hoạt tính toán AI cho ao thành công!",
            );
            await loadHistory(selectedPondId);
            window.dispatchEvent(new Event("telemetry-updated"));
        } catch (err: any) {
            showToast(err.message || "Không thể kích hoạt tính toán AI.", "error");
        } finally {
            setTriggering(false);
        }
    };

    const handleTriggerAll = async () => {
        setTriggering(true);
        try {
            const res = await triggerActivePondsNow();
            showToast(res.message || "Đã đưa toàn bộ ao vào hàng đợi tính toán AI!");
            if (selectedPondId) {
                await loadHistory(selectedPondId);
            }
        } catch (err: any) {
            showToast(err.message || "Không thể kích hoạt tính toán AI hàng loạt.", "error");
        } finally {
            setTriggering(false);
        }
    };

    const forecastItems = predictions.map((pred) => {
        const predictionPondId = pred.pondId || selectedPondId;
        const verifiedPondName = predictionPondId ? verifiedPondNames.get(predictionPondId) : undefined;

        return {
            // Only trust a pond name that came from the currently verified pond list.
            pondName: verifiedPondName || `Ao nuôi · mã ${predictionPondId || "không xác định"}`,
            riskLevel: pred.riskLevel,
            riskLabel: pred.riskLabel || (pred.riskLevel === "LOW" ? "Rủi ro thấp" : pred.riskLevel === "MEDIUM" ? "Rủi ro trung bình" : "Rủi ro cao"),
            description: pred.description || `Dự báo ${pred.parameterId} đạt ${pred.predictedValue} ${pred.unit}`,
            confidenceScore: pred.confidenceScore ?? (typeof pred.confidence === "number" ? Math.round(pred.confidence * 100) : undefined),
            confidenceLabel: pred.confidenceLabel || "ĐỘ TIN CẬY",
            predictionSource: pred.predictionSource,
            isFallback: pred.isFallback,
        };
    });

    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4 text-left">
            <Title
                title="Phân tích AI"
                description="Hệ thống phân tích và dự báo thông minh cho vuông nuôi tôm"
                pond={pond}
                device={device}
            />

            {toastMessage && (
                <div
                    className={`rounded-xl border p-3 text-sm flex items-center gap-2 ${
                        toastMessage.type === "success"
                            ? "border-teal-500/40 bg-teal-950/60 text-teal-200"
                            : "border-rose-500/40 bg-rose-950/60 text-rose-200"
                    }`}
                >
                    {toastMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Thanh điều khiển chọn ao & kích hoạt dự báo AI */}
            <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border)] shadow-sm">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Chọn vuông nuôi:</span>
                    <div className="w-56 sm:w-64">
                        <Dropdown
                            value={selectedPondId}
                            options={pondOptions}
                            onChange={setSelectedPondId}
                            placeholder="Chọn vuông nuôi"
                            searchPlaceholder="Tìm kiếm vuông nuôi..."
                        />
                    </div>
                </div>

                {canTrigger && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handleTriggerSingle}
                            disabled={triggering || !selectedPondId}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] text-xs font-bold hover:brightness-110 disabled:opacity-50 transition cursor-pointer shadow-md shadow-[var(--accent)]/20"
                        >
                            <Sparkles size={14} />
                            <span>{triggering ? "Đang chạy..." : "Dự báo vuông này"}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleTriggerAll}
                            disabled={triggering}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] text-[var(--accent)] text-xs font-semibold hover:bg-[var(--panel-highlight)] disabled:opacity-50 transition cursor-pointer"
                        >
                            <Play size={14} />
                            <span>Chạy tất cả vuông</span>
                        </button>
                    </div>
                )}
            </div>

            {!available && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-sm text-amber-100">
                    Backend hiện chưa công bố API dữ liệu AI; các khối dưới đây chỉ hiển thị trạng thái chưa có dữ liệu.
                </div>
            )}

            {/* Top: Dự báo rủi ro chất lượng nước */}
            <WaterQualityRiskForecast items={forecastItems} />

            {/* Bottom 2-Column: Luồng phát hiện bất thường (Trái) + Sức khỏe thông số (Phải) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
                    <AnomalyDetectionStream anomalies={anomalies} className="h-full" />
                </div>
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                    <ParameterHealthCard data={parameterHealth} className="h-full" />
                </div>
            </div>

            {/* Bảng lịch sử dự báo AI */}
            <div className="dashboard-card p-5 sm:p-6 flex flex-col gap-3.5 shadow-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[var(--accent)]" />
                        <h3 className="text-sm font-bold text-[var(--text-heading)] m-0">Lịch sử dự báo AI gần nhất</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => selectedPondId && loadHistory(selectedPondId)}
                        disabled={historyLoading}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        <RefreshCw size={12} className={historyLoading ? "animate-spin" : ""} />
                        <span>Làm mới</span>
                    </button>
                </div>

                {historyLoading ? (
                    <div className="py-6 text-center text-xs text-[var(--text-muted)]">Đang tải lịch sử dự báo...</div>
                ) : historyError ? (
                    <div role="alert" className="py-6 text-center text-xs text-rose-400">
                        Không thể tải lịch sử dự báo: {historyError}
                    </div>
                ) : history.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                        Chưa có bản ghi dự báo nào cho vuông nuôi này.
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="border-b border-[var(--panel-border)] text-[var(--text-muted)]">
                                    <th className="py-2.5 px-3">Thời điểm dự báo</th>
                                    <th className="py-2.5 px-3">Oxy DO (mg/L)</th>
                                    <th className="py-2.5 px-3">Độ pH</th>
                                    <th className="py-2.5 px-3">Điểm rủi ro</th>
                                    <th className="py-2.5 px-3">Mức rủi ro</th>
                                    <th className="py-2.5 px-3">Nguồn tính toán</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--panel-border)]/40">
                                {history.map((h) => (
                                    <tr key={h.predictionId} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-2.5 px-3 font-mono text-[var(--text-body)]">
                                            {formatVietnamDateTime(h.predictedTime)}
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-teal-300">
                                            {h.predictedDO != null ? Number(h.predictedDO).toFixed(2) : "--"}
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-cyan-300">
                                            {h.predictedPH != null ? Number(h.predictedPH).toFixed(2) : "--"}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            {h.riskScore != null ? `${(Number(h.riskScore) * 100).toFixed(0)}%` : "--"}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    h.riskLevel === "HIGH"
                                                        ? "bg-rose-950 text-rose-300 border border-rose-500/30"
                                                        : h.riskLevel === "MEDIUM"
                                                        ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                                                        : "bg-teal-950 text-teal-300 border border-teal-500/30"
                                                }`}
                                            >
                                                {h.riskLevel || "LOW"}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-[11px] text-[var(--text-muted)]">
                                            {h.isFallback === true || h.predictionSource === "HEURISTIC_RULE"
                                                ? "Quy tắc Heuristic (Dự phòng)"
                                                : h.isFallback === false && h.predictionSource === "AI_MICROSERVICE"
                                                    ? "AI Microservice"
                                                    : "Chưa xác định nguồn dự báo"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
