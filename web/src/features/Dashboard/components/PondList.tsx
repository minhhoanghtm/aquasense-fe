import PondCard from "../../../components/PondCard";
import type { PondWithDevices } from "../../../types/Pond";
import type { Alerts } from "../../../types/Alerts";

interface PondListProps {
    infoPond: PondWithDevices[];
    alerts?: Alerts[];
    onSelectPond?: (pondId: string) => void;
}

const PondList = ({
    infoPond,
    alerts = [],
    onSelectPond,
}: PondListProps) => {
    return (
        <div className="flex flex-col gap-6 mt-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Danh sách ao nuôi
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {infoPond.map((pond) => {
                    const pondAlerts = alerts.filter(
                        (alert) => alert.pondId === pond.id
                    );

                    return (
                        <PondCard
                            key={pond.id}
                            pond={pond}
                            alerts={pondAlerts}
                            onClick={() => onSelectPond?.(pond.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default PondList;