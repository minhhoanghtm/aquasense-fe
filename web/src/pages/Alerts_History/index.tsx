import Title from "../../components/Title";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Pond } from "../../types/Pond";
import type { Devices } from "../../types/Devices";
import WarningSummary from "../../features/Alerts_History/components/WarningSummary";
import AlertRules from "../../features/Alerts_History/components/AlertRules";
import AlertList from "../../features/Alerts_History/components/AlertList";
import ResponseTime from "../../features/Alerts_History/components/ResponseTime";

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

export default function Alerts() {
    useDocumentTitle("Cảnh báo & Lịch sử");
    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5">
            <Title
                title="Cảnh báo & Lịch sử"
                description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
                pond={currentPond}
                device={currentDevice}
            />

            {/* Top Full-Width Summary Card */}
            <WarningSummary />

            {/* Bottom 2-Column Content: Alert List (Left) + Rules & Response Time (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                <div className="lg:col-span-8">
                    <AlertList />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
                    <AlertRules />
                    <ResponseTime />
                </div>
            </div>
        </div>
    );
}