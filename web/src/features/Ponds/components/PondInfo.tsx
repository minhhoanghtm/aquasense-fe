import { memo } from "react";
import { FlowingWave } from "../../../components/FlowingWave";
import { SensorCard } from "../../../components/SensorCard";
import StepProgress from "../../../components/StepProgress";
import type { Pond } from "../../../types/Pond";
import type { User } from "../../../types/User";
import type { FeedingScheduleItem } from "../../../services/pondApi";
import {
    Edit3,
    Sliders,
    TestTube,
    Trash2,
    Clock,
    UserPlus,
    UserCheck,
    UserX,
} from "lucide-react";
import { formatVietnamDateTime } from "../../../utils/date";
import { getPondAssignedFarmers } from "../../../utils/assignmentUtils";

interface PondInfoProps {
    pond?: Pond | null;
    sensorReadings?: any[];
    feedingSchedules?: FeedingScheduleItem[];
    loadingSensors?: boolean;
    onEditPond?: (pond: Pond) => void;
    onOpenThresholds?: (pond: Pond) => void;
    onOpenManualLogs?: (pond: Pond) => void;
    onDeletePond?: (pond: Pond) => void;
    showAssignmentInfo?: boolean;
    staffList?: User[];
    onAssignFarmer?: (pond: Pond) => void;
}

export const PondInfo = memo(({
    pond,
    sensorReadings = [],
    feedingSchedules = [],
    loadingSensors = false,
    onEditPond,
    onOpenThresholds,
    onOpenManualLogs,
    onDeletePond,
    showAssignmentInfo = false,
    staffList = [],
    onAssignFarmer,
}: PondInfoProps) => {
    if (!pond) {
        return (
            <div className="w-full dashboard-card p-6 text-sm text-[var(--text-muted)] text-center">
                Chưa có vuông nuôi được chọn để hiển thị.
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
    const assignedFarmers = showAssignmentInfo ? getPondAssignedFarmers(pond, staffList) : [];

    return (
        <div className="w-full dashboard-card p-6 shadow-md flex flex-col gap-6">
            {/* Title & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] leading-none">
                        Vuông đang chọn
                    </span>
                    <h1 className="text-2xl font-bold text-[var(--text-heading)] m-0 leading-tight">
                        {pond.name || pond.pondName || "Ao nuôi"}
                    </h1>

                    {/* Thông tin phân công Farmer - Chỉ hiển thị cho Admin / Manager */}
                    {showAssignmentInfo && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {assignedFarmers.length > 0 ? (
                                <>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                                        <UserCheck size={13} className="text-emerald-400" />
                                        <span>Đã phân công Farmer:</span>
                                    </span>
                                    {assignedFarmers.map((f) => (
                                        <span
                                            key={f.userId}
                                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-cyan-950/80 border border-cyan-700/50 text-cyan-200"
                                            title={f.phoneNumber ? `${f.fullName} · ${f.phoneNumber}` : f.fullName}
                                        >
                                            <span>{f.fullName}</span>
                                        </span>
                                    ))}
                                </>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800/60 border border-slate-700/60 px-2.5 py-0.5 rounded-lg">
                                    <UserX size={13} className="text-slate-400" />
                                    <span>Chưa phân công Farmer phụ trách</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl border border-cyan-700/50 bg-cyan-950/60 px-3 py-1.5 text-xs text-cyan-200">{pondStatusLabel}</span>

                    {/* Nút phân công Farmer ngay tại vuông đang chọn (Chỉ dành cho Admin / Manager) */}
                    {showAssignmentInfo && pond && onAssignFarmer && (
                        <button
                            type="button"
                            onClick={() => onAssignFarmer(pond)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/40 bg-teal-500/15 text-teal-200 hover:bg-teal-500/30 hover:text-white text-xs font-semibold transition cursor-pointer"
                            title="Phân công Nông dân (Farmer) phụ trách vuông nuôi này"
                        >
                            <UserPlus size={13} />
                            <span>Phân công Farmer</span>
                        </button>
                    )}

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

            {/* Sensor Cards Section */}
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        THÔNG SỐ MÔI TRƯỜNG NƯỚC
                    </span>
                    {latestReading?.timestamp && (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-300/80">
                            <Clock size={11} />
                            Đo lúc: {formatVietnamDateTime(latestReading.timestamp)}
                        </span>
                    )}
                </div>

                <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-opacity duration-200 ${loadingSensors ? "opacity-60" : "opacity-100"}`}>
                    {sensorCardsData.length > 0 ? (
                        sensorCardsData.map((item: any) => (
                            <SensorCard key={item.id} label={item.label} value={item.value} unit={item.unit} />
                        ))
                    ) : loadingSensors ? (
                        [1, 2, 3, 4, 5, 6].map((idx) => (
                            <div key={idx} className="flex flex-col justify-between rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 animate-pulse">
                                <div className="h-3 w-16 bg-white/10 rounded mb-2" />
                                <div className="h-7 w-20 bg-white/10 rounded" />
                            </div>
                        ))
                    ) : (
                        <p className="col-span-full text-sm text-(--text-muted)">Chưa có dữ liệu cảm biến cho ao này.</p>
                    )}
                </div>
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
});
PondInfo.displayName = "PondInfo";
