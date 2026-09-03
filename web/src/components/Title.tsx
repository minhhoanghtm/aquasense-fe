import type { Pond } from "../types/Pond";
import { Droplet, MapPin, Calendar } from "lucide-react";
import { formatVietnamDateTime } from "../utils/date";
import type { Devices } from "../types/Devices";

interface TitleProps {
  title: String,
  description: String,
  pond: Pond | null;
  // dropdown?: React.ReactNode;
  className?: string;
  device?: Devices | null;
}

const Title = ({
  title,
  description,
  pond,
  // dropdown,
  className = "",
  device
}: TitleProps) => {
  if (!pond) {
    return <div className="text-slate-300 text-sm">Đang tải...</div>;
  }

  const updatedAt = pond.updatedAt ?? pond.createdAt;
  const isConnected = !!(device && device.status && device.status.toUpperCase() === "ACTIVE");
  const statusText = isConnected ? "Đã kết nối" : "Mất kết nối";

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Top Row: Title*/}
      <div className="flex items-center justify-between w-full">
        <h1 className="m-0 text-left text-xl sm:text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
      </div>

      {/* Bottom Row: Info Details */}
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4 text-xs text-slate-400">
        <span>
          {description}
        </span>

        <div className="flex flex-wrap items-center gap-x-4 md:ml-auto md:justify-end text-slate-300 text-xs">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Droplet size={13} className="text-[var(--accent)]" />
            <span>{pond.name}</span>
            <span className="text-slate-600">-</span>
            <span>{pond.id.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <MapPin size={13} className="text-[var(--accent)]" />
            <span>{pond.location}</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Calendar size={13} className="text-[var(--accent)]" />
            <span>
              {updatedAt ? formatVietnamDateTime(updatedAt) : "-"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? "bg-[var(--success)]" : "bg-[var(--critical)]"} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-[var(--success)]" : "bg-[var(--critical)]"}`}></span>
            </span>
            <span className={`${isConnected ? "text-[var(--success)]" : "text-[var(--critical)]"} font-medium`}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Title;