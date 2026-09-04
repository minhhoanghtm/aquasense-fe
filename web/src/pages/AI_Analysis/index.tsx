import Title from "../../components/Title";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import WaterQualityRiskForecast from "../../features/AI_Analysis/components/WaterQualityRiskForecast";
import AnomalyDetectionStream from "../../features/AI_Analysis/components/AnomalyDetectionStream";
import ParameterHealthCard from "../../features/AI_Analysis/components/ParameterHealthCard";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useAIAnalysis } from "../../hooks/useAIAnalysis";

export default function AIAnalysis() {
    useDocumentTitle("Phân tích AI");

    const { ponds } = usePonds();
    const selectedPondId = ponds.length > 0 ? ponds[0].id : "";
    const { pond, device } = usePond(selectedPondId);
    const { predictions, anomalies, parameterHealth } = useAIAnalysis(selectedPondId || undefined);

    const forecastItems = predictions.map((pred) => ({
        pondName: pred.pondName || `Vuông ${pred.pondId}`,
        riskLevel: pred.riskLevel,
        riskLabel: pred.riskLabel || (pred.riskLevel === "LOW" ? "Rủi ro thấp" : pred.riskLevel === "MEDIUM" ? "Rủi ro trung bình" : "Rủi ro cao"),
        description: pred.description || `Dự báo ${pred.parameterId} đạt ${pred.predictedValue} ${pred.unit}`,
        confidenceScore: pred.confidenceScore || Math.round(pred.confidence * 100),
        confidenceLabel: pred.confidenceLabel || "ĐỘ TIN CẬY",
    }));

    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5 text-left">
            <Title
                title="Phân tích AI"
                description="Hệ thống phân tích và dự báo thông minh cho vuông nuôi tôm"
                pond={pond}
                device={device}
            />

            {/* Top: Dự báo rủi ro chất lượng nước */}
            <WaterQualityRiskForecast items={forecastItems.length > 0 ? forecastItems : undefined} />

            {/* Bottom 2-Column: Luồng phát hiện bất thường (Trái) + Sức khỏe thông số (Phải) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
                    <AnomalyDetectionStream anomalies={anomalies.length > 0 ? anomalies : undefined} className="h-full" />
                </div>
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                    <ParameterHealthCard data={parameterHealth.length > 0 ? parameterHealth : undefined} className="h-full" />
                </div>
            </div>
        </div>
    );
}