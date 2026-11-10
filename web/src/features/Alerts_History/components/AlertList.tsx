import React, { useState, useMemo, useEffect } from "react";
import AlertItem, { type AlertLevel, type AlertStatus } from "../../../components/AlertItem";
import Dropdown, { type DropdownOption } from "../../../components/Dropdown";
import {
  Calendar,
  Search,
  FileSpreadsheet,
  RotateCcw,
  X,
  Droplet,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { exportAlertsToExcel } from "../../../utils/exportAlertsExcel";

export interface AlertData {
  id: string;
  time: string;
  createdAt?: string;
  title: string;
  pondId?: string;
  pondName: string;
  value: number | string;
  unit?: string;
  level: AlertLevel;
  status: AlertStatus;
  message?: string;
  metricName?: string;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
}

export type FilterType = "ALL" | "DANGER" | "WARNING" | "RESOLVED";
export type DatePresetType = "ALL" | "TODAY" | "7DAYS" | "30DAYS" | "CUSTOM";

interface FilterTab {
  id: FilterType;
  label: string;
}

const FILTER_TABS: FilterTab[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "DANGER", label: "Nguy hiểm" },
  { id: "WARNING", label: "Cảnh báo" },
  { id: "RESOLVED", label: "Đã xử lý" },
];

export interface PondOption {
  id: string;
  name: string;
}

interface AlertListProps {
  alerts?: AlertData[];
  ponds?: PondOption[];
  onAlertClick?: (alert: AlertData) => void;
  onExportSuccess?: (message: string) => void;
  className?: string;
}

const getAlertDate = (item: AlertData): Date | null => {
  if (item.createdAt) {
    const d = new Date(item.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (item.time) {
    const match = item.time.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      return new Date(year, month, day);
    }
    const d = new Date(item.time);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const AlertList: React.FC<AlertListProps> = ({
  alerts = [],
  ponds = [],
  onAlertClick,
  onExportSuccess,
  className = "",
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [selectedPond, setSelectedPond] = useState<string>("ALL");
  const [datePreset, setDatePreset] = useState<DatePresetType>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const safeAlerts = useMemo(() => (Array.isArray(alerts) ? alerts : []), [alerts]);

  // Bộ lọc tổng hợp
  const filteredAlerts = useMemo(() => {
    return safeAlerts.filter((item) => {
      // 1. Lọc theo Tab trạng thái / mức độ
      if (activeFilter === "DANGER") {
        const lvl = String(item.level).toUpperCase();
        if (lvl !== "DANGER" && lvl !== "CRITICAL") return false;
      } else if (activeFilter === "WARNING") {
        if (item.level !== "WARNING") return false;
      } else if (activeFilter === "RESOLVED") {
        const isResolved =
          item.status === "RESOLVED" ||
          item.status === "Đã xử lý" ||
          String(item.status).toUpperCase() === "RESOLVED";
        if (!isResolved) return false;
      }

      // 2. Lọc theo ao nuôi
      if (selectedPond !== "ALL") {
        const matchesId = item.pondId && item.pondId === selectedPond;
        const matchesName =
          item.pondName &&
          item.pondName.trim().toLowerCase() === selectedPond.trim().toLowerCase();
        if (!matchesId && !matchesName) return false;
      }

      // 3. Lọc theo từ khóa tìm kiếm
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inPond = item.pondName?.toLowerCase().includes(q);
        const inMetric = item.metricName?.toLowerCase().includes(q);
        const inMessage = item.message?.toLowerCase().includes(q);
        const inValue = String(item.value).toLowerCase().includes(q);
        if (!inTitle && !inPond && !inMetric && !inMessage && !inValue) return false;
      }

      // 4. Lọc theo ngày
      if (datePreset !== "ALL") {
        const d = getAlertDate(item);
        if (!d) return true; // Nếu không có ngày, giữ lại để không bị sót

        const now = new Date();

        if (datePreset === "TODAY") {
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          if (d < todayStart || d > todayEnd) return false;
        } else if (datePreset === "7DAYS") {
          const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          past7.setHours(0, 0, 0, 0);
          if (d < past7) return false;
        } else if (datePreset === "30DAYS") {
          const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          past30.setHours(0, 0, 0, 0);
          if (d < past30) return false;
        } else if (datePreset === "CUSTOM") {
          if (startDate) {
            const s = new Date(startDate);
            s.setHours(0, 0, 0, 0);
            if (d < s) return false;
          }
          if (endDate) {
            const e = new Date(endDate);
            e.setHours(23, 59, 59, 999);
            if (d > e) return false;
          }
        }
      }

      return true;
    });
  }, [safeAlerts, activeFilter, selectedPond, searchKeyword, datePreset, startDate, endDate]);

  // Đếm số lượng theo từng tab (dựa trên các bộ lọc phụ: ao + ngày + search)
  const tabCounts = useMemo(() => {
    const baseList = safeAlerts.filter((item) => {
      if (selectedPond !== "ALL") {
        const matchesId = item.pondId && item.pondId === selectedPond;
        const matchesName =
          item.pondName &&
          item.pondName.trim().toLowerCase() === selectedPond.trim().toLowerCase();
        if (!matchesId && !matchesName) return false;
      }
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inPond = item.pondName?.toLowerCase().includes(q);
        const inMetric = item.metricName?.toLowerCase().includes(q);
        const inMessage = item.message?.toLowerCase().includes(q);
        if (!inTitle && !inPond && !inMetric && !inMessage) return false;
      }
      if (datePreset !== "ALL") {
        const d = getAlertDate(item);
        if (!d) return true;
        const now = new Date();
        if (datePreset === "TODAY") {
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          if (d < todayStart || d > todayEnd) return false;
        } else if (datePreset === "7DAYS") {
          const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          past7.setHours(0, 0, 0, 0);
          if (d < past7) return false;
        } else if (datePreset === "30DAYS") {
          const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          past30.setHours(0, 0, 0, 0);
          if (d < past30) return false;
        } else if (datePreset === "CUSTOM") {
          if (startDate) {
            const s = new Date(startDate);
            s.setHours(0, 0, 0, 0);
            if (d < s) return false;
          }
          if (endDate) {
            const e = new Date(endDate);
            e.setHours(23, 59, 59, 999);
            if (d > e) return false;
          }
        }
      }
      return true;
    });

    return {
      ALL: baseList.length,
      DANGER: baseList.filter((a) => {
        const lvl = String(a.level).toUpperCase();
        return lvl === "DANGER" || lvl === "CRITICAL";
      }).length,
      WARNING: baseList.filter((a) => a.level === "WARNING").length,
      RESOLVED: baseList.filter(
        (a) =>
          a.status === "RESOLVED" ||
          a.status === "Đã xử lý" ||
          String(a.status).toUpperCase() === "RESOLVED"
      ).length,
    };
  }, [safeAlerts, selectedPond, searchKeyword, datePreset, startDate, endDate]);

  const pondOptions: DropdownOption[] = useMemo(
    () => [
      { label: `Tất cả ao nuôi (${ponds.length || "0"})`, value: "ALL" },
      ...ponds.map((p) => ({
        label: p.name || "",
        value: p.id || "",
      })),
    ],
    [ponds]
  );

  const datePresetOptions: DropdownOption[] = useMemo(
    () => [
      { label: "Tất cả thời gian", value: "ALL" },
      { label: "Hôm nay", value: "TODAY" },
      { label: "7 ngày qua", value: "7DAYS" },
      { label: "30 ngày qua", value: "30DAYS" },
      { label: "Khoảng ngày tùy chọn...", value: "CUSTOM" },
    ],
    []
  );

  const hasActiveFilter =
    selectedPond !== "ALL" ||
    datePreset !== "ALL" ||
    startDate !== "" ||
    endDate !== "" ||
    searchKeyword.trim() !== "" ||
    activeFilter !== "ALL";

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));

  // Reset về trang 1 khi thay đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, selectedPond, datePreset, startDate, endDate, searchKeyword]);

  // Đảm bảo currentPage không vượt quá totalPages khi filteredAlerts thay đổi
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Cắt danh sách cảnh báo theo trang (10 mục/trang)
  const paginatedAlerts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(startIndex, startIndex + pageSize);
  }, [filteredAlerts, currentPage, pageSize]);

  // Tạo danh sách số trang hiển thị thông minh
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  const handleResetFilters = () => {
    setActiveFilter("ALL");
    setSelectedPond("ALL");
    setDatePreset("ALL");
    setStartDate("");
    setEndDate("");
    setSearchKeyword("");
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    const selectedPondObj = ponds.find(
      (p) => p.id === selectedPond || p.name === selectedPond
    );
    const pondDisplay =
      selectedPond === "ALL"
        ? "Tất cả ao nuôi"
        : selectedPondObj?.name || selectedPond;

    let dateText = "Tất cả thời gian";
    if (datePreset === "TODAY") dateText = "Hôm nay";
    else if (datePreset === "7DAYS") dateText = "7 ngày qua";
    else if (datePreset === "30DAYS") dateText = "30 ngày qua";
    else if (datePreset === "CUSTOM") {
      if (startDate && endDate) dateText = `Từ ${startDate} đến ${endDate}`;
      else if (startDate) dateText = `Từ ${startDate}`;
      else if (endDate) dateText = `Đến ${endDate}`;
    }

    const tabLabel =
      FILTER_TABS.find((t) => t.id === activeFilter)?.label || "Tất cả";

    exportAlertsToExcel(filteredAlerts, {
      pondName: pondDisplay,
      datePreset: dateText,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      levelOrStatus: tabLabel,
      searchKeyword: searchKeyword.trim() || undefined,
    });

    if (onExportSuccess) {
      onExportSuccess(
        `Đã xuất thành công ${filteredAlerts.length} cảnh báo ra file Excel!`
      );
    }
  };

  return (
    <div
      className={`dashboard-card p-4 sm:p-5 flex flex-col gap-3.5 text-left shadow-md ${className}`}
    >
      {/* Header + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[var(--divider)]">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[var(--text-heading)] m-0">
            Danh sách cảnh báo & Sự cố
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Theo dõi chi tiết các ngưỡng vi phạm và sự cố chất lượng nước
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              title="Đặt lại toàn bộ bộ lọc"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-white hover:border-[var(--panel-border-strong)] transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Đặt lại</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportExcel}
            title="Xuất danh sách cảnh báo ra file Excel (.xlsx)"
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-950/60 hover:bg-teal-900/70 px-3.5 py-1.5 text-xs font-semibold text-teal-300 transition-all hover:border-teal-400 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet size={15} className="text-teal-400" />
            <span>Xuất Excel ({filteredAlerts.length})</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS TOOLBAR */}
      <div className="relative z-20 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
        {/* 1. Tìm kiếm từ khóa */}
        <div className="md:col-span-5 relative flex items-center rounded-xl bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] px-3 py-1.5 transition-all duration-200 hover:border-cyan-500 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400/40">
          <Search
            size={14}
            className="text-[var(--text-muted)] shrink-0 mr-2"
          />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo chỉ số, từ khóa, ao..."
            className="w-full text-xs bg-transparent text-white placeholder-[var(--text-muted)] outline-none border-none focus:outline-none focus:ring-0"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword("")}
              className="ml-2 text-[var(--text-muted)] hover:text-white cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* 2. Lọc theo ao nuôi */}
        <div className="md:col-span-3">
          <Dropdown
            value={selectedPond}
            options={pondOptions}
            onChange={setSelectedPond}
            icon={<Droplet size={13} className="text-teal-400" />}
            placeholder="Chọn ao nuôi"
            searchPlaceholder="Tìm kiếm ao nuôi..."
          />
        </div>

        {/* 3. Lọc mốc thời gian */}
        <div className="md:col-span-4">
          <Dropdown
            value={datePreset}
            options={datePresetOptions}
            onChange={(val) => setDatePreset(val as DatePresetType)}
            icon={<Calendar size={13} className="text-teal-400" />}
            placeholder="Mốc thời gian"
            searchPlaceholder="Tìm mốc thời gian..."
          />
        </div>
      </div>

      {/* Date Pickers khi chọn "CUSTOM" */}
      {datePreset === "CUSTOM" && (
        <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-xl bg-[var(--panel-bg-dark)]/80 border border-[var(--panel-border)] text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] whitespace-nowrap">Từ ngày:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#03161e] border border-[var(--panel-border)] text-white focus:outline-none focus:border-teal-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] whitespace-nowrap">Đến ngày:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#03161e] border border-[var(--panel-border)] text-white focus:outline-none focus:border-teal-400"
            />
          </div>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-xs text-[var(--text-muted)] hover:text-white underline ml-auto"
            >
              Xóa ngày
            </button>
          )}
        </div>
      )}

      {/* Filter Tabs & Summary Count */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            const count = tabCounts[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-cyan-950/80 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                    : "bg-[var(--panel-bg-dark)] text-[var(--text-muted)] border border-[var(--panel-border)] hover:border-[var(--panel-border-strong)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-cyan-400/20 text-cyan-200"
                      : "bg-white/10 text-[var(--text-muted)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-[var(--text-muted)] ml-auto">
          Tìm thấy <strong className="text-white font-semibold">{filteredAlerts.length}</strong> kết quả
        </div>
      </div>

      {/* Alerts List Container: Hiển thị 10 kết quả theo phân trang */}
      <div className="flex flex-col gap-2.5">
        {paginatedAlerts.length > 0 ? (
          paginatedAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              time={alert.time}
              title={alert.title}
              pondName={alert.pondName}
              value={alert.value}
              unit={alert.unit}
              level={alert.level}
              status={alert.status}
              onClick={onAlertClick ? () => onAlertClick(alert) : undefined}
            />
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-[var(--text-muted)]">
            <Info size={28} className="text-[var(--text-subtle)]" />
            <p className="text-sm font-medium">Không có cảnh báo nào trong mục này</p>
            <p className="text-xs text-[var(--text-subtle)] max-w-sm">
              Không có dữ liệu phù hợp với bộ lọc hiện tại. Thử chọn ao nuôi khác hoặc mở rộng khoảng ngày.
            </p>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-3 py-1.5 text-xs text-teal-300 border border-teal-500/30 rounded-lg hover:bg-teal-950/40 cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Phân trang (Pagination) - 10 cảnh báo mỗi trang */}
      {filteredAlerts.length > 0 && (
        <div className="pt-3 border-t border-[var(--divider)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="text-[11px] text-[var(--text-muted)]">
            Hiển thị{" "}
            <strong className="text-white font-semibold">
              {(currentPage - 1) * pageSize + 1}
            </strong>{" "}
            -{" "}
            <strong className="text-white font-semibold">
              {Math.min(currentPage * pageSize, filteredAlerts.length)}
            </strong>{" "}
            trên tổng số{" "}
            <strong className="text-white font-semibold">
              {filteredAlerts.length}
            </strong>{" "}
            cảnh báo
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] text-xs text-[var(--text-body)] hover:border-teal-400 hover:text-white transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft size={14} />
                <span>Trước</span>
              </button>

              {pageNumbers.map((p, idx) => {
                if (p === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 text-[var(--text-subtle)] select-none"
                    >
                      ...
                    </span>
                  );
                }
                const isCurrent = p === currentPage;
                return (
                  <button
                    key={`page-${p}`}
                    type="button"
                    onClick={() => setCurrentPage(p as number)}
                    className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? "bg-teal-500 text-black shadow-sm font-bold"
                        : "border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] text-[var(--text-muted)] hover:text-white hover:border-teal-400"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] text-xs text-[var(--text-body)] hover:border-teal-400 hover:text-white transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Trang sau"
              >
                <span>Sau</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertList;
