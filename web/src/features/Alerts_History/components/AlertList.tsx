import React, { useState } from "react";
import AlertItem, { type AlertLevel, type AlertStatus } from "../../../components/AlertItem";

export interface AlertData {
  id: string;
  time: string;
  title: string;
  pondName: string;
  value: number | string;
  unit?: string;
  level: AlertLevel;
  status: AlertStatus;
}

type FilterType = "ALL" | "DANGER" | "WARNING" | "RESOLVED";

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

interface AlertListProps {
  alerts?: AlertData[];
  onAlertClick?: (alert: AlertData) => void;
  className?: string;
}

const AlertList: React.FC<AlertListProps> = ({
  alerts = [],
  onAlertClick,
  className = "",
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const filteredAlerts = safeAlerts.filter((item) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "DANGER") return item.level === "DANGER";
    if (activeFilter === "WARNING") return item.level === "WARNING";
    if (activeFilter === "RESOLVED")
      return (
        item.status === "RESOLVED" ||
        item.status === "ĐÃ XỬ LÝ" ||
        item.status === "Đã xử lý"
      );
    return true;
  });

  return (
    <div
      className={`bg-(--panel-bg) border border-(--panel-border) rounded-3xl p-5 sm:p-6 flex flex-col gap-3.5 text-left shadow-lg ${className}`}
    >
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-cyan-950/80 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                  : "bg-(--panel-bg)/40 text-(--text-muted) border border-(--panel-border) hover:border-(--panel-border-strong) hover:text-(--text-primary)"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-2.5">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
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
          <div className="py-6 text-center text-xs text-(--text-muted)">
            Không có cảnh báo nào trong mục này
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertList;

