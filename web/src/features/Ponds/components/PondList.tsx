import PondListItem from "../../../components/PondListItem";
import { Plus } from "lucide-react";
import type { Pond as PondType } from "../../../types/Pond";

interface PondListProps {
    ponds?: PondType[];
    selectedId?: string;
    onSelect?: (id: string) => void;
    onAddNew?: () => void;
}

export default function PondList({
    ponds = [],
    selectedId = "",
    onSelect,
    onAddNew,
}: PondListProps) {
    const totalArea = ponds.reduce((sum, p) => sum + (p.area || 0), 0);

    const formattedPonds = ponds.map((p) => ({
        id: p.id,
        name: p.name,
        area: p.area,
        density: p.density || "180 PL/m²",
        status: (p.status?.toUpperCase() === "DANGER"
            ? "DANGER"
            : p.status?.toUpperCase() === "WARNING"
            ? "WARNING"
            : "NORMAL") as "NORMAL" | "WARNING" | "DANGER",
    }));

    return (
        <div className="w-full rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-6 shadow-lg text-left">
            {/* Header */}
            <div className="flex flex-col items-start justify-between mb-4 gap-1">
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-xl font-bold text-(--text-heading)">
                        Danh sách vuông nuôi
                    </h2>

                    {onAddNew && (
                        <button
                            type="button"
                            onClick={onAddNew}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2dd4c3] to-[#159d96] text-[#041920] text-xs font-bold hover:brightness-110 shadow-md shadow-[#2dd4c3]/15 transition cursor-pointer"
                        >
                            <Plus size={14} />
                            <span>Thêm vuông</span>
                        </button>
                    )}
                </div>

                <p className="text-xs text-(--text-muted) font-light">
                    {ponds.length} vuông hoạt động · tổng {totalArea.toFixed(1)} ha
                </p>
            </div>

            {/* Danh sách có scroll */}
            <div className="max-h-[337px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {formattedPonds.map((pond) => (
                    <PondListItem
                        key={pond.id}
                        pond={pond}
                        isSelected={pond.id === selectedId}
                        onClick={(p) => onSelect?.(p.id)}
                    />
                ))}
            </div>
        </div>
    );
}