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
  rules = [],
  className = "",
}) => {
  return (
    <div
      className={`dashboard-card p-4 sm:p-5 shadow-md flex flex-col text-left ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm sm:text-base font-bold text-[var(--text-heading)] m-0">
          Quy tắc cảnh báo
        </h3>
        <ShieldCheck className="w-4.5 h-4.5 text-[var(--accent)]" />
      </div>

      {/* Rules list using existing DeviceItem */}
      <div className="divide-y divide-[var(--panel-border)]">
        {rules.length > 0 ? rules.map((rule) => (
          <DeviceItem
            key={rule.id}
            icon={getRuleIcon(rule)}
            title={rule.title}
            subtitle={rule.subtitle}
          />
        )) : <p className="py-4 text-sm text-(--text-muted)">Chưa có quy tắc cảnh báo từ hệ thống.</p>}
      </div>
    </div>
  );
};

export default AlertRules;


