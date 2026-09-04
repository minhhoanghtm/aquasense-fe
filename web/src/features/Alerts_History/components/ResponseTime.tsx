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
      className={`bg-(--panel-bg) border border-(--panel-border) rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between text-left min-h-[140px] ${className}`}
    >
      <h3 className="text-sm sm:text-base font-bold text-(--text-heading)">
        {title}
      </h3>

      <div className="my-2.5 flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-bold font-mono tracking-widest text-(--text-primary)">
          {time}
        </span>
        <p className="text-xs text-(--text-muted) mt-1">
          {subtitle}
        </p>
      </div>

      <div className="h-0" />
    </div>
  );
};

export default ResponseTime;
