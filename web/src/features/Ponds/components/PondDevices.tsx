import { Radio, Wind, Activity, Cpu } from "lucide-react";
import DeviceItem from "../../../components/DeviceItem";
import type { Devices } from "../../../types/Devices";

export type PondDevice = {
  id: string;
  name: string;
  subtitle: string;
  icon: "gateway" | "oxygen" | "ultrasonic";
};

const defaultPondDevices: PondDevice[] = [
  {
    id: "GW-ESP32-A1",
    name: "Gateway ESP32-A1",
    subtitle: "6 cảm biến · Wi-Fi",
    icon: "gateway",
  },
  {
    id: "DO-A1-04",
    name: "Mẫu DO A1-04",
    subtitle: "Trực tuyến · 2 phút trước",
    icon: "oxygen",
  },
  {
    id: "ULTRASONIC-A1",
    name: "Cảm biến siêu âm",
    subtitle: "Trực tuyến · 2 phút trước",
    icon: "ultrasonic",
  },
];

const deviceIcons = {
  gateway: <Radio className="w-5 h-5" />,
  oxygen: <Wind className="w-5 h-5" />,
  ultrasonic: <Activity className="w-5 h-5" />,
};

interface PondDevicesProps {
  devices?: Devices[];
}

const PondDevices = ({ devices = [] }: PondDevicesProps) => {
  const displayDevices =
    devices.length > 0
      ? devices.map((d) => {
          const nameLower = (d.name || d.serialNumber).toLowerCase();
          const iconType: "gateway" | "oxygen" | "ultrasonic" =
            nameLower.includes("do") || nameLower.includes("oxygen") || nameLower.includes("oxy")
              ? "oxygen"
              : nameLower.includes("ultra") || nameLower.includes("siêu âm") || nameLower.includes("mực")
              ? "ultrasonic"
              : "gateway";

          return {
            id: d.id,
            name: d.name || d.serialNumber,
            subtitle: `${d.sensors?.length || 1} cảm biến · ${d.connection_type || "Wi-Fi"}`,
            icon: iconType,
          };
        })
      : defaultPondDevices;

  return (
    <div className="w-full rounded-3xl border border-(--panel-border) bg-(--panel-bg) p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base text-left md:text-lg font-bold text-(--text-heading)">
          Thiết bị gắn cho vuông
        </h2>
        <Cpu className="h-6 w-6 text-(--accent)" />
      </div>

      {/* Devices List */}
      <div className="divide-y divide-(--divider)">
        {displayDevices.map((device) => (
          <DeviceItem
            key={device.id}
            icon={deviceIcons[device.icon]}
            title={device.name}
            subtitle={device.subtitle}
          />
        ))}
      </div>
    </div>
  );
};

export default PondDevices;


