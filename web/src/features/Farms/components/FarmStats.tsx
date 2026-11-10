import React from "react";
import { Building2, Waves, Maximize2, Layers } from "lucide-react";
import type { Farm } from "../../../types/Farm";

interface FarmStatsProps {
  farms: Farm[];
  totalFarms: number;
}

export const FarmStats: React.FC<FarmStatsProps> = ({ farms, totalFarms }) => {
  // Tính tổng diện tích
  const totalAreaM2 = farms.reduce((acc, f) => {
    const val = Number(f.totalArea);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  // Tính tổng số ao nuôi trực thuộc
  const totalPonds = farms.reduce((acc, f) => {
    return acc + (f.ponds ? f.ponds.length : f.pondCount || 0);
  }, 0);

  // Diện tích trung bình
  const avgAreaM2 = farms.length > 0 ? Math.round(totalAreaM2 / farms.length) : 0;

  const formatArea = (m2: number) => {
    if (m2 >= 10000) {
      return `${(m2 / 10000).toFixed(2)} ha`;
    }
    return `${m2.toLocaleString("vi-VN")} m²`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số trại nuôi */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] flex items-center justify-between shadow-md">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)]">Tổng số trại nuôi</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-bold text-[var(--text-heading)]">{totalFarms}</h3>
            <span className="text-xs text-[var(--text-subtle)]">trại</span>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
          <Building2 size={22} />
        </div>
      </div>

      {/* 2. Tổng diện tích quy hoạch */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] flex items-center justify-between shadow-md">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)]">Tổng diện tích quy hoạch</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-bold text-[var(--text-heading)]">
              {formatArea(totalAreaM2)}
            </h3>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Maximize2 size={22} />
        </div>
      </div>

      {/* 3. Tổng số vuông nuôi trực thuộc */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] flex items-center justify-between shadow-md">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)]">Vuông nuôi trực thuộc</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-bold text-[var(--text-heading)]">{totalPonds}</h3>
            <span className="text-xs text-[var(--text-subtle)]">vuông</span>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Waves size={22} />
        </div>
      </div>

      {/* 4. Quy mô diện tích trung bình */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] flex items-center justify-between shadow-md">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)]">Diện tích trung bình</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-bold text-[var(--text-heading)]">
              {formatArea(avgAreaM2)}
            </h3>
            <span className="text-xs text-[var(--text-subtle)]">/ trại</span>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Layers size={22} />
        </div>
      </div>
    </div>
  );
};
