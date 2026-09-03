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

const DEFAULT_ALERTS: AlertData[] = [
  {
    id: "ALT-001",
    time: "18/06 · 09:30",
    title: "Oxy hòa tan (DO)",
    pondName: "Vuông D3",
    value: "3.1",
    unit: "mg/L",
    level: "DANGER",
    status: "Chưa xử lý",
  },
  {
    id: "ALT-002",
    time: "18/06 · 09:04",
    title: "Độ đục",
    pondName: "Vuông A1",
    value: "22.8",
    unit: "NTU",
    level: "WARNING",
    status: "Đang theo dõi",
  },
  {
    id: "ALT-003",
    time: "18/06 · 08:12",
    title: "pH",
    pondName: "Vuông B2",
    value: "8.7",
    unit: "pH",
    level: "WARNING",
    status: "Đã xử lý",
  },
  {
    id: "ALT-004",
    time: "17/06 · 22:48",
    title: "Mực nước",
    pondName: "Vuông C1",
    value: "1.02",
    unit: "m",
    level: "NORMAL",
    status: "Đã xử lý",
  },
  {
    id: "ALT-005",
    time: "17/06 · 18:22",
    title: "Nhiệt độ",
    pondName: "Vuông D3",
    value: "32.8",
    unit: "°C",
    level: "DANGER",
    status: "Đã xử lý",
  },
];

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
  alerts = DEFAULT_ALERTS,
  onAlertClick,
  className = "",
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  const filteredAlerts = alerts.filter((item) => {
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
      className={`bg-(--bg-gradient-top) border border-(--panel-border) rounded-xl p-4 sm:p-4.5 flex flex-col gap-3.5 text-left shadow-lg ${className}`}
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

