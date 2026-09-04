import React from "react";
import { ShieldCheck, Wind, Droplets, Activity } from "lucide-react";
import DeviceItem from "../../../components/DeviceItem";

export interface AlertRuleItem {
  id: string;
  icon?: React.ReactNode;
  iconType?: string;
  title: string;
  subtitle: string;
}

export const DEFAULT_RULES: AlertRuleItem[] = [
  {
    id: "rule-do",
    iconType: "oxygen",
    title: "Ngưỡng DO",
    subtitle: "Nguy hiểm dưới 3.5 mg/L",
  },
  {
    id: "rule-ph",
    iconType: "ph",
    title: "Khoảng pH",
    subtitle: "Cảnh báo ngoài 7.5–8.5",
  },
  {
    id: "rule-water-level",
    iconType: "waterLevel",
    title: "Mực nước",
    subtitle: "Cảnh báo dưới 1.05 m",
  },
];

export interface AlertRulesProps {
  rules?: AlertRuleItem[];
  className?: string;
}

const getRuleIcon = (rule: AlertRuleItem) => {
  if (rule.icon) return rule.icon;
  if (rule.iconType === "oxygen" || rule.id.includes("do")) return <Wind size={22} />;
  if (rule.iconType === "ph" || rule.id.includes("ph")) return <Droplets size={22} />;
  if (rule.iconType === "waterLevel" || rule.id.includes("water")) return <Activity size={22} />;
  return <Activity size={22} />;
};

const AlertRules: React.FC<AlertRulesProps> = ({
  rules = DEFAULT_RULES,
  className = "",
}) => {
  const displayRules = rules.length > 0 ? rules : DEFAULT_RULES;

  return (
    <div
      className={`bg-(--panel-bg) border border-(--panel-border) rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col text-left ${className}`}
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
        {displayRules.map((rule) => (
          <DeviceItem
            key={rule.id}
            icon={getRuleIcon(rule)}
            title={rule.title}
            subtitle={rule.subtitle}
          />
        ))}
      </div>
    </div>
  );
};

export default AlertRules;


