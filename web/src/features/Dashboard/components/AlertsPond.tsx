import { Link } from 'react-router-dom';
import { TriangleAlert, Clock, ArrowUpRight } from 'lucide-react';
import { getTimeAgo, formatVietnamDateTime } from '../../../utils/date';

interface AlertsPondProps {
  alerts: any;
  pondId?: string;
  pondName?: string;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

const AlertsPond = ({
  alerts,
  pondId,
  pondName,
  loading = false,
  error,
  className,
}: AlertsPondProps) => {
  const rawAlerts = Array.isArray(alerts) ? alerts : [];

  // Lọc nghiêm ngặt chỉ hiển thị cảnh báo thuộc về ao nuôi đang được chọn
  const safeAlerts = rawAlerts.filter((alert: any) => {
    if (!pondId && !pondName) return true;
    const aPondId =
      alert.pondId || alert.pond_id || alert.pond?.id || alert.pond?.pondId;
    if (pondId && aPondId === pondId) return true;
    if (
      pondName &&
      alert.pondName &&
      alert.pondName.trim().toLowerCase() === pondName.trim().toLowerCase()
    ) {
      return true;
    }
    // Nếu bản ghi có pondId rõ ràng và khác với pondId đang chọn -> loại bỏ
    if (aPondId && pondId && aPondId !== pondId) return false;
    return false;
  });

  const count = safeAlerts.length;

  return (
    <div className={`dashboard-card p-5 sm:p-6 text-left flex flex-col shadow-md w-full flex-[1_1_auto] min-h-0 max-h-[480px] xl:max-h-none overflow-hidden ${className || ""}`}>
      {/* Title + action */}
      <div className="flex items-center justify-between gap-2.5 w-full mb-3.5 shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors ${
              count > 0
                ? "bg-rose-500/10 border border-rose-500/20 text-[var(--critical)]"
                : "bg-[var(--panel-bg-dark)] border border-[var(--panel-border)] text-[var(--text-muted)]"
            }`}
          >
            <TriangleAlert size={20} />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h4
              className="text-[var(--text-heading)] font-semibold text-base leading-tight tracking-wide truncate block w-full"
              title={`Cảnh báo vuông nuôi${pondName ? ` • ${pondName}` : ""}`}
            >
              Cảnh báo vuông nuôi
            </h4>
            <div className="flex items-center gap-1.5 mt-1 min-w-0">
              {pondName && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 truncate max-w-[120px] sm:max-w-[150px] shrink-0"
                  title={pondName}
                >
                  {pondName}
                </span>
              )}
              <span className="text-[10px] text-[var(--text-muted)] font-semibold tracking-wider uppercase truncate">
                {count > 0 ? `${count} cảnh báo cần xử lý` : "Không có cảnh báo nào"}
              </span>
            </div>
          </div>
        </div>

        {count > 0 && (
          <Link
            to="/alerts"
            className="text-xs text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap px-2 py-1 rounded-lg hover:bg-teal-500/10"
            title="Xem tất cả cảnh báo"
          >
            <span>Xem tất cả</span>
            <ArrowUpRight size={13} />
          </Link>
        )}
      </div>

      {/* List alert */}
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto custom-scrollbar pr-1.5 space-y-2 pb-1">
        {loading && (
          <p className="text-xs text-[var(--text-muted)] py-4 text-center">
            Đang tải cảnh báo...
          </p>
        )}
        {error && (
          <p className="text-xs text-[var(--critical)] py-4 text-center">
            Không thể tải cảnh báo: {error}
          </p>
        )}
        {!loading && !error && count === 0 && (
          <p className="text-xs text-[var(--text-muted)] py-6 text-center">
            Hiện tại {pondName ? `ao "${pondName}"` : "vuông nuôi"} hoạt động ổn định, không có cảnh báo.
          </p>
        )}
        {!loading &&
          !error &&
          safeAlerts.map((alert: any, index: number) => (
            <div
              key={alert.id ?? index}
              className="relative flex flex-col w-full pl-3.5 pr-2.5 py-2.5 bg-[var(--panel-bg-dark)]/40 border border-[var(--panel-border)]/50 hover:border-cyan-500/30 hover:bg-[var(--panel-highlight)] rounded-xl transition-all shadow-sm"
            >
              <span className="absolute left-1.5 top-3 bottom-3 w-[3px] bg-[var(--critical)] rounded-full" />

              <p className="font-semibold text-xs sm:text-sm text-[var(--text-heading)] leading-snug">
                {alert.message || alert.title || "Cảnh báo chỉ số"}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-1.5 pt-1 border-t border-[var(--panel-border)]/20">
                <span className="flex items-center gap-1 font-mono text-[10px] text-cyan-300/80">
                  <Clock size={11} />
                  {formatVietnamDateTime(alert.createdAt || alert.time, {
                    showSeconds: false,
                  })}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {getTimeAgo(alert.createdAt || alert.time)}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Subtle footer info when there are multiple alerts */}
      {count > 0 && (
        <div className="mt-auto pt-2.5 border-t border-[var(--panel-border)]/40 flex items-center justify-between text-[11px] text-[var(--text-muted)] shrink-0">
          <span>Tổng cộng {count} cảnh báo</span>
          <Link
            to="/alerts"
            className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Trang Cảnh báo</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default AlertsPond;
