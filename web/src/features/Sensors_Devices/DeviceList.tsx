import { useState } from "react";
import DeviceCard from "../../components/DeviceCard";
import Dropdown, { type DropdownOption } from "../../components/Dropdown";
import type { Devices as DeviceType } from "../../types/Devices";

const statusOptions: DropdownOption[] = [
  { label: "Tất cả trạng thái", value: "ALL" },
  { label: "Trực tuyến", value: "ONLINE" },
  { label: "Ngoại tuyến", value: "OFFLINE" },
  { label: "Cảnh báo / Pin yếu", value: "WARNING" },
];

interface DeviceListProps {
  devices?: DeviceType[];
}

const DeviceList = ({ devices = [] }: DeviceListProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredDevices = devices.filter((device) => {
    const statusUpper = device.status?.toUpperCase() || "";
    if (selectedStatus === "ALL") return true;
    if (selectedStatus === "ONLINE") return statusUpper === "ONLINE" || statusUpper === "ACTIVE" || device.status === "Trực tuyến";
    if (selectedStatus === "OFFLINE") return statusUpper === "OFFLINE" || device.status === "Ngoại tuyến";
    if (selectedStatus === "WARNING") return statusUpper === "WARNING" || device.status === "Pin yếu" || device.status === "Cảnh báo";
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-(--text-heading)">
            Danh sách thiết bị
          </h2>
          <p className="text-xs text-(--text-muted) mt-0.5">
            Hiển thị {filteredDevices.length} / {devices.length} thiết bị
          </p>
        </div>

        {/* Dropdown lọc theo trạng thái */}
        <div className="w-full sm:w-60">
          <Dropdown
            value={selectedStatus}
            options={statusOptions}
            onChange={setSelectedStatus}
            placeholder="Lọc theo trạng thái"
          />
        </div>
      </div>

      {/* Grid danh sách thiết bị */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDevices.map((device) => {
            const statusUpper = device.status?.toUpperCase() || "";
            const statusNorm =
              statusUpper === "ONLINE" || statusUpper === "ACTIVE" || device.status === "Trực tuyến"
                ? "ONLINE"
                : statusUpper === "OFFLINE" || device.status === "Ngoại tuyến"
                ? "OFFLINE"
                : "WARNING";

            return (
              <DeviceCard
                key={device.id}
                code={device.node_code || device.serialNumber}
                name={device.name || device.serialNumber}
                status={statusNorm}
                sensors={device.sensors || ["Cảm biến IoT"]}
                connector={device.connection_type || "Wi-Fi · MQTT"}
                signal={device.signal_strength ?? 85}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-(--panel-border) bg-(--panel-bg) text-center">
          <p className="text-sm text-(--text-muted)">
            Không tìm thấy thiết bị nào với trạng thái đã chọn.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeviceList;

