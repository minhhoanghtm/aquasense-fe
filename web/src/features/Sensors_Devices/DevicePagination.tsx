import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DevicePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export const DevicePagination: React.FC<DevicePaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)]/80 text-xs text-[var(--text-muted)] shadow-md">
      {/* Left: Summary + Page size selector */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div>
          Hiển thị{" "}
          <strong className="text-slate-100">
            {startItem}–{endItem}
          </strong>{" "}
          trong <strong className="text-slate-100">{totalItems}</strong> thiết bị
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden md:inline">Số dòng:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1 rounded-xl border border-[var(--panel-border)] bg-[#041a22] text-xs font-semibold text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#041a22] text-slate-200">
                {opt} / trang
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Prev, Page buttons, Next */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[#041920] text-slate-300 hover:text-white hover:border-cyan-500/40 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-slate-500">
                ...
              </span>
            );
          }

          const isCurrent = p === currentPage;
          return (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange(Number(p))}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-bold transition cursor-pointer ${
                isCurrent
                  ? "border-cyan-400 bg-cyan-500 text-[#041920] shadow-md shadow-cyan-500/20"
                  : "border-[var(--panel-border)] bg-[#041920] text-slate-300 hover:text-white hover:border-slate-500"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[#041920] text-slate-300 hover:text-white hover:border-cyan-500/40 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DevicePagination;
