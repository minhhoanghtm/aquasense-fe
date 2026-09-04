import { Link } from "react-router-dom";
import { Waves, MapPin, Calendar, Activity, ArrowRight, Gauge, Layers } from "lucide-react";
import type { Pond } from "../../types/Pond";
import type { Devices } from "../../types/Devices";
import { formatVietnamDate } from "../../utils/date";

interface ManagedPondsTabProps {
  ponds: Pond[];
  devices: Devices[];
}

export default function ManagedPondsTab({ ponds, devices }: ManagedPondsTabProps) {
  const totalArea = ponds.reduce((sum, p) => sum + (p.area || 0), 0);

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-heading)] flex items-center gap-2">
            <Waves className="h-5 w-5 text-[var(--accent)]" />
            Danh sách vuông nuôi phụ trách
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Các vuông tôm thuộc quyền theo dõi, thu thập dữ liệu cảm biến và kiểm soát chất lượng nước
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-1.5 text-center">
            <p className="text-[10px] text-[var(--text-muted)]">Tổng diện tích</p>
            <p className="text-sm font-bold text-[var(--accent-bright)]">{totalArea.toFixed(1)} ha</p>
          </div>
          <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-1.5 text-center">
            <p className="text-[10px] text-[var(--text-muted)]">Số lượng vuông</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{ponds.length} vuông</p>
          </div>
        </div>
      </div>

      {/* Grid of Ponds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {ponds.map((pond) => {
          const pondDevices = devices.filter((d) => d.pondId === pond.id);
          const isWarning = pond.status === "WARNING";
          const isCritical = pond.status === "CRITICAL";

          const statusColor = isCritical
            ? "bg-[var(--critical-bg)] text-[var(--critical)] border-[var(--critical)]/30"
            : isWarning
            ? "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning)]/30"
            : "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/30";

          const statusText = isCritical
            ? "Nguy hiểm"
            : isWarning
            ? "Cảnh báo"
            : "Bình thường";

          return (
            <div
              key={pond.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 backdrop-blur-xl shadow-md transition-all hover:border-[var(--panel-border-strong)] hover:shadow-[0_4px_20px_rgba(45,212,195,0.08)] group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--divider)]">
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider text-[var(--accent)] uppercase">
                      {pond.id}
                    </span>
                    <h4 className="text-base font-bold text-[var(--text-heading)] group-hover:text-[var(--accent)] transition">
                      {pond.name}
                    </h4>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusColor}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                    {statusText}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[var(--text-body)]">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <MapPin size={13} className="text-[var(--accent)]" />
                      Vị trí:
                    </span>
                    <span className="font-medium text-[var(--text-primary)] truncate max-w-[160px]">
                      {pond.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--text-body)]">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Layers size={13} className="text-[var(--accent)]" />
                      Diện tích & Mật độ:
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {pond.area} ha · {pond.density || "180 PL/m²"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--text-body)]">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Activity size={13} className="text-[var(--accent)]" />
                      Giai đoạn:
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {pond.growthStage || "Tôm tăng trưởng"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--text-body)]">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Calendar size={13} className="text-[var(--accent)]" />
                      Ngày thả giống:
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {pond.stockingDate ? formatVietnamDate(pond.stockingDate) : "15/06/2026"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--text-body)] pt-1">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Gauge size={13} className="text-[var(--accent)]" />
                      Thiết bị kết nối:
                    </span>
                    <span className="font-semibold text-[var(--accent-bright)]">
                      {pondDevices.length > 0 ? `${pondDevices.length} trạm cảm biến` : "1 trạm Gateway"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-5 pt-3 border-t border-[var(--divider)]">
                <Link
                  to="/monitoring"
                  className="flex items-center justify-between text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-bright)] transition"
                >
                  <span>Xem giám sát chi tiết</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
