import { FlowingWave } from "../../../components/FlowingWave";
import PondStatus from "../../../components/PondStatus";
import { SensorCard } from "../../../components/SensorCard";
import StepProgress from "../../../components/StepProgress";
const data = [
    { id: 1, label: "Nhiệt độ", value: 29, unit: "°C" },
    { id: 2, label: "Độ pH", value: 7.5, unit: "pH" },
    { id: 3, label: "Độ mặn", value: 30, unit: "‰" },
    { id: 4, label: "Độ kiềm", value: 120, unit: "mg/L" },
    { id: 5, label: "Oxy hòa tan", value: 5, unit: "mg/L" },
    { id: 6, label: "Độ đục", value: 25, unit: "NTU" },
]
const feedingSchedule = [
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

export const PondInfo = () => {
    return (
        <div className="w-full rounded-3xl border border-(--panel-border) bg-(--bg-primary) p-6 shadow-lg flex flex-col gap-6">
            {/* Title & Status */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) leading-none">
                        Vuông đang chọn · PND-A1
                    </span>
                    <h1 className="text-2xl font-bold text-(--text-heading) m-0 leading-tight">
                        Vuông A1 - Cà Mau
                    </h1>
                </div>

                <PondStatus status="NORMAL" />
            </div>

            {/* Growth Stage Progress */}
            <div>
                <StepProgress
                    steps={["Thả giống", "Tôm giống", "Tôm tăng trưởng", "Thu hoạch"]}
                    currentStep="Tôm tăng trưởng"
                />
            </div>

            {/* Sensor Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
                {data.map((item) => (
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
                        steps={feedingSchedule}
                        currentStep={0}
                    />
                </div>
            </div>
        </div>
    );
};