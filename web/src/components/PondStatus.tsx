export type Status = "NORMAL" | "WARNING" | "DANGER";

export const statusConfig: Record<
    Status,
    {
        label: string;
        className: string;
    }
> = {
    NORMAL: {
        label: "Bình thường",
        className: "bg-cyan-950/70 text-cyan-400 border border-cyan-500/30",
    },

    WARNING: {
        label: "Cảnh báo",
        className: "bg-amber-950/70 text-amber-400 border border-amber-500/30",
    },

    DANGER: {
        label: "Nguy hiểm",
        className: "bg-rose-950/70 text-rose-400 border border-rose-500/30",
    },
};

type PondStatusProps = {
    status: Status;
    className?: string;
};

export default function PondStatus({
    status,
    className = "",
}: PondStatusProps) {
    const item = statusConfig[status] ?? statusConfig.NORMAL;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${item.className} ${className}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {item.label}
        </span>
    );
}
