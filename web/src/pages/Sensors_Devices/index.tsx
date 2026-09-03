import Title from "../../components/Title";
import DeviceStats from "../../features/Sensors_Devices/DeviceStats";
import LatestReading from "../../features/Sensors_Devices/LatestReading";
import DeviceList from "../../features/Sensors_Devices/DeviceList";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Pond } from "../../types/Pond";
import type { Devices as DeviceType } from "../../types/Devices";

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

const currentDevice: DeviceType = {
    id: "DEV-A1",
    pondId: "PND-A1",
    serialNumber: "ESP32-A1-8892",
    macAddress: "24:6F:28:B4:76:5C",
    status: "ACTIVE",
    lastActiveAt: "2024-06-18T09:42:00.000Z",
};

export default function Devices() {
    useDocumentTitle("Cảm biến & Thiết bị");

    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5">
            {/* Header Title */}
            <Title
                title="Cảm biến & Thiết bị"
                description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
                pond={currentPond}
                device={currentDevice}
            />

            {/* Thống kê thiết bị đầu trang */}
            <DeviceStats
                total={6}
                active={4}
                offline={1}
                warning={1}
            />
            
            {/* Danh sách thiết bị */}
            <DeviceList />

            {/* Giá trị đo gần nhất */}
            <LatestReading />
        </div>
    );
}

