import Title from "../../components/Title";
import DeviceStats from "../../features/Sensors_Devices/DeviceStats";
import LatestReading from "../../features/Sensors_Devices/LatestReading";
import DeviceList from "../../features/Sensors_Devices/DeviceList";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useDevices } from "../../hooks/useDevices";
import { useWaterQuality } from "../../hooks/useWaterQuality";

export default function Devices() {
    useDocumentTitle("Cảm biến & Thiết bị");

    const { ponds } = usePonds();
    const selectedPondId = ponds.length > 0 ? ponds[0].id : "";
    const { pond, device } = usePond(selectedPondId);
    const { devices, stats } = useDevices();
    const { waterQuality } = useWaterQuality(selectedPondId);

    // Format latest readings if available
    const latestReading = waterQuality?.sensorReadings && waterQuality.sensorReadings.length > 0
        ? waterQuality.sensorReadings[waterQuality.sensorReadings.length - 1]
        : null;

    const dynamicMetrics = latestReading?.metrics?.map((m: any) => ({
        id: m.name,
        label: m.name.toUpperCase(),
        value: `${m.value} ${m.unit || ""}`.trim(),
        color: m.name === "pH" || m.name === "temperature" ? "cyan" : "amber",
    }));

    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5">
            {/* Header Title */}
            <Title
                title="Cảm biến & Thiết bị"
                description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
                pond={pond}
                device={device}
            />

            {/* Thống kê thiết bị đầu trang */}
            <DeviceStats
                total={stats.total}
                active={stats.active}
                offline={stats.offline}
                warning={stats.warning}
            />
            
            {/* Danh sách thiết bị */}
            <DeviceList devices={devices} />

            {/* Giá trị đo gần nhất */}
            <LatestReading
                deviceCode={device?.node_code || device?.serialNumber}
                deviceName={device?.name || "Gateway ESP32"}
                metrics={dynamicMetrics}
            />
        </div>
    );
}


