import React from "react";

interface ProgressBarProps {
  title: string;
  icon?: React.ReactNode;
  value: number;
  className?: string;
  barColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  title,
  icon,
  value,
  className = "",
  barColor = "bg-(--accent)",
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Hàng trên */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-(--text-primary)">{title}</p>
        <span className="flex items-center gap-1 text-sm font-semibold text-(--accent)">
          {icon}
          {value}%
        </span>
      </div>

      {/* Thanh progress */}
      <div className="h-[7px] w-full overflow-hidden rounded-full bg-(--progress-track)">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
