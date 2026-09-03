import { Radio, Wind, Activity, Cpu } from "lucide-react";
import DeviceItem from "../../../components/DeviceItem";

export type PondDevice = {
  id: string;
  name: string;
  subtitle: string;
  icon: "gateway" | "oxygen" | "ultrasonic";
};

const pondDevices: PondDevice[] = [
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

const PondDevices = () => {
  return (
    <div className="w-full rounded-3xl border border-(--panel-border) bg-(--bg-primary) p-5 shadow-lg">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base text-left md:text-lg font-bold text-(--text-heading)">
          Thiết bị gắn cho vuông
        </h2>
        <Cpu className="h-6 w-6 text-(--accent)" />
      </div>

      {/* Devices List */}
      <div className="divide-y divide-(--divider)">
        {pondDevices.map((device) => (
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


