import React from "react";
import { Search, Plus, LayoutGrid, List, X } from "lucide-react";

interface FarmToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onAddNew?: () => void;
  totalFiltered: number;
}

export const FarmToolbar: React.FC<FarmToolbarProps> = ({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAddNew,
  totalFiltered,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên trại nuôi, địa chỉ..."
            className="w-full h-10 pl-9 pr-9 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition"
              title="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <span className="hidden md:inline-block text-xs text-[var(--text-muted)] whitespace-nowrap">
          Tìm thấy <strong className="text-white font-semibold">{totalFiltered}</strong> trại nuôi
        </span>
      </div>

      {/* View Switcher & Action Button */}
      <div className="flex items-center gap-2 justify-end">
        {/* Toggle Grid / Table */}
        <div className="flex items-center p-1 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)]">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              viewMode === "grid"
                ? "bg-teal-500/20 text-teal-400 font-semibold"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
            title="Dạng thẻ (Grid)"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              viewMode === "table"
                ? "bg-teal-500/20 text-teal-400 font-semibold"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
            title="Dạng bảng (Table)"
          >
            <List size={16} />
          </button>
        </div>

        {/* Add Farm Button (Chỉ Admin) */}
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] text-xs sm:text-sm font-bold hover:brightness-110 shadow-md shadow-[var(--accent)]/20 transition cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Thêm trại nuôi</span>
          </button>
        )}
      </div>
    </div>
  );
};
