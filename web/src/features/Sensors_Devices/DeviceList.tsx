import { useState } from "react";
import DeviceCard from "../../components/DeviceCard";
import Dropdown, { type DropdownOption } from "../../components/Dropdown";

const statusOptions: DropdownOption[] = [
  { label: "Tất cả trạng thái", value: "ALL" },
  { label: "Trực tuyến", value: "ONLINE" },
  { label: "Ngoại tuyến", value: "OFFLINE" },
  { label: "Cảnh báo / Pin yếu", value: "WARNING" },
];

const devices = [
  {
    device_id: 1,
    node_code: "NODE-A1-001",
    name: "Gateway ESP32-A1",
    sensors: ["Mẫu pH", "DS18B20 nhiệt độ", "Mẫu DO"],
    connection_type: "Wi-Fi · MQTT",
    status: "Trực tuyến",
    signal_strength: 94,
  },
  {
    device_id: 2,
    node_code: "NODE-B2-002",
    name: "Gateway ESP32-B2",
    sensors: ["Mẫu pH", "Độ đục", "Mực nước"],
    connection_type: "Wi-Fi · MQTT",
    status: "Trực tuyến",
    signal_strength: 82,
  },
  {
    device_id: 3,
    node_code: "DO-PROBE-004",
    name: "Mẫu DO A1-04",
    sensors: ["Oxy hòa tan"],
    connection_type: "LoRaWAN",
    status: "Pin yếu",
    signal_strength: 18,
  },
  {
    device_id: 4,
    node_code: "ULTRA-D3-001",
    name: "Mực nước D3-01",
    sensors: ["Cảm biến siêu âm"],
    connection_type: "Wi-Fi",
    status: "Ngoại tuyến",
    signal_strength: 0,
  },
  {
    device_id: 5,
    node_code: "TURB-C1-003",
    name: "Mẫu độ đục C1",
    sensors: ["Cảm biến độ đục"],
    connection_type: "LoRaWAN",
    status: "Trực tuyến",
    signal_strength: 76,
  },
  {
    device_id: 6,
    node_code: "WX-FARM-001",
    name: "Trạm thời tiết",
    sensors: ["Mưa", "Gió", "Nhiệt độ"],
    connection_type: "Wi-Fi",
    status: "Trực tuyến",
    signal_strength: 88,
  },
];

const DeviceList = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredDevices = devices.filter((device) => {
    if (selectedStatus === "ALL") return true;
    if (selectedStatus === "ONLINE") return device.status === "Trực tuyến";
    if (selectedStatus === "OFFLINE") return device.status === "Ngoại tuyến";
    if (selectedStatus === "WARNING") return device.status === "Pin yếu" || device.status === "Cảnh báo";
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
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.device_id}
              code={device.node_code}
              name={device.name}
              status={
                device.status === "Trực tuyến"
                  ? "ONLINE"
                  : device.status === "Ngoại tuyến"
                  ? "OFFLINE"
                  : "WARNING"
              }
              sensors={device.sensors}
              connector={device.connection_type}
              signal={device.signal_strength}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-(--panel-border) bg-(--bg-primary) text-center">
          <p className="text-sm text-(--text-muted)">
            Không tìm thấy thiết bị nào với trạng thái đã chọn.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeviceList;

