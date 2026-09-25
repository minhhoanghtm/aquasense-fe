import { FlowingWave } from "../../../components/FlowingWave";
import PondStatus from "../../../components/PondStatus";
import { SensorCard } from "../../../components/SensorCard";
import StepProgress from "../../../components/StepProgress";
import type { Pond } from "../../../types/Pond";
import type { FeedingScheduleItem } from "../../../services/pondApi";
import { Edit3, Sliders, TestTube, Trash2 } from "lucide-react";

const defaultSensorData = [
    { id: "1", label: "Nhiệt độ", value: 29.4, unit: "°C" },
    { id: "2", label: "Độ pH", value: 7.8, unit: "pH" },
    { id: "3", label: "Độ mặn", value: 15.2, unit: "ppt" },
    { id: "4", label: "Oxy hòa tan", value: 5.4, unit: "mg/L" },
    { id: "5", label: "Độ đục", value: 24, unit: "NTU" },
    { id: "6", label: "Mực nước", value: 1.22, unit: "m" },
];

const defaultFeedingSchedule = [
    {
        time: "10:30",
        title: "Cho ăn buổi sáng · 42 kg",
        description: "Máy cho ăn tự động · đã hoàn thành",
    },
    {
        time: "16:00",
        title: "Cho ăn buổi chiều · 38 kg",
        description: "Đã lên lịch · cỡ hạt 2.0 mm",
    },
    {
        time: "21:30",
        title: "Cho ăn buổi tối · 35 kg",
        description: "Đã lên lịch · điều chỉnh theo sinh khối",
    },
];

interface PondInfoProps {
    pond?: Pond | null;
    sensorReadings?: any[];
    feedingSchedules?: FeedingScheduleItem[];
    onEditPond?: (pond: Pond) => void;
    onOpenThresholds?: (pond: Pond) => void;
    onOpenManualLogs?: (pond: Pond) => void;
    onDeletePond?: (pond: Pond) => void;
}

export const PondInfo = ({
    pond,
    sensorReadings = [],
    feedingSchedules = [],
    onEditPond,
    onOpenThresholds,
    onOpenManualLogs,
    onDeletePond,
}: PondInfoProps) => {
    // Extract sensor data from latest reading
    const latestReading = sensorReadings && sensorReadings.length > 0
        ? sensorReadings[sensorReadings.length - 1]
        : null;

    const sensorCardsData = latestReading?.metrics && latestReading.metrics.length > 0
        ? latestReading.metrics.map((m: any, idx: number) => ({
            id: String(idx + 1),
            label: m.name === "temperature" ? "Nhiệt độ" : m.name === "pH" ? "Độ pH" : m.name === "dissolvedOxygen" ? "Oxy hòa tan" : m.name === "salinity" ? "Độ mặn" : m.name === "turbidity" ? "Độ đục" : m.name === "waterLevel" ? "Mực nước" : m.name,
            value: m.value,
            unit: m.unit || "",
        }))
        : defaultSensorData;

    const displaySchedules = feedingSchedules.length > 0
        ? feedingSchedules.map((s) => ({
            time: s.time,
            title: s.title,
            description: s.description,
        }))
        : defaultFeedingSchedule;

    const currentGrowthStage = pond?.growthStage || "Tôm tăng trưởng";
    const pondStatus = (pond?.status?.toUpperCase() === "DANGER"
        ? "DANGER"
        : pond?.status?.toUpperCase() === "WARNING"
        ? "WARNING"
        : "NORMAL") as "NORMAL" | "WARNING" | "DANGER";

    return (
        <div className="w-full rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-6 shadow-lg flex flex-col gap-6">
            {/* Title & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) leading-none">
                        Vuông đang chọn · {pond?.id || "PND-A1"}
                    </span>
                    <h1 className="text-2xl font-bold text-(--text-heading) m-0 leading-tight">
                        {pond?.name || "Vuông A1 - Cà Mau"}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <PondStatus status={pondStatus} />

                    {pond && onOpenThresholds && (
                        <button
                            type="button"
                            onClick={() => onOpenThresholds(pond)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-800 bg-[#07242e] text-cyan-300 hover:bg-cyan-900/50 hover:text-white text-xs font-semibold transition cursor-pointer"
                            title="Cấu hình ngưỡng cảnh báo"
                        >
                            <Sliders size={13} />
                            <span>Ngưỡng</span>
                        </button>
                    )}

                    {pond && onOpenManualLogs && (
                        <button
                            type="button"
                            onClick={() => onOpenManualLogs(pond)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-800/80 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 hover:text-amber-200 text-xs font-semibold transition cursor-pointer"
                            title="Ghi nhận nhật ký đo khí độc thủ công"
                        >
                            <TestTube size={13} />
                            <span>Đo tay</span>
                        </button>
                    )}

                    {pond && onEditPond && (
                        <button
                            type="button"
                            onClick={() => onEditPond(pond)}
                            className="p-1.5 rounded-xl border border-cyan-800 bg-[#07242e] text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition cursor-pointer"
                            title="Chỉnh sửa thông số ao"
                        >
                            <Edit3 size={14} />
                        </button>
                    )}

                    {pond && onDeletePond && (
                        <button
                            type="button"
                            onClick={() => onDeletePond(pond)}
                            className="p-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 hover:text-rose-200 transition cursor-pointer"
                            title="Xóa ao nuôi"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Growth Stage Progress */}
            <div>
                <StepProgress
                    steps={["Thả giống", "Tôm giống", "Tôm tăng trưởng", "Thu hoạch"]}
                    currentStep={currentGrowthStage}
                />
            </div>

            {/* Sensor Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sensorCardsData.map((item: any) => (
                    <SensorCard key={item.id} label={item.label} value={item.value} unit={item.unit} />
                ))}
            </div>

            <FlowingWave />

            {/* Meal schedule */}
            <div className="flex flex-col items-start gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                    LỊCH CHO ĂN
                </span>
                <div className="w-full">
                    <StepProgress 
                        orientation="vertical"
                        steps={displaySchedules}
                        currentStep={0}
                    />
                </div>
            </div>
        </div>
    );
};
