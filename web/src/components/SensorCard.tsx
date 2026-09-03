export interface WaterParameter {
    id?: string | number;
    label: string;
    value: number;
    unit: string;
}

export const SensorCard = ({ label, value, unit }: WaterParameter) => {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-(--panel-border) bg-(--panel-bg) p-4 transition-all hover:border-(--accent)/50">
            <span className="text-xs font-semibold text-(--text-muted)">{label}</span>
            <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-(--text-primary)">{value}</span>
                <span className="text-xs font-medium text-(--text-muted)">{unit}</span>
            </div>
        </div>
    );
};