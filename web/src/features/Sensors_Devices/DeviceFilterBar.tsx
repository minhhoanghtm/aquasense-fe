import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  Table,
  LayoutGrid,
} from "lucide-react";
import Dropdown, { type DropdownOption } from "../../components/Dropdown";
import { DEVICE_TYPES } from "./deviceUtils";
import type { FarmFilterOption } from "../../types/Farm";
import type { Pond } from "../../types/Pond";

export type ViewMode = "table" | "card";

export interface DeviceFilterValues {
  search: string;
  farmId: string;
  pondId: string;
  deviceType: string;
  connection: string;
  condition: string;
  sortBy: string;
}

interface DeviceFilterBarProps {
  filters: DeviceFilterValues;
  onFilterChange: (filters: DeviceFilterValues) => void;
  farms: FarmFilterOption[];
  ponds: Pond[];
  totalResults: number;
  totalDevices: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const DeviceFilterBar: React.FC<DeviceFilterBarProps> = ({
  filters,
  onFilterChange,
  farms = [],
  ponds = [],
  totalResults,
  totalDevices,
  viewMode,
  onViewModeChange,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters, onFilterChange]);

  // Keep searchInput synced if cleared from outside
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Filter ponds according to selected farm
  const filteredPonds = useMemo(() => {
    if (!filters.farmId || filters.farmId === "ALL") return ponds;
    return ponds.filter((p) => p.farmId === filters.farmId);
  }, [ponds, filters.farmId]);

  const farmOptions: DropdownOption[] = useMemo(() => {
    return [
      { label: "Tất cả trại nuôi", value: "ALL" },
      ...farms.map((f) => ({
        label: f.farmName || "Trại nuôi",
        value: f.farmId,
      })),
    ];
  }, [farms]);

  const pondOptions: DropdownOption[] = useMemo(() => {
    return [
      { label: "Tất cả ao nuôi", value: "ALL" },
      ...filteredPonds.map((p) => ({
        label: p.pondName || p.name || "Ao nuôi",
        value: p.pondId || p.id || "",
      })),
    ];
  }, [filteredPonds]);

  const connectionOptions: DropdownOption[] = [
    { label: "Tất cả kết nối", value: "ALL" },
    { label: "Trực tuyến (Online)", value: "ONLINE" },
    { label: "Ngoại tuyến (Offline)", value: "OFFLINE" },
  ];

  const conditionOptions: DropdownOption[] = [
    { label: "Tất cả tình trạng", value: "ALL" },
    { label: "Bình thường", value: "NORMAL" },
    { label: "Cảnh báo / Pin yếu", value: "WARNING" },
    { label: "Bảo trì / Báo hỏng", value: "MAINTENANCE" },
  ];

  const sortOptions: DropdownOption[] = [
    { label: "Tên thiết bị (A - Z)", value: "name_asc" },
    { label: "Tên thiết bị (Z - A)", value: "name_desc" },
    { label: "Cập nhật gần nhất", value: "updated_desc" },
    { label: "Theo trạng thái", value: "status" },
  ];

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.farmId && filters.farmId !== "ALL") count++;
    if (filters.pondId && filters.pondId !== "ALL") count++;
    if (filters.deviceType && filters.deviceType !== "ALL") count++;
    if (filters.connection && filters.connection !== "ALL") count++;
    if (filters.condition && filters.condition !== "ALL") count++;
    return count;
  }, [filters]);

  const handleClearAll = () => {
    setSearchInput("");
    onFilterChange({
      search: "",
      farmId: "ALL",
      pondId: "ALL",
      deviceType: "ALL",
      connection: "ALL",
      condition: "ALL",
      sortBy: "updated_desc",
    });
  };

  return (
    <div className="w-full flex flex-col gap-3.5 p-4 sm:p-5 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/90 backdrop-blur-md shadow-lg text-left">
      {/* Top Row: Search + Primary Filters + View Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên thiết bị, địa chỉ MAC, mã định danh..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-[var(--panel-border)] bg-[#041a23] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40 transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Controls: Toggle Advanced Filters + View Mode Toggle */}
        <div className="flex items-center gap-2.5 justify-between lg:justify-end shrink-0">
          {/* Toggle Advanced Filters Button */}
          <button
            type="button"
            onClick={() => setIsAdvancedOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
              activeFiltersCount > 0 || isAdvancedOpen
                ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300"
                : "border-[var(--panel-border)] bg-[#041a23] text-[var(--text-muted)] hover:text-white hover:border-slate-600"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-cyan-500 text-[#02131b] font-bold text-[10px]">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Segmented View Mode Toggle: [Table] [Card] */}
          <div className="flex items-center p-1 rounded-2xl border border-[var(--panel-border)] bg-[#03151d] shadow-inner">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              title="Chế độ xem dạng Bảng"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-cyan-500 text-[#041920] shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Table size={14} />
              <span className="hidden sm:inline">Bảng</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("card")}
              title="Chế độ xem dạng Thẻ"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "card"
                  ? "bg-cyan-500 text-[#041920] shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Thẻ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row: Always visible or expanded on mobile */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-[var(--divider)] ${
          isAdvancedOpen ? "block" : "hidden sm:grid"
        }`}
      >
        {/* Farm Filter */}
        <div>
          <Dropdown
            value={filters.farmId}
            options={farmOptions}
            onChange={(val) =>
              onFilterChange({
                ...filters,
                farmId: val,
                // Reset pond if farm changed
                pondId: "ALL",
              })
            }
            placeholder="Lọc theo trại nuôi"
          />
        </div>

        {/* Pond Filter */}
        <div>
          <Dropdown
            value={filters.pondId}
            options={pondOptions}
            onChange={(val) => onFilterChange({ ...filters, pondId: val })}
            placeholder="Lọc theo ao nuôi"
          />
        </div>

        {/* Device Type Filter */}
        <div>
          <Dropdown
            value={filters.deviceType}
            options={DEVICE_TYPES}
            onChange={(val) => onFilterChange({ ...filters, deviceType: val })}
            placeholder="Loại thiết bị"
          />
        </div>

        {/* Connection Status Filter */}
        <div>
          <Dropdown
            value={filters.connection}
            options={connectionOptions}
            onChange={(val) => onFilterChange({ ...filters, connection: val })}
            placeholder="Trạng thái kết nối"
          />
        </div>

        {/* Condition Filter */}
        <div>
          <Dropdown
            value={filters.condition}
            options={conditionOptions}
            onChange={(val) => onFilterChange({ ...filters, condition: val })}
            placeholder="Tình trạng cảnh báo"
          />
        </div>

        {/* Sort Dropdown */}
        <div>
          <Dropdown
            value={filters.sortBy}
            options={sortOptions}
            onChange={(val) => onFilterChange({ ...filters, sortBy: val })}
            placeholder="Sắp xếp theo"
          />
        </div>
      </div>

      {/* Filter Summary & Quick Reset */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pt-1">
        <div className="text-[var(--text-muted)] flex items-center gap-2">
          <span>
            Hiển thị <strong>{totalResults}</strong> / {totalDevices} thiết bị
          </span>
          {activeFiltersCount > 0 && (
            <span className="text-cyan-400 font-medium">
              ({activeFiltersCount} bộ lọc đang áp dụng)
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Xóa tất cả bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DeviceFilterBar;
