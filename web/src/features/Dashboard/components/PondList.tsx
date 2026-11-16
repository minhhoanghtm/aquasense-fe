import { Link } from "react-router-dom";
import PondCard from "../../../components/PondCard";
import type { Pond, PondWithDevices } from "../../../types/Pond";
import type { Alerts } from "../../../types/Alerts";

interface PondListProps {
    ponds: Pond[];
    totalPondsCount?: number;
    infoPond: PondWithDevices[];
    alerts?: Alerts[];
    selectedPondId: string;
    onSelectPond?: (pondId: string) => void;
}

const PondList = ({
    ponds,
    totalPondsCount,
    infoPond,
    alerts = [],
    selectedPondId,
    onSelectPond,
}: PondListProps) => {
    const safeAlerts = Array.isArray(alerts) ? alerts : [];
    const displayPonds = ponds.slice(0, 4);

    return (
        <div className="flex flex-col gap-3.5 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)] m-0">
                        Danh sách vuông nuôi
                    </h3>
                    <span className="rounded-full bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-0.5 text-xs text-cyan-300 font-medium">
                        Vuông nuôi cần chú ý & cập nhật gần nhất
                    </span>
                </div>
                {totalPondsCount && totalPondsCount > 4 && (
                    <Link
                        to="/monitoring"
                        className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1 transition-colors"
                    >
                        Xem tất cả ({totalPondsCount} ao) →
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-stretch">
                {displayPonds.map((pond) => {
                    const pondWithDevices = infoPond.find((item) => item.id === pond.id) || { ...pond, devices: [] };
                    const pondAlerts = safeAlerts.filter(
                        (alert) => alert.pondId === pond.id
                    );

                    return (
                        <PondCard
                            key={pond.id || pond.pondId}
                            pond={pondWithDevices}
                            alerts={pondAlerts}
                            selected={pond.id === selectedPondId}
                            onClick={() => pond.id && onSelectPond?.(pond.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default PondList;
