import { memo } from "react";
import { Radio, Wind, Activity, Cpu } from "lucide-react";
import DeviceItem from "../../../components/DeviceItem";
import type { Devices } from "../../../types/Devices";

export type PondDevice = {
  id: string;
  name: string;
  subtitle: string;
  icon: "gateway" | "oxygen" | "ultrasonic";
};

const deviceIcons = {
  gateway: <Radio className="w-5 h-5" />,
  oxygen: <Wind className="w-5 h-5" />,
  ultrasonic: <Activity className="w-5 h-5" />,
};

interface PondDevicesProps {
  devices?: Devices[];
}

const PondDevices = memo(({ devices = [] }: PondDevicesProps) => {
  const displayDevices =
    devices.length > 0
      ? devices.map((d) => {
          const devName = d.name || d.deviceName || d.serialNumber || d.macAddress || "Thiết bị";
          const nameLower = devName.toLowerCase();
          const iconType: "gateway" | "oxygen" | "ultrasonic" =
            nameLower.includes("do") || nameLower.includes("oxygen") || nameLower.includes("oxy")
              ? "oxygen"
              : nameLower.includes("ultra") || nameLower.includes("siêu âm") || nameLower.includes("mực")
              ? "ultrasonic"
              : "gateway";

          return {
            id: d.id,
            name: devName,
            subtitle: `${d.sensors?.length ?? 0} cảm biến${d.connection_type ? ` · ${d.connection_type}` : ""}`,
            icon: iconType,
          };
        })
      : [];

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
        {displayDevices.length > 0 ? displayDevices.map((device) => (
          <DeviceItem
            key={device.id}
            icon={deviceIcons[device.icon]}
            title={device.name}
            subtitle={device.subtitle}
          />
        )) : <p className="py-3 text-sm text-(--text-muted)">Chưa có thiết bị được gắn cho ao này.</p>}
      </div>
    </div>
  );
});
PondDevices.displayName = "PondDevices";

export default PondDevices;


