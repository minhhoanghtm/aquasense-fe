import React from "react";
import { Search, LayoutGrid, List, UserPlus, RotateCcw } from "lucide-react";
import Dropdown, { type DropdownOption } from "../../../components/Dropdown";
import type { Pond } from "../../../types/Pond";

interface StaffToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  pondFilter: string;
  onPondFilterChange: (value: string) => void;
  onResetFilters?: () => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onAddNew?: () => void;
  ponds: Pond[];
  totalStaff: number;
  filteredCount: number;
}

const roleOptions: DropdownOption[] = [
  { label: "Tất cả vai trò", value: "ALL" },
  { label: "Quản lý", value: "MANAGER" },
  { label: "Nông dân", value: "FARMER" },
];

const statusOptions: DropdownOption[] = [
  { label: "Tất cả trạng thái", value: "ALL" },
  { label: "Hoạt động", value: "ACTIVE" },
  { label: "Không hoạt động", value: "INACTIVE" }
];

export const StaffToolbar: React.FC<StaffToolbarProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  pondFilter,
  onPondFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  onAddNew,
  ponds,
  totalStaff,
  filteredCount,
}) => {
  const pondOptions: DropdownOption[] = [
    { label: "Tất cả vuông nuôi", value: "ALL" },
    ...ponds.map((p) => ({
      label: p.name,
      value: p.id,
    })),
  ];

  const hasActiveFilters = Boolean(
    searchTerm.trim() !== "" ||
    roleFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    pondFilter !== "ALL"
  );

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      onSearchChange("");
      onRoleFilterChange("ALL");
      onStatusFilterChange("ALL");
      onPondFilterChange("ALL");
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full relative z-30">
      {/* Top row: Title + Action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-heading)]">
            Danh sách nhân sự
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Hiển thị <span className="text-[var(--accent)] font-semibold">{filteredCount}</span> trên tổng số {totalStaff} nhân viên
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* View toggle */}
          <div className="flex items-center bg-[#07242d] border border-[var(--panel-border)] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${viewMode === "grid"
                  ? "bg-[var(--accent)] text-[#041920] font-bold shadow"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              title="Dạng lưới thẻ"
            >
              <LayoutGrid size={15} />
              <span className="hidden md:inline">Lưới</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${viewMode === "table"
                  ? "bg-[var(--accent)] text-[#041920] font-bold shadow"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              title="Dạng danh sách bảng"
            >
              <List size={15} />
              <span className="hidden md:inline">Bảng</span>
            </button>
          </div>

          {/* Add Staff Button */}
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2dd4c3] to-[#159d96] text-[#041920] text-xs sm:text-sm font-bold hover:brightness-110 shadow-lg shadow-[#2dd4c3]/20 transition cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Thêm nhân viên</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Controls bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3 items-center rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3 shadow-md relative z-30">
        {/* Search input */}
        <div className="lg:col-span-3 flex h-[46px] items-center gap-2 rounded-lg border border-cyan-800 bg-[#07252f] px-3 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40">
          <Search size={15} className="shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT..."
            className="w-full bg-transparent text-xs sm:text-sm text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 focus:border-none focus:bg-transparent shadow-none placeholder:text-[var(--text-muted)]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-xs text-[var(--text-muted)] hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter by Role */}
        <div className="lg:col-span-3 sm:col-span-1 relative z-30">
          <Dropdown
            value={roleFilter}
            options={roleOptions}
            onChange={onRoleFilterChange}
            placeholder="Lọc theo vai trò"
          />
        </div>

        {/* Filter by Status */}
        <div className="lg:col-span-2 sm:col-span-1 relative z-30">
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            onChange={onStatusFilterChange}
            placeholder="Trạng thái"
          />
        </div>

        {/* Filter by Pond */}
        <div className="lg:col-span-2 sm:col-span-1 relative z-30">
          <Dropdown
            value={pondFilter}
            options={pondOptions}
            onChange={onPondFilterChange}
            placeholder="Vuông phụ trách"
          />
        </div>

        {/* Reset Filters Button */}
        <div className="lg:col-span-2 sm:col-span-1 relative z-30">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className={`flex h-[46px] w-full items-center justify-center gap-1.5 rounded-lg border px-3 text-xs sm:text-sm font-medium transition cursor-pointer ${hasActiveFilters
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/60 shadow-sm"
                : "border-cyan-800/40 bg-[#0b3039]/40 text-[var(--text-muted)] opacity-50 cursor-not-allowed"
              }`}
            title={hasActiveFilters ? "Xóa tất cả bộ lọc hiện tại" : "Không có bộ lọc nào đang được áp dụng"}
          >
            <RotateCcw size={14} className="shrink-0" />
            <span className="whitespace-nowrap">Xóa lọc</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffToolbar;

