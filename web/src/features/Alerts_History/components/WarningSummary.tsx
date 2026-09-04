import { Download } from "lucide-react";
import AlertSummaryBar from "../../../components/AlertSummaryBar";

interface WarningSummaryProps {
  danger?: number;
  warning?: number;
  resolved?: number;
  onExport?: () => void;
  className?: string;
}

const WarningSummary = ({
  danger = 4,
  warning = 10,
  resolved = 10,
  onExport,
  className = "",
}: WarningSummaryProps) => {
  const totalEvents = danger + warning + resolved;

  return (
    <div
      className={`bg-(--panel-bg) border border-(--panel-border) rounded-3xl p-5 sm:p-6 flex flex-col gap-3 text-left shadow-lg ${className}`}
    >
      {/* Title + Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-(--text-heading) m-0">
            Tóm tắt cảnh báo
          </h2>
          <p className="text-xs text-(--text-muted) mt-0.5">
            30 ngày qua · {totalEvents} sự kiện
          </p>
        </div>

        <button
          type="button"
          onClick={onExport}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg border border-cyan-800/60 bg-(--panel-bg) px-3 py-1 text-xs font-medium text-cyan-300 transition-all hover:border-cyan-400 hover:bg-(--primary-hover) cursor-pointer"
        >
          <Download size={13} />
          <span>Xuất file</span>
        </button>
      </div>

      {/* Summary bar */}
      <div className="mt-0.5">
        <AlertSummaryBar data={{ danger, warning, resolved }} />
      </div>
    </div>
  );
};

export default WarningSummary;
