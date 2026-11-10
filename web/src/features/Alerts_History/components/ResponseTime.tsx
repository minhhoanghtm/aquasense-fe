import React from "react";

export interface ResponseTimeProps {
  title?: string;
  time?: string;
  subtitle?: string;
  className?: string;
}

export const ResponseTime: React.FC<ResponseTimeProps> = ({
  title = "Thời gian phản hồi",
  time,
  subtitle = "Thời gian xử lý trung bình",
  className = "",
}) => {
  return (
    <div
      className={`dashboard-card p-4 sm:p-5 shadow-md flex flex-col justify-between text-left ${className}`}
    >
      <h3 className="text-sm sm:text-base font-bold text-[var(--text-heading)] m-0">
        {title}
      </h3>

      <div className="my-2 sm:my-3 flex flex-col items-center justify-center text-center">
        <span className="text-2xl sm:text-3xl font-bold font-mono tracking-widest text-[var(--text-primary)]">
          {time || "Chưa có dữ liệu"}
        </span>
        <p className="text-[11px] sm:text-xs text-[var(--text-muted)] mt-1">
          {subtitle}
        </p>
      </div>

      <div className="h-0" />
    </div>
  );
};

export default ResponseTime;
