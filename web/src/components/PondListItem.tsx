import { UserCheck, UserPlus, UserX } from "lucide-react";
import type { PondStatus } from "../types/Pond";
import type { AssignedFarmerInfo } from "../utils/assignmentUtils";

export type PondItemData = {
    id: string;
    name: string;
    area: number;
    density: string;
    status: PondStatus;
    assignedFarmers?: AssignedFarmerInfo[];
};

type Props = {
    pond: PondItemData;
    isSelected?: boolean;
    onClick?: (pond: PondItemData) => void;
    showAssignmentInfo?: boolean;
    onAssignFarmer?: (pondId: string) => void;
};

export default function PondListItem({
    pond,
    isSelected,
    onClick,
    showAssignmentInfo = false,
    onAssignFarmer,
}: Props) {
    const assignedFarmers = pond.assignedFarmers || [];
    const isAssigned = assignedFarmers.length > 0;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick?.(pond)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.(pond);
                }
            }}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 cursor-pointer select-none ${
                isSelected
                    ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                    : "border-cyan-800/60 hover:bg-cyan-950/40"
            }`}
        >
            {/* Tên + mũi tên */}
            <div className="flex items-center justify-between gap-2">
                <span
                    className={`text-sm transition-colors duration-200 truncate ${
                        isSelected ? "font-bold text-cyan-300" : "font-semibold text-slate-200"
                    }`}
                >
                    {pond.name}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-lg border border-cyan-700/50 bg-cyan-950/60 px-2 py-0.5 text-[11px] text-cyan-200">
                        {pond.status === "ACTIVE"
                            ? "Đang nuôi"
                            : pond.status === "HARVESTED"
                            ? "Đã thu hoạch"
                            : "Ao trống"}
                    </span>
                    <span
                        className={`text-xl leading-none transition-colors duration-200 ${
                            isSelected ? "text-cyan-400 font-bold" : "text-slate-300"
                        }`}
                    >
                        ›
                    </span>
                </div>
            </div>

            {/* Diện tích + mật độ */}
            <div className="mt-1.5 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    {pond.area} ha · {pond.density}
                </span>
            </div>

            {/* Chỉ hiển thị thông tin phân công & nút phân công cho Admin / Manager */}
            {showAssignmentInfo && (
                <div className="mt-2.5 pt-2 border-t border-cyan-900/50 flex items-center justify-between gap-2">
                    {isAssigned ? (
                        <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium truncate max-w-[200px]"
                            title={`Đã phân công Farmer: ${assignedFarmers.map((f) => f.fullName).join(", ")}`}
                        >
                            <UserCheck size={12} className="shrink-0 text-emerald-400" />
                            <span className="truncate">
                                Đã phân công: {assignedFarmers.map((f) => f.fullName).join(", ")}
                            </span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 text-[11px]">
                            <UserX size={11} className="shrink-0" />
                            <span>Chưa phân công Farmer</span>
                        </span>
                    )}

                    {onAssignFarmer && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAssignFarmer(pond.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/30 border border-teal-500/35 text-teal-300 hover:text-white text-[11px] font-semibold transition cursor-pointer shrink-0"
                            title="Phân công Nông dân (Farmer) cho vuông nuôi này"
                        >
                            <UserPlus size={11} />
                            <span>Phân công</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
