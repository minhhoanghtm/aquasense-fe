interface AlertSummary {
  danger: number;
  warning: number;
  resolved: number;
}

interface AlertSummaryBarProps {
  data: AlertSummary;
  className?: string;
}

const AlertSummaryBar = ({ data, className = "" }: AlertSummaryBarProps) => {
  const total = (data.danger + data.warning + data.resolved) || 1;
  const dangerPercentage = (data.danger / total) * 100;
  const warningPercentage = (data.warning / total) * 100;
  const resolvedPercentage = (data.resolved / total) * 100;

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Alert summary bar */}
      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-800/50">
        {data.danger > 0 && (
          <div
            className="bg-rose-400 h-full transition-all duration-300"
            style={{ width: `${dangerPercentage}%` }}
          />
        )}
        {data.warning > 0 && (
          <div
            className="bg-amber-400 h-full transition-all duration-300"
            style={{ width: `${warningPercentage}%` }}
          />
        )}
        {data.resolved > 0 && (
          <div
            className="bg-teal-400 h-full transition-all duration-300"
            style={{ width: `${resolvedPercentage}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-(--text-muted) flex-wrap">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
          <span>
            <strong className="font-semibold text-(--text-primary)">{data.danger}</strong> Nguy hiểm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-(--text-primary)">{data.warning}</strong> Cảnh báo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-400 shrink-0" />
          <span>
            <strong className="font-semibold text-(--text-primary)">{data.resolved}</strong> Đã xử lý
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertSummaryBar;
