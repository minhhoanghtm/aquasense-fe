import { pondStatusConfig, type PondHealthStatus } from "./pondStatusConfig";

type PondStatusProps = {
    status: PondHealthStatus;
    className?: string;
};

export default function PondStatus({
    status,
    className = "",
}: PondStatusProps) {
    const item = pondStatusConfig[status] ?? pondStatusConfig.NORMAL;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${item.className} ${className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {item.label}
        </span>
    );
}
