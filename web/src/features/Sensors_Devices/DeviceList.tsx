import { useState } from "react";
import DeviceCard from "../../components/DeviceCard";
import Dropdown, { type DropdownOption } from "../../components/Dropdown";
import type { Devices as DeviceType } from "../../types/Devices";
import { Plus } from "lucide-react";

const statusOptions: DropdownOption[] = [
  { label: "Tất cả trạng thái", value: "ALL" },
  { label: "Trực tuyến", value: "ONLINE" },
  { label: "Ngoại tuyến", value: "OFFLINE" },
  { label: "Cảnh báo / Pin yếu", value: "WARNING" },
];

interface DeviceListProps {
  devices?: DeviceType[];
  onAddNew?: () => void;
  onEditDevice?: (device: DeviceType) => void;
  onDeleteDevice?: (device: DeviceType) => void;
}

const DeviceList = ({
  devices = [],
  onAddNew,
  onEditDevice,
  onDeleteDevice,
}: DeviceListProps) => {
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
    <div className="flex flex-col gap-4 text-left">
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

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Dropdown lọc theo trạng thái */}
          <div className="w-full sm:w-56">
            <Dropdown
              value={selectedStatus}
              options={statusOptions}
              onChange={setSelectedStatus}
              placeholder="Lọc theo trạng thái"
            />
          </div>

          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#2dd4c3] to-[#159d96] text-[#041920] text-xs font-bold hover:brightness-110 shadow-lg shadow-[#2dd4c3]/20 transition cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Thêm thiết bị</span>
            </button>
          )}
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
                code={device.node_code || device.serialNumber || device.macAddress || device.id}
                name={device.name || device.deviceName || device.serialNumber || "Thiết bị cảm biến"}
                status={statusNorm}
                sensors={device.sensors || ["Cảm biến IoT"]}
                connector={device.connection_type || "Wi-Fi · MQTT"}
                signal={device.signal_strength ?? 85}
                onEdit={onEditDevice ? () => onEditDevice(device) : undefined}
                onDelete={onDeleteDevice ? () => onDeleteDevice(device) : undefined}
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

