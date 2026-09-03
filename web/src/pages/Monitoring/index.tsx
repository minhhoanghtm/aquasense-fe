import Title from "../../components/Title";
import PondDevices from "../../features/Ponds/components/PondDevices";
import { PondInfo } from "../../features/Ponds/components/PondInfo";
import PondList from "../../features/Ponds/components/PondList";
import WaterQualitySummary from "../../features/Ponds/components/WaterQualitySummary";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Pond } from "../../types/Pond";
import type { Devices } from "../../types/Devices";

const currentPond: Pond = {
    id: "PND-A1",
    name: "Vuông A1 - Cà Mau",
    location: "Khu vực Cà Mau · Khu 01",
    updatedAt: "2024-06-18T09:42:00.000Z",
    area: 2.4,
    stockingDate: "2024-03-01",
    growthStage: "Tôm tăng trưởng",
    status: "NORMAL",
    managerId: "MGR-01",
};

const currentDevice: Devices = {
    id: "DEV-A1",
    pondId: "PND-A1",
    serialNumber: "ESP32-A1-8892",
    macAddress: "24:6F:28:B4:76:5C",
    status: "ACTIVE",
    lastActiveAt: "2024-06-18T09:42:00.000Z",
};

export const Monitoring = () => {
    useDocumentTitle("Quản lý vuông nuôi");

    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5">
            <div>
                <Title
                    title="Quản lý vuông nuôi"
                    description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
                    pond={currentPond}
                    device={currentDevice}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                {/* Cột trái */}
                <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
                    <PondList />
                    <PondDevices />
                </div>
                <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
                    <PondInfo />
                </div>
            </div>
            
            <div>
                <WaterQualitySummary />
            </div>
        </div>
    );
};

export default Monitoring;


