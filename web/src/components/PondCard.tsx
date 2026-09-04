import backgroundImage from "../assets/background.png";
import type { Alerts } from "../types/Alerts";
import type { PondWithDevices } from "../types/Pond";
import { getTimeAgo } from "../utils/date";

interface PondCardProps {
    pond: PondWithDevices;
    alerts: Alerts[];
    onClick?: () => void;
}

const PondCard = ({ pond, alerts, onClick }: PondCardProps) => {
    const title = pond.name;
    const lastUpdated = pond.updatedAt || pond.createdAt || new Date().toISOString();

    // Determine status badge based on alerts
    let statusText = "Bình thường";
    let badgeClass = "bg-teal-500/10 text-teal-400 border-teal-500/20";
    let dotClass = "bg-teal-400";

    if (alerts.length > 0) {
        const hasDanger = alerts.some(a => a.alertLevel === "DANGER");
        if (hasDanger) {
            statusText = "Nguy hiểm";
            badgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
            dotClass = "bg-red-400";
        } else {
            statusText = "Cảnh báo";
            badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
            dotClass = "bg-amber-400";
        }
    }

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer overflow-hidden rounded-xl border border-(--panel-border) bg-(--panel-bg) transition-all duration-300 hover:-translate-y-1 hover:border-(--panel-border-strong) hover:shadow-lg text-left"
        >
            {/* Image */}
            <div className="relative h-32 overflow-hidden">
                <img
                    src={backgroundImage}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Status Badge */}
                <div
                    className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border backdrop-blur-md ${badgeClass}`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${dotClass} animate-pulse`} />
                    <span>{statusText}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-1">
                {/* Pond name & location */}
                <h4 className="font-semibold text-(--text-heading) text-sm group-hover:text-(--accent) transition-colors">
                    {title} - {pond.location}
                </h4>

                {/* Subtext */}
                <p className="text-xs text-(--text-muted) flex items-center gap-1.5">
                    <span>{pond.id.toUpperCase()}</span>
                    <span>·</span>
                    <span>cập nhật {getTimeAgo(lastUpdated)}</span>
                </p>
            </div>
        </div>
    );
};

export default PondCard;