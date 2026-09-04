import React from "react";

export interface StepItem {
    id?: string | number;
    title?: string;
    label?: string; // Tên hiển thị (tương thích cả title hoặc label)
    time?: string; // Thời gian (cho timeline lịch trình)
    description?: string; // Mô tả chi tiết (ví dụ: máy cho ăn tự động · đã hoàn thành)
    subtitle?: string;
    status?: "completed" | "current" | "upcoming" | "error";
    icon?: React.ReactNode;
}

export type StepProgressProps = {
    steps: (string | StepItem)[];
    currentStep?: number | string;
    orientation?: "horizontal" | "vertical";
    className?: string;
    size?: "sm" | "md" | "lg";
    onStepClick?: (step: StepItem | string, index: number) => void;
};

export const StepProgress: React.FC<StepProgressProps> = ({
    steps,
    currentStep,
    orientation = "horizontal",
    className = "",
    size = "md",
    onStepClick,
}) => {
    // Chuẩn hóa danh sách steps thành object StepItem
    const normalizedSteps: StepItem[] = steps.map((step) => {
        if (typeof step === "string") {
            return { label: step, title: step };
        }
        return {
            ...step,
            label: step.label || step.title || "",
            title: step.title || step.label || "",
        };
    });

    // Xác định index hiện tại
    const activeIndex = (() => {
        if (currentStep === undefined) return 0;
        if (typeof currentStep === "number") return currentStep;
        const idx = normalizedSteps.findIndex(
            (s) => s.label === currentStep || s.title === currentStep || s.id === currentStep
        );
        return idx !== -1 ? idx : 0;
    })();

    const isVertical = orientation === "vertical";

    // Kích thước node
    const nodeSizes = {
        sm: "h-3.5 w-3.5",
        md: "h-4.5 w-4.5",
        lg: "h-6 w-6",
    };

    // ==========================================
    // 1. VERTICAL TIMELINE / LỊCH TRÌNH
    // ==========================================
    if (isVertical) {
        return (
            <div className={`relative flex flex-col ${className}`}>
                {normalizedSteps.map((step, index) => {
                    const isCompleted = index < activeIndex;
                    const isCurrent = index === activeIndex;
                    const isPassed = index <= activeIndex;
                    const isLast = index === normalizedSteps.length - 1;

                    return (
                        <div
                            key={step.id ?? index}
                            className={`group relative flex items-start gap-4 pb-6 last:pb-0 ${
                                onStepClick ? "cursor-pointer" : ""
                            }`}
                            onClick={() => onStepClick && onStepClick(steps[index], index)}
                        >
                            {/* Trục bên trái: Nút và Đường nối */}
                            <div className="relative flex flex-col items-center flex-shrink-0">
                                {/* Nút tròn (Node) */}
                                <div
                                    className={`relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                        nodeSizes[size]
                                    } ${
                                        isCurrent
                                            ? "border-cyan-400 bg-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                                            : isCompleted
                                            ? "border-cyan-500 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                                            : "border-slate-600 bg-[#0c242c]"
                                    }`}
                                >
                                    {step.icon ? (
                                        <span className="text-xs">{step.icon}</span>
                                    ) : (
                                        isCurrent && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-ping" />
                                        )
                                    )}
                                </div>

                                {/* Đường kẻ dọc nối sang bước tiếp theo */}
                                {!isLast && (
                                    <div
                                        className={`absolute top-[18px] bottom-0 w-[2px] -mb-2 transition-colors duration-300 ${
                                            isPassed ? "bg-cyan-500/80" : "bg-slate-700/60"
                                        }`}
                                    />
                                )}
                            </div>

                            {/* Cột thời gian (nếu có) */}
                            {step.time && (
                                <div className="w-14 flex-shrink-0 pt-0.5">
                                    <span
                                        className={`text-xs font-semibold tracking-wide font-mono transition-colors duration-300 ${
                                            isPassed ? "text-cyan-400" : "text-slate-400"
                                        }`}
                                    >
                                        {step.time}
                                    </span>
                                </div>
                            )}

                            {/* Cột nội dung: Title / Description */}
                            <div className="flex flex-col flex-grow pt-0">
                                {step.title && (
                                    <span
                                        className={`text-sm font-semibold leading-tight transition-colors duration-300 ${
                                            isCurrent
                                                ? "text-white"
                                                : isCompleted
                                                ? "text-slate-100"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                )}

                                {(step.description || step.subtitle) && (
                                    <span className="mt-1 text-xs text-slate-400 leading-relaxed">
                                        {step.description || step.subtitle}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ==========================================
    // 2. HORIZONTAL STEP PROGRESS (GIAI ĐOẠN / QUY TRÌNH)
    // ==========================================
    const totalSteps = normalizedSteps.length;
    const progressPercent = totalSteps > 1 ? (activeIndex / (totalSteps - 1)) * 100 : 0;

    return (
        <div className={`w-full py-4 ${className}`}>
            <div className="relative flex items-start justify-between">
                {/* Đường nối thanh tiến trình */}
                <div className="absolute top-[8px] left-[12px] right-[12px] h-[2px] z-0">
                    {/* Đường nền mờ */}
                    <div className="w-full h-full bg-slate-700/70 rounded-full" />
                    {/* Đường tiến trình sáng */}
                    <div
                        className="absolute left-0 top-0 h-full bg-cyan-400 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Các bước tròn */}
                {normalizedSteps.map((step, index) => {
                    const isPassed = index <= activeIndex;

                    return (
                        <div
                            key={step.id ?? index}
                            className={`relative z-10 flex flex-col items-center group ${
                                onStepClick ? "cursor-pointer" : ""
                            }`}
                            style={{ flex: 1 }}
                            onClick={() => onStepClick && onStepClick(steps[index], index)}
                        >
                            {/* Nút tròn */}
                            <div
                                className={`rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                                    nodeSizes[size]
                                } ${
                                    isPassed
                                        ? "border-cyan-400 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                                        : "border-slate-500 bg-[#0c242c]"
                                }`}
                            >
                                {step.icon ? (
                                    <span className="text-[10px] text-slate-900 font-bold">{step.icon}</span>
                                ) : null}
                            </div>

                            {/* Nhãn bước */}
                            <span
                                className={`mt-3 text-xs md:text-sm font-medium text-center transition-colors duration-300 leading-tight px-1 ${
                                    isPassed ? "text-slate-100 font-semibold" : "text-slate-400"
                                }`}
                            >
                                {step.label || step.title}
                            </span>

                            {/* Mô tả phụ (nếu có) */}
                            {step.subtitle && (
                                <span className="mt-0.5 text-[10px] text-slate-400 text-center">
                                    {step.subtitle}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepProgress;