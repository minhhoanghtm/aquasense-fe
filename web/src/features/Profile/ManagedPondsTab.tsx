import { useState } from "react";
import { Link } from "react-router-dom";
import { Waves, Calendar, ArrowRight, Gauge, Layers, Droplets, Activity, CheckCircle2 } from "lucide-react";
import type { Pond, PondStatus } from "../../types/Pond";
import type { Devices } from "../../types/Devices";
import type { User } from "../../types/User";
import { formatVietnamDate } from "../../utils/date";

interface ManagedPondsTabProps {
  ponds: Pond[];
  devices: Devices[];
  user?: User | null;
}

export default function ManagedPondsTab({ ponds, devices, user }: ManagedPondsTabProps) {
  const [filterMode, setFilterMode] = useState<"all" | "assigned">("assigned");

  const userAssignedPondIds = user?.assignedPondIds || [];
  const assignedPonds = ponds.filter(
    (p) => userAssignedPondIds.includes(p.id) || userAssignedPondIds.includes(p.pondId || "")
  );

  const displayedPonds =
    filterMode === "assigned" && assignedPonds.length > 0
      ? assignedPonds
      : ponds;

  const totalArea = displayedPonds.reduce(
    (sum, p) => sum + (p.areaM2 || (p.area ? p.area * 10000 : 0) || 5000),
    0
  );
  const activePondsCount = displayedPonds.filter(
    (p) => p.status === "ACTIVE" || !p.status || p.status === "NORMAL" || p.status === "WARNING"
  ).length;

  const getPondStatusBadge = (status?: string | PondStatus) => {
    switch (status?.toUpperCase()) {
      case "HARVESTED":
        return {
          label: "Đã thu hoạch",
          badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
          dotColor: "bg-blue-400",
        };
      case "EMPTY":
        return {
          label: "Ao trống",
          badgeColor: "bg-slate-500/15 text-slate-400 border-slate-500/30",
          dotColor: "bg-slate-400",
        };
      case "ACTIVE":
      default:
        return {
          label: "Đang nuôi",
          badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          dotColor: "bg-emerald-400",
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
            <Waves className="h-5 w-5 text-[var(--accent)]" />
            Danh sách vuông nuôi phụ trách
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Chi tiết các vuông nuôi tôm: diện tích ($m^2$), độ sâu mực nước ($m$), mật độ thả ($con/m^2$) và trạm thiết bị IoT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {assignedPonds.length > 0 && assignedPonds.length !== ponds.length && (
            <div className="flex items-center rounded-xl bg-[#041920] p-1 border border-cyan-900/60 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode("assigned")}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filterMode === "assigned"
                    ? "bg-[var(--accent)] text-[#041920] font-bold"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                Được phân công ({assignedPonds.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filterMode === "all"
                    ? "bg-[var(--accent)] text-[#041920] font-bold"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                Tất cả ({ponds.length})
              </button>
            </div>
          )}

          <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-1.5 text-center">
            <p className="text-[10px] text-[var(--text-muted)]">Tổng diện tích</p>
            <p className="text-sm font-bold text-[var(--accent-bright)]">{totalArea.toLocaleString()} m²</p>
          </div>
          <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-1.5 text-center">
            <p className="text-[10px] text-[var(--text-muted)]">Đang nuôi / Tổng</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {activePondsCount} / {displayedPonds.length} vuông
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Ponds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {displayedPonds.map((pond) => {
          const pondId = pond.pondId || pond.id;
          const pondName = pond.pondName || pond.name;
          const areaM2 = pond.areaM2 || (pond.area ? pond.area * 10000 : 5000);
          const depthM = pond.depthM || 1.5;
          const shrimpDensity = pond.shrimpDensity || 120;
          const statusBadge = getPondStatusBadge(pond.status);
          const createAt = pond.createAt || pond.createdAt || "2026-06-15T08:00:00Z";
          const isUserAssigned = userAssignedPondIds.includes(pond.id) || userAssignedPondIds.includes(pondId);

          const pondDevices = devices.filter((d) => d.pondId === pond.id || d.pondId === pond.pondId);

          return (
            <div
              key={pondId}
              className={`flex flex-col justify-between rounded-2xl border bg-[var(--panel-bg)] p-5 backdrop-blur-xl shadow-md transition-all hover:border-[var(--panel-border-strong)] hover:shadow-[0_4px_20px_rgba(45,212,195,0.08)] group text-left ${
                isUserAssigned
                  ? "border-[var(--panel-border-strong)]"
                  : "border-[var(--panel-border)] opacity-90"
              }`}
            >
              <div>
                {/* Header: Pond Name & Status */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--divider)]">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-semibold tracking-wider text-[var(--accent)] uppercase">
                        {pondId}
                      </span>
                      {isUserAssigned && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          <CheckCircle2 size={9} /> Phụ trách
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-[var(--text-heading)] group-hover:text-[var(--accent)] transition">
                      {pondName}
                    </h4>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusBadge.badgeColor}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dotColor} animate-pulse`}></span>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[var(--text-body)]">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Layers size={13} className="text-[var(--accent)]" />
                      Diện tích:
                    </span>
                    <span className="font-bold text-[var(--accent-bright)]">
                      {areaM2.toLocaleString()} m² ({(areaM2 / 10000).toFixed(2)} ha)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--text-body)]">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Droplets size={13} className="text-cyan-400" />
                      Độ sâu mực nước:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {depthM} m
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--text-body)]">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Activity size={13} className="text-emerald-400" />
                      Mật độ giống:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {shrimpDensity} con/m²
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--text-body)]">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Calendar size={13} className="text-purple-400" />
                      Ngày tạo:
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {formatVietnamDate(createAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--text-body)] pt-1 border-t border-[var(--divider)]/50">
                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Gauge size={13} className="text-[var(--accent)]" />
                      Trạm cảm biến IoT:
                    </span>
                    <span className="font-semibold text-[var(--accent-bright)]">
                      {pondDevices.length > 0 ? `${pondDevices.length} thiết bị` : "1 Trạm Gateway"}
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
                  <span>Xem chỉ số quan trắc & Test kit</span>
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
