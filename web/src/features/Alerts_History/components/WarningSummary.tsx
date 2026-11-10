import AlertSummaryBar from "../../../components/AlertSummaryBar";

interface WarningSummaryProps {
  danger?: number;
  warning?: number;
  resolved?: number;
  className?: string;
}

const WarningSummary = ({
  danger = 0,
  warning = 0,
  resolved = 0,
  className = "",
}: WarningSummaryProps) => {
  const totalEvents = danger + warning + resolved;

  return (
    <div
      className={`dashboard-card p-4 sm:p-5 flex flex-col gap-3 text-left shadow-md ${className}`}
    >
      {/* Title */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-[var(--text-heading)] m-0">
          Tóm tắt cảnh báo
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          30 ngày qua · {totalEvents} sự kiện
        </p>
      </div>

      {/* Summary bar */}
      <div className="mt-0.5">
        <AlertSummaryBar data={{ danger, warning, resolved }} />
      </div>
    </div>
  );
};

export default WarningSummary;
