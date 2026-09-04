import { useState, useEffect } from "react";
import Title from "../../components/Title";
import PondDevices from "../../features/Ponds/components/PondDevices";
import { PondInfo } from "../../features/Ponds/components/PondInfo";
import PondList from "../../features/Ponds/components/PondList";
import WaterQualitySummary from "../../features/Ponds/components/WaterQualitySummary";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useWaterQuality } from "../../hooks/useWaterQuality";
import { getFeedingSchedules, type FeedingScheduleItem } from "../../services/pondApi";
import { getDevicesByPondId } from "../../services/deviceApi";
import type { Devices } from "../../types/Devices";

export const Monitoring = () => {
    useDocumentTitle("Quản lý vuông nuôi");

    const { ponds } = usePonds();
    const [selectedPondId, setSelectedPondId] = useState<string>("");
    const [pondDevices, setPondDevices] = useState<Devices[]>([]);
    const [feedingSchedules, setFeedingSchedules] = useState<FeedingScheduleItem[]>([]);

    useEffect(() => {
        if (ponds.length > 0 && !selectedPondId) {
            setSelectedPondId(ponds[0].id);
        }
    }, [ponds, selectedPondId]);

    const { pond, device } = usePond(selectedPondId);
    const { waterQuality } = useWaterQuality(selectedPondId);

    useEffect(() => {
        if (selectedPondId) {
            getDevicesByPondId(selectedPondId).then((devs) => {
                if (devs) setPondDevices(devs);
            });
            getFeedingSchedules(selectedPondId).then((scheds) => {
                if (scheds) setFeedingSchedules(scheds);
            });
        }
    }, [selectedPondId]);

    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5">
            <div>
                <Title
                    title="Quản lý vuông nuôi"
                    description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
                    pond={pond}
                    device={device}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                {/* Cột trái */}
                <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
                    <PondList
                        ponds={ponds}
                        selectedId={selectedPondId}
                        onSelect={(id) => setSelectedPondId(id)}
                    />
                    <PondDevices devices={pondDevices} />
                </div>
                <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
                    <PondInfo
                        pond={pond}
                        sensorReadings={waterQuality?.sensorReadings}
                        feedingSchedules={feedingSchedules}
                    />
                </div>
            </div>
            
            <div>
                <WaterQualitySummary />
            </div>
        </div>
    );
};

export default Monitoring;



