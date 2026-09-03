import Title from "../../components/Title";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { Pond } from "../../types/Pond";
import type { Devices } from "../../types/Devices";
import WaterQualityRiskForecast from "../../features/AI_Analysis/components/WaterQualityRiskForecast";
import AnomalyDetectionStream from "../../features/AI_Analysis/components/AnomalyDetectionStream";
import ParameterHealthCard from "../../features/AI_Analysis/components/ParameterHealthCard";

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

const parameterData = [
  {
    parameter: "DO",
    current: 78,
    optimal: 85,
  },
  {
    parameter: "pH",
    current: 82,
    optimal: 88,
  },
  {
    parameter: "NHIỆT",
    current: 85,
    optimal: 82,
  },
  {
    parameter: "MẶN",
    current: 70,
    optimal: 80,
  },
  {
    parameter: "MỰC",
    current: 80,
    optimal: 85,
  },
];

export default function AIAnalysis() {
    useDocumentTitle("Phân tích AI");
    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5 text-left">
            <Title
                title="Phân tích AI"
                description="Hệ thống phân tích và dự báo thông minh cho vuông nuôi tôm"
                pond={currentPond}
                device={currentDevice}
            />

            {/* Top: Dự báo rủi ro chất lượng nước */}
            <WaterQualityRiskForecast />

            {/* Bottom 2-Column: Luồng phát hiện bất thường (Trái) + Sức khỏe thông số (Phải) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
                    <AnomalyDetectionStream className="h-full" />
                </div>
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                    <ParameterHealthCard data={parameterData} className="h-full" />
                </div>
            </div>
        </div>
    );
}