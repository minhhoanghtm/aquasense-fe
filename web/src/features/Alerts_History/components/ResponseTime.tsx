import React from "react";

export interface ResponseTimeProps {
  title?: string;
  time?: string;
  subtitle?: string;
  className?: string;
}

export const ResponseTime: React.FC<ResponseTimeProps> = ({
  title = "Thời gian phản hồi",
  time = "04:18",
  subtitle = "Thời gian xử lý trung bình",
  className = "",
}) => {
  return (
    <div
      className={`bg-(--panel-bg) border border-(--panel-border) rounded-2xl lg:rounded-3xl p-3.5 sm:p-4 shadow-lg flex flex-col justify-between text-left ${className}`}
    >
      <h3 className="text-sm sm:text-base font-bold text-(--text-heading)">
        {title}
      </h3>

      <div className="my-1.5 sm:my-2 flex flex-col items-center justify-center text-center">
        <span className="text-2xl sm:text-3xl font-bold font-mono tracking-widest text-(--text-primary)">
          {time}
        </span>
        <p className="text-[11px] sm:text-xs text-(--text-muted) mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="h-0" />
    </div>
  );
};

export default ResponseTime;
