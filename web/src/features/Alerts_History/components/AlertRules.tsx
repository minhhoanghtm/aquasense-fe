import React from "react";
import { ShieldCheck, Wind, Droplets, Activity } from "lucide-react";
import DeviceItem from "../../../components/DeviceItem";

export interface AlertRuleItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const DEFAULT_RULES: AlertRuleItem[] = [
  {
    id: "rule-do",
    icon: <Wind size={22} />,
    title: "Ngưỡng DO",
    subtitle: "Nguy hiểm dưới 3.5 mg/L",
  },
  {
    id: "rule-ph",
    icon: <Droplets size={22} />,
    title: "Khoảng pH",
    subtitle: "Cảnh báo ngoài 7.5–8.5",
  },
  {
    id: "rule-water-level",
    icon: <Activity size={22} />,
    title: "Mực nước",
    subtitle: "Cảnh báo dưới 1.05 m",
  },
];

interface AlertRulesProps {
  rules?: AlertRuleItem[];
  className?: string;
}

const AlertRules: React.FC<AlertRulesProps> = ({
  rules = DEFAULT_RULES,
  className = "",
}) => {
  return (
    <div
      className={`bg-(--bg-gradient-top) border border-(--panel-border) rounded-xl p-4 sm:p-4.5 shadow-lg flex flex-col text-left ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="text-sm sm:text-base font-bold text-(--text-heading)">
          Quy tắc cảnh báo
        </h3>
        <ShieldCheck className="w-4.5 h-4.5 text-(--accent)" />
      </div>

      {/* Rules list using existing DeviceItem */}
      <div className="divide-y divide-(--panel-border)">
        {rules.map((rule) => (
          <DeviceItem
            key={rule.id}
            icon={rule.icon}
            title={rule.title}
            subtitle={rule.subtitle}
          />
        ))}
      </div>
    </div>
  );
};

export default AlertRules;


