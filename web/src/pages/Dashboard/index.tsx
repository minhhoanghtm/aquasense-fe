import { useEffect, useState } from "react";
import Title from "../../components/Title";
import WaterQualityGrid from "../../features/Dashboard/components/WaterQualityGrid";
import WaterQualityChart from "../../features/Dashboard/components/WaterQualityChart";
import AlertsPond from "../../features/Dashboard/components/AlertsPond";
import AIPrediction from "../../features/Dashboard/components/AIPrediction";
import PondList from "../../features/Dashboard/components/PondList";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useWaterQuality } from "../../hooks/useWaterQuality";
import { usePondAlerts } from "../../hooks/usePondAlerts";

const Dashboard = () => {
  useDocumentTitle("Tổng quan");

  const [selectedPond, setSelectedPond] = useState("");
  const { ponds, infoPond, allAlerts } = usePonds();
  const { pond, device } = usePond(selectedPond);
  const { waterQuality } = useWaterQuality(selectedPond);
  const { alerts } = usePondAlerts(selectedPond);

  useEffect(() => {
    if (ponds.length > 0 && !selectedPond) {
      setSelectedPond(ponds[0].id);
    }
  }, [ponds, selectedPond]);

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5">
      <div>
        <Title
          title="Tổng quan"
          description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
          pond={pond}
          device={device}
        />
      </div>
      <div>
        <WaterQualityGrid waterQuality={waterQuality} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">
          <WaterQualityChart waterQuality={waterQuality} />
          <PondList infoPond={infoPond} alerts={allAlerts} onSelectPond={setSelectedPond} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-5">
          <AIPrediction pond={pond} waterQuality={waterQuality} />
          <AlertsPond alerts={alerts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
