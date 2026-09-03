import { useState } from 'react';
import { Sparkles, Bell, Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import type { Pond } from '../../../types/Pond';

interface AIPredictionProps {
    pond?: Pond | null;
    waterQuality?: any;
}

const AIPrediction = ({ pond, waterQuality }: AIPredictionProps) => {
    const [activeTab, setActiveTab] = useState<'prediction' | 'alerts' | 'recommendations'>('prediction');

    // Mặc định hoặc khi chưa tải xong dữ liệu
    let predictionText = "Điều kiện dự kiến ổn định. DO có thể giảm nhẹ trước bình minh.";
    let trendText = "Ổn định";
    let riskText = "Rủi ro thấp";
    let confidenceScore = 94;

    let aiAlerts = [
        "Độ pH có xu hướng giảm nhẹ dưới 7.2 trong 6 giờ tới.",
        "Nhiệt độ nước tăng cao vào buổi trưa, cần theo dõi sát chỉ số oxy."
    ];

    let aiRecommendations = [
        "Vận hành máy quạt nước từ 02:00 - 05:00 để duy trì hàm lượng DO ổn định.",
        "Hạn chế cho ăn quá mức vào cữ trưa để tránh ô nhiễm hữu cơ khi nhiệt độ cao."
    ];

    // Tạo các cảnh báo và khuyến nghị động dựa trên chất lượng nước thực tế
    if (waterQuality?.sensorReadings && waterQuality.sensorReadings.length > 0) {
        const latestReading = waterQuality.sensorReadings[waterQuality.sensorReadings.length - 1];
        const metrics = latestReading.metrics || [];
        const thresholds = waterQuality.thresholds || [];

        const doMetric = metrics.find((m: any) => m.name === 'Oxy hòa tan' || m.name === 'dissolvedOxygen' || m.parameterId === 'dissolvedOxygen');
        const phMetric = metrics.find((m: any) => m.name === 'pH');
        const tempMetric = metrics.find((m: any) => m.name === 'Nhiệt độ' || m.name === 'temperature' || m.parameterId === 'temperature');

        const getStatus = (val: number, name: string) => {
            const thr = thresholds.find((t: any) => t.parameterId === name || t.parameterName === name);
            if (!thr) return 'normal';
            if (val < thr.dangerMin || val > thr.dangerMax) return 'danger';
            if (val < thr.normalMin || val > thr.normalMax) return 'warning';
            return 'normal';
        };

        const doVal = doMetric?.value;
        const phVal = phMetric?.value;
        const tempVal = tempMetric?.value;

        const doStatus = doVal !== undefined ? getStatus(doVal, 'dissolvedOxygen') : 'normal';
        const phStatus = phVal !== undefined ? getStatus(phVal, 'pH') : 'normal';
        const tempStatus = tempVal !== undefined ? getStatus(tempVal, 'temperature') : 'normal';

        if (doStatus === 'danger' || (doVal !== undefined && doVal < 5.0)) {
            predictionText = "Hàm lượng Oxy hòa tan (DO) có xu hướng giảm sâu về sáng sớm. Cần chú ý vận hành máy quạt nước.";
            trendText = "Giảm nhẹ";
            riskText = "Trung bình";
            confidenceScore = 88;
            aiAlerts = [
                `Chỉ số Oxy hòa tan hiện tại ở mức thấp (${doVal} mg/L), dự kiến giảm dưới ngưỡng an toàn lúc 03:00 - 05:00 sáng.`,
                "Hoạt động hô hấp của tảo về đêm làm tiêu hao nhanh lượng oxy trong nước."
            ];
            aiRecommendations = [
                "Khởi động toàn bộ hệ thống quạt nước từ 01:00 đến 06:00 sáng mai.",
                "Chuẩn bị sẵn oxy hạt (oxy viên) để rải cấp cứu nếu chỉ số DO thực tế giảm dưới 3.5 mg/L.",
                "Cắt giảm 10% lượng thức ăn cữ sáng để giảm tải tiêu hao oxy phân hủy hữu cơ."
            ];
        } else if (tempStatus === 'danger' || (tempVal !== undefined && tempVal > 31.5)) {
            predictionText = "Nhiệt độ nước tăng cao vượt ngưỡng tối ưu. Tốc độ chuyển hóa thức ăn tăng mạnh, dễ tích tụ khí độc.";
            trendText = "Tăng nhanh";
            riskText = "Cao";
            confidenceScore = 91;
            aiAlerts = [
                `Nhiệt độ nước đạt mức cao (${tempVal}°C) vào buổi trưa, làm tăng độc tính của khí độc NH3.`,
                "Oxy hòa tan giảm sút do độ hòa tan giảm ở nhiệt độ cao."
            ];
            aiRecommendations = [
                "Giảm 15% - 20% lượng thức ăn vào cữ trưa nắng nóng từ 11:00 - 14:00.",
                "Vận hành quạt nước tầng mặt vào giữa trưa để đảo đều nước và giải phóng nhiệt.",
                "Bổ sung Vitamin C và khoáng chất chống sốc nhiệt cho tôm nuôi."
            ];
        } else if (phStatus === 'danger' || phStatus === 'warning') {
            predictionText = `Độ pH của nước (${phVal}) biến động ngoài ngưỡng tối ưu. Có nguy cơ ảnh hưởng lớp vỏ tôm.`;
            trendText = phVal !== undefined && phVal < 7.5 ? "Giảm dần" : "Tăng dần";
            riskText = "Trung bình";
            confidenceScore = 85;
            aiAlerts = [
                `Chỉ số pH đạt ${phVal}, dao động ngoài ngưỡng tối ưu (7.5 - 8.5) ảnh hưởng hệ đệm sinh học.`,
                "Sự phát triển mạnh của tảo (tảo nở hoa) có thể làm pH tăng cao vào chiều tối."
            ];
            aiRecommendations = [
                phVal !== undefined && phVal < 7.5
                    ? "Bón vôi nông nghiệp CaCO3 hoặc vôi tôi Ca(OH)2 liều lượng 10-15 kg/1000m3 để ổn định pH."
                    : "Sử dụng mật rỉ đường kết hợp men vi sinh để khống chế tảo và hạ pH tự nhiên.",
                "Hạn chế thay nước đột ngột trong thời gian pH biến động mạnh."
            ];
        }
    }

    const alertsCount = aiAlerts.length;
    const recommendationsCount = aiRecommendations.length;

    return (
        <div className="border border-(--panel-border-strong) bg-[#061d24]/65 backdrop-blur-md p-5 rounded-2xl text-left flex flex-col h-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] w-full">
            {/* Header */}
            <div className="flex items-center mb-5">
                {/* Sparkles Icon Block */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0d3b46] border border-[#16515f]/60 text-[#2dd4c3] shadow-[0_0_12px_rgba(45,212,195,0.15)]">
                    <Sparkles size={20} className="animate-pulse" />
                </div>

                {/* Title Text */}
                <div className="flex flex-col ml-3.5">
                    <h4 className="text-white font-semibold text-base leading-tight tracking-wide">
                        Trợ lý AI • {pond?.name || "PND-A1"}
                    </h4>
                    <span className="text-[9px] text-(--text-muted) font-bold tracking-wider mt-0.5 uppercase">
                        DỰ BÁO • 24 GIỜ TỚI
                    </span>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex p-1 bg-[#04151c]/80 border border-[#0d343f] rounded-xl mb-4 gap-1">
                <button
                    onClick={() => setActiveTab('prediction')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer flex-1 transition-all duration-200 ${activeTab === 'prediction'
                            ? 'bg-[#0d3a47] text-[#2dd4c3] border border-[#174f5e]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                            : 'text-(--text-muted) hover:text-white border border-transparent hover:bg-[#0d3a47]/30'
                        }`}
                >
                    <Sparkles size={14} />
                    <span>Dự đoán</span>
                </button>

                <button
                    onClick={() => setActiveTab('alerts')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer flex-1 transition-all duration-200 ${activeTab === 'alerts'
                            ? 'bg-[#0d3a47] text-[#2dd4c3] border border-[#174f5e]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                            : 'text-(--text-muted) hover:text-white border border-transparent hover:bg-[#0d3a47]/30'
                        }`}
                >
                    <Bell size={14} />
                    <span>Cảnh báo</span>
                    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${activeTab === 'alerts' ? 'bg-[#082a33] text-[#2dd4c3]' : 'bg-[#08232c] text-(--text-muted)'
                        }`}>
                        {alertsCount}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer flex-1 transition-all duration-200 ${activeTab === 'recommendations'
                            ? 'bg-[#0d3a47] text-[#2dd4c3] border border-[#174f5e]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                            : 'text-(--text-muted) hover:text-white border border-transparent hover:bg-[#0d3a47]/30'
                        }`}
                >
                    <Lightbulb size={14} />
                    <span>Khuyến nghị</span>
                    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold ${activeTab === 'recommendations' ? 'bg-[#082a33] text-[#2dd4c3]' : 'bg-[#08232c] text-(--text-muted)'
                        }`}>
                        {recommendationsCount}
                    </span>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'prediction' && (
                <div className="flex flex-col flex-1">
                    {/* Main Prediction */}
                    <p className="text-sm text-[var(--text-heading)] font-semibold leading-relaxed mb-4">
                        {predictionText}
                    </p>

                    {/* Trend & Risk Card */}
                    <div className="grid grid-cols-2 gap-4 bg-[#04151c]/45 border border-[#0d343f] rounded-xl p-3.5 mb-5">
                        {/* Trend */}
                        <div className="flex flex-col">
                            <span className="text-[9px] text-(--text-muted) font-bold tracking-wider mb-1.5 uppercase">
                                Xu hướng
                            </span>
                            <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                                <TrendingUp size={16} className="text-[#2dd4c3]" />
                                <span>{trendText}</span>
                            </div>
                        </div>

                        {/* Risk */}
                        <div className="flex flex-col">
                            <span className="text-[9px] text-(--text-muted) font-bold tracking-wider mb-1.5 uppercase">
                                Mức rủi ro
                            </span>
                            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border self-start ${riskText === 'Rủi ro thấp' || riskText === 'Thấp'
                                    ? 'bg-[#0d353b] text-[#2dd4c3] border-[#165161]/40'
                                    : riskText === 'Trung bình'
                                        ? 'bg-[#3b2d0d] text-[#f6b94c] border-[#615116]/40'
                                        : 'bg-[#3d0f1b] text-[#ff6678] border-[#6b1c2b]/40'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${riskText === 'Rủi ro thấp' || riskText === 'Thấp'
                                        ? 'bg-[#2dd4c3] shadow-[0_0_8px_rgba(45,212,195,0.6)]'
                                        : riskText === 'Trung bình'
                                            ? 'bg-[#f6b94c] shadow-[0_0_8px_rgba(246,185,76,0.6)]'
                                            : 'bg-[#ff6678] shadow-[0_0_8px_rgba(255,102,120,0.6)]'
                                    }`} />
                                <span>{riskText}</span>
                            </div>
                        </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="mt-auto pt-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-(--text-muted) font-semibold tracking-wider uppercase">
                                Độ tin cậy
                            </span>
                            <span className="text-xs text-[#2dd4c3] font-bold">
                                {confidenceScore}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#08232c] rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#2dd4c3] to-[#35e1d0] rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${confidenceScore}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'alerts' && (
                <div className="flex flex-col gap-3 flex-1">
                    {aiAlerts.map((alert, index) => (
                        <div
                            key={index}
                            className="flex gap-3 items-start p-3 bg-[#3d0f1b]/10 border border-[#6b1c2b]/20 rounded-xl transition-all duration-200 hover:bg-[#3d0f1b]/15"
                        >
                            <AlertTriangle size={16} className="text-[#ff6678] mt-0.5 shrink-0" />
                            <p className="text-xs text-[var(--text-body)] leading-relaxed">
                                {alert}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'recommendations' && (
                <div className="flex flex-col gap-3 flex-1">
                    {aiRecommendations.map((rec, index) => (
                        <div
                            key={index}
                            className="flex gap-3 items-start p-3 bg-[#0d353b]/10 border border-[#165161]/20 rounded-xl transition-all duration-200 hover:bg-[#0d353b]/15"
                        >
                            <Info size={16} className="text-[#2dd4c3] mt-0.5 shrink-0" />
                            <p className="text-xs text-[var(--text-body)] leading-relaxed">
                                {rec}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AIPrediction;