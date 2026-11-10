import { memo } from "react";
import PondListItem from "../../../components/PondListItem";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Pond as PondType } from "../../../types/Pond";
import type { User } from "../../../types/User";
import { getPondAssignedFarmers } from "../../../utils/assignmentUtils";

interface PondListProps {
    ponds?: PondType[];
    selectedId?: string;
    loading?: boolean;
    onSelect?: (id: string) => void;
    onAddNew?: () => void;
    pagination?: {
        page: number;
        totalPages: number;
        total: number;
        limit?: number;
    };
    onPageChange?: (page: number) => void;
    showAssignmentInfo?: boolean;
    staffList?: User[];
    onAssignFarmer?: (pond: PondType) => void;
}

const PondList = memo(function PondList({
    ponds = [],
    selectedId = "",
    loading = false,
    onSelect,
    onAddNew,
    pagination,
    onPageChange,
    showAssignmentInfo = false,
    staffList = [],
    onAssignFarmer,
}: PondListProps) {
    const totalArea = ponds.reduce((sum, p) => sum + (p.area || 0), 0);

    const formattedPonds = ponds
        .filter((p) => p.id || p.pondId)
        .map((p) => ({
            raw: p,
            id: p.id || p.pondId || "",
            name: p.name || p.pondName || "",
            area: p.area ?? (p.areaM2 !== undefined ? p.areaM2 / 10000 : 0),
            density: p.density || "Chưa cập nhật",
            status: (p.status === "ACTIVE" || p.status === "HARVESTED"
                ? p.status
                : "EMPTY") as "ACTIVE" | "HARVESTED" | "EMPTY",
            assignedFarmers: showAssignmentInfo
                ? getPondAssignedFarmers(p, staffList)
                : [],
        }));

    return (
        <div className="w-full rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-5 sm:p-6 shadow-lg text-left flex flex-col justify-between">
            {/* Header + List */}
            <div>
                <div className="flex flex-col items-start justify-between mb-4 gap-1">
                    <div className="flex items-center justify-between w-full">
                        <h2 className="text-lg sm:text-xl font-bold text-(--text-heading)">
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
                        {pagination
                            ? `Tổng cộng ${pagination.total} vuông · Trang này: ${ponds.length} vuông`
                            : `Trang này: ${ponds.length} vuông · tổng ${totalArea.toFixed(1)} ha`}
                    </p>
                </div>

                {/* Danh sách có scroll */}
                <div
                    className={`max-h-[400px] overflow-y-auto space-y-2.5 pr-2 custom-scrollbar transition-opacity duration-200 ${
                        loading ? "opacity-60 pointer-events-none" : "opacity-100"
                    }`}
                >
                    {formattedPonds.map((pond) => (
                        <PondListItem
                            key={pond.id}
                            pond={pond}
                            isSelected={pond.id === selectedId}
                            onClick={(p) => onSelect?.(p.id)}
                            showAssignmentInfo={showAssignmentInfo}
                            onAssignFarmer={
                                onAssignFarmer
                                    ? () => onAssignFarmer(pond.raw)
                                    : undefined
                            }
                        />
                    ))}
                </div>
            </div>

            {/* Phân trang đặt trực tiếp bên trong bảng Danh sách ao nuôi */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 pt-3.5 border-t border-(--panel-border) flex items-center justify-between gap-2 text-xs text-(--text-muted)">
                    <span className="text-[11px] text-[var(--text-subtle)]">
                        Trang <strong className="text-white font-semibold">{pagination.page}</strong> / {pagination.totalPages}
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={pagination.page <= 1}
                            onClick={() => onPageChange?.(pagination.page - 1)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-(--panel-border) bg-(--panel-bg-dark) text-xs text-(--text-primary) hover:border-teal-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Trang trước"
                        >
                            <ChevronLeft size={13} />
                            <span>Trước</span>
                        </button>

                        <button
                            type="button"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => onPageChange?.(pagination.page + 1)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-(--panel-border) bg-(--panel-bg-dark) text-xs text-(--text-primary) hover:border-teal-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="Trang sau"
                        >
                            <span>Sau</span>
                            <ChevronRight size={13} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default PondList;
