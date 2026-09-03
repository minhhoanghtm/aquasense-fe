import React from "react";

interface DeviceItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  status?: string;
  meta?: string;
}

const DeviceItem: React.FC<DeviceItemProps> = ({
  icon,
  title,
  subtitle,
  status,
  meta,
}) => {
  const displaySubtitle =
    subtitle || [status, meta].filter(Boolean).join(" · ");

  return (
    <div className="flex items-center gap-3 py-2.5 sm:py-3">
      {/* Icon Box */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--accent)/10 text-(--accent)">
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="text-xs sm:text-sm font-bold text-(--text-primary) leading-tight">
          {title}
        </h3>

        {displaySubtitle && (
          <p className="mt-0.5 text-[11px] sm:text-xs text-(--text-muted) font-medium">
            {displaySubtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default DeviceItem;

