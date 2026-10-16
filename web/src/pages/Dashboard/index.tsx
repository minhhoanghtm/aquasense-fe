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

const SELECTED_POND_STORAGE_KEY = "dashboard:selectedPondId";

const Dashboard = () => {
  useDocumentTitle("Tổng quan");

  const [selectedPondId, setSelectedPondId] = useState("");
  const { ponds, infoPond, allAlerts, loading: pondsLoading, error: pondsError, alertsError: allAlertsError } = usePonds();
  const { pond, device, loading: pondLoading, error: pondError } = usePond(selectedPondId);
  const { waterQuality, loading: waterQualityLoading, error: waterQualityError } = useWaterQuality(selectedPondId);
  const { alerts, loading: alertsLoading, error: alertsError } = usePondAlerts(selectedPondId);

  useEffect(() => {
    if (pondsLoading) return;

    const allowedPondIds = new Set(ponds.map((pond) => pond.id).filter(Boolean));

    if (selectedPondId && allowedPondIds.has(selectedPondId)) return;

    if (ponds.length === 0) {
      setSelectedPondId("");
      localStorage.removeItem(SELECTED_POND_STORAGE_KEY);
      return;
    }

    const savedPondId = localStorage.getItem(SELECTED_POND_STORAGE_KEY);
    const unresolvedAlerts = allAlerts.filter((alert) => alert.status?.toUpperCase() !== "RESOLVED");
    const severity = (level?: string) => ({ CRITICAL: 4, DANGER: 3, HIGH: 2, WARNING: 1 }[level?.toUpperCase() || ""] || 0);
    const highestSeverity = Math.max(0, ...unresolvedAlerts.map((alert) => severity(alert.alertLevel || alert.level)));
    const alertPondId = highestSeverity
      ? ponds.find((pond) => unresolvedAlerts.some(
        (alert) => alert.pondId === pond.id && severity(alert.alertLevel || alert.level) === highestSeverity,
      ))?.id
      : undefined;

    setSelectedPondId(
      savedPondId && allowedPondIds.has(savedPondId)
        ? savedPondId
        : alertPondId || ponds[0].id || "",
    );
  }, [allAlerts, ponds, pondsLoading, selectedPondId]);

  const handleSelectPond = (pondId: string) => {
    if (!ponds.some((pond) => pond.id === pondId)) return;
    localStorage.setItem(SELECTED_POND_STORAGE_KEY, pondId);
    setSelectedPondId(pondId);
  };

  if (pondsLoading) {
    return <div className="w-full p-6 text-sm text-[var(--text-muted)]">Đang tải danh sách ao nuôi...</div>;
  }

  if (pondsError) {
    return <div className="w-full p-6 text-sm text-[var(--critical)]">Không thể tải danh sách ao nuôi: {pondsError}</div>;
  }

  if (ponds.length === 0) {
    return <div className="w-full p-6 text-sm text-[var(--text-muted)]">Chưa có ao nuôi để hiển thị.</div>;
  }

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
      {allAlertsError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-sm text-rose-200">
          Không thể tải cảnh báo: {allAlertsError}
        </div>
      )}
      <div>
        <WaterQualityGrid waterQuality={waterQuality} loading={waterQualityLoading || pondLoading} error={waterQualityError || pondError} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">
          <WaterQualityChart waterQuality={waterQuality} loading={waterQualityLoading} error={waterQualityError} />
          <PondList ponds={ponds} infoPond={infoPond} alerts={allAlerts} selectedPondId={selectedPondId} onSelectPond={handleSelectPond} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-5">
          <AIPrediction pondId={selectedPondId} pond={pond} />
          <AlertsPond alerts={alerts} loading={alertsLoading} error={alertsError} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
