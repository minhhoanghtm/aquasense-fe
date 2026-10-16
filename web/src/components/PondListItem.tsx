import type { PondStatus } from "../types/Pond";

type Pond = {
    id: string;
    name: string;
    area: number;
    density: string;
    status: PondStatus;
};

type Props = {
    pond: Pond;
    isSelected?: boolean;
    onClick?: (pond: Pond) => void;
};

export default function PondListItem({ pond, isSelected, onClick }: Props) {
    return (
        <button
            type="button"
            onClick={() => onClick?.(pond)}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 
                ${isSelected ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]" : "border-cyan-800/60 hover:bg-cyan-950/40"}`}>
            {/* Tên + mũi tên */}
            <div className="flex items-center justify-between">
                <span className={`text-sm transition-colors duration-200 ${isSelected ? "font-bold text-cyan-300" : "font-semibold text-slate-200"}`}>
                    {pond.name}
                </span>

                <span className={`text-xl leading-none transition-colors duration-200 ${isSelected ? "text-cyan-400 font-bold" : "text-slate-300"}`}>
                    ›
                </span>
            </div>

            {/* Diện tích + mật độ + trạng thái */}
            <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    {pond.area} ha · {pond.density}
                </span>

                <span className="rounded-lg border border-cyan-700/50 bg-cyan-950/60 px-2 py-1 text-[11px] text-cyan-200">
                    {pond.status === "ACTIVE" ? "Đang nuôi" : pond.status === "HARVESTED" ? "Đã thu hoạch" : "Ao trống"}
                </span>
            </div>
        </button>
    );
}
