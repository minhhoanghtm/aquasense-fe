import { FlowingWave } from "../../../components/FlowingWave";
import { SensorCard } from "../../../components/SensorCard";
import StepProgress from "../../../components/StepProgress";
import type { Pond } from "../../../types/Pond";
import type { FeedingScheduleItem } from "../../../services/pondApi";
import { Edit3, Sliders, TestTube, Trash2 } from "lucide-react";

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
    if (!pond) {
        return (
            <div className="w-full rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-6 text-sm text-(--text-muted)">
                Chưa có ao nuôi được chọn để hiển thị.
            </div>
        );
    }

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
        : [];

    const displaySchedules = feedingSchedules.length > 0
        ? feedingSchedules.map((s) => ({
            time: s.time,
            title: s.title,
            description: s.description,
        }))
        : [];

    const currentGrowthStage = pond.growthStage;
    const pondStatusLabel = pond.status === "ACTIVE" ? "Đang nuôi" : pond.status === "HARVESTED" ? "Đã thu hoạch" : "Ao trống";

    return (
        <div className="w-full rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-6 shadow-lg flex flex-col gap-6">
            {/* Title & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) leading-none">
                        Vuông đang chọn
                    </span>
                    <h1 className="text-2xl font-bold text-(--text-heading) m-0 leading-tight">
                        {pond.name || "Ao nuôi"}
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl border border-cyan-700/50 bg-cyan-950/60 px-3 py-1.5 text-xs text-cyan-200">{pondStatusLabel}</span>

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
                {currentGrowthStage ? (
                <StepProgress
                    steps={["Thả giống", "Tôm giống", "Tôm tăng trưởng", "Thu hoạch"]}
                    currentStep={currentGrowthStage}
                />
                ) : <p className="text-sm text-(--text-muted)">Chưa có dữ liệu giai đoạn nuôi.</p>}
            </div>

            {/* Sensor Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sensorCardsData.length > 0 ? sensorCardsData.map((item: any) => (
                    <SensorCard key={item.id} label={item.label} value={item.value} unit={item.unit} />
                )) : <p className="col-span-full text-sm text-(--text-muted)">Chưa có dữ liệu cảm biến cho ao này.</p>}
            </div>

            <FlowingWave />

            {/* Meal schedule */}
            <div className="flex flex-col items-start gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                    LỊCH CHO ĂN
                </span>
                <div className="w-full">
                    {displaySchedules.length > 0 ? <StepProgress
                        orientation="vertical"
                        steps={displaySchedules}
                        currentStep={0}
                    /> : <p className="text-sm text-(--text-muted)">Chưa có lịch cho ăn cho ao này.</p>}
                </div>
            </div>
        </div>
    );
};
