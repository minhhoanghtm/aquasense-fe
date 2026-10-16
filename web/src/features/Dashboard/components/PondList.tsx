import PondCard from "../../../components/PondCard";
import type { Pond, PondWithDevices } from "../../../types/Pond";
import type { Alerts } from "../../../types/Alerts";

interface PondListProps {
    ponds: Pond[];
    infoPond: PondWithDevices[];
    alerts?: Alerts[];
    selectedPondId: string;
    onSelectPond?: (pondId: string) => void;
}

const PondList = ({
    ponds,
    infoPond,
    alerts = [],
    selectedPondId,
    onSelectPond,
}: PondListProps) => {
    const safeAlerts = Array.isArray(alerts) ? alerts : [];

    return (
        <div className="flex flex-col gap-6 mt-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Danh sách ao nuôi
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {ponds.map((pond) => {
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
