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
    let badgeClass = "bg-[var(--success-bg)] text-[var(--success)] border-transparent";
    let dotClass = "bg-[var(--success)]";

    if (alerts.length > 0) {
        const hasDanger = alerts.some(a => a.alertLevel === "DANGER" || a.alertLevel === "CRITICAL" || a.level === "DANGER" || a.level === "CRITICAL");
        if (hasDanger) {
            statusText = "Nguy hiểm";
            badgeClass = "bg-[var(--critical-bg)] text-[var(--critical)] border-transparent";
            dotClass = "bg-[var(--critical)]";
        } else {
            statusText = "Cảnh báo";
            badgeClass = "bg-[var(--warning-bg)] text-[var(--warning)] border-transparent";
            dotClass = "bg-[var(--warning)]";
        }
    }

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer overflow-hidden dashboard-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-left"
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