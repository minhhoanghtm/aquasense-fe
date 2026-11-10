import { useEffect, useMemo, useState } from "react";
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
import { useTelemetryRealtime } from "../../hooks/useTelemetryRealtime";

const SELECTED_POND_STORAGE_KEY = "dashboard:selectedPondId";

const Dashboard = () => {
  useDocumentTitle("Tổng quan");

  const [selectedPondId, setSelectedPondId] = useState("");
  const { ponds, infoPond, allAlerts, loading: pondsLoading, error: pondsError, alertsError: allAlertsError } = usePonds();
  const { pond, device, loading: pondLoading, error: pondError } = usePond(selectedPondId);
  const { waterQuality, loading: waterQualityLoading, error: waterQualityError } = useWaterQuality(selectedPondId);
  const { alerts, loading: alertsLoading, error: alertsError } = usePondAlerts(selectedPondId);
  useTelemetryRealtime(selectedPondId);

  // Lọc chính xác các cảnh báo thuộc về ao nuôi đang được chọn
  const pondAlerts = useMemo(() => {
    if (!selectedPondId) return [];
    const source = alerts.length > 0 ? alerts : allAlerts;
    const currentPondName = pond?.name || pond?.pondName;

    return source.filter((a) => {
      const aPondId = a.pondId || (a as any).pond_id || (a as any).pond?.id || (a as any).pond?.pondId;
      if (aPondId && (aPondId === selectedPondId || (pond && (aPondId === pond.id || aPondId === pond.pondId)))) {
        return true;
      }
      if (currentPondName && a.pondName && a.pondName.trim().toLowerCase() === currentPondName.trim().toLowerCase()) {
        return true;
      }
      return false;
    });
  }, [alerts, allAlerts, selectedPondId, pond]);

  // Lọc và sắp xếp 4 ao nuôi tiêu biểu: ưu tiên trạng thái đặc biệt (cảnh báo nguy hiểm / cảnh báo vàng / trạng thái khác thường) hoặc cập nhật gần nhất
  const dashboardPonds = useMemo(() => {
    if (!ponds || ponds.length === 0) return [];

    const getPondAlertScore = (p: typeof ponds[0]) => {
      const pId = p.id || p.pondId;
      const pondAlerts = allAlerts.filter(
        (a) => a.pondId === pId && a.status?.toUpperCase() !== "RESOLVED"
      );
      if (pondAlerts.some((a) => a.alertLevel === "CRITICAL" || a.alertLevel === "DANGER" || a.level === "CRITICAL" || a.level === "DANGER")) {
        return 1000;
      }
      if (pondAlerts.some((a) => a.alertLevel === "WARNING" || a.level === "WARNING")) {
        return 500;
      }
      if (p.status?.toUpperCase() === "HARVESTED") return 200;
      return 0;
    };

    const getPondTime = (p: typeof ponds[0]) => {
      const t = p.updatedAt || p.createdAt;
      return t ? new Date(t).getTime() : 0;
    };

    const sorted = [...ponds].sort((a, b) => {
      const scoreDiff = getPondAlertScore(b) - getPondAlertScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return getPondTime(b) - getPondTime(a);
    });

    const top4 = sorted.slice(0, 4);

    // Nếu người dùng đang chọn 1 ao cụ thể và ao đó không nằm trong top 4,
    // giữ ao đó ở vị trí thứ 4 để người dùng luôn thấy thẻ của ao đang hiển thị biểu đồ
    if (selectedPondId && !top4.some((p) => (p.id || p.pondId) === selectedPondId)) {
      const activePond = ponds.find((p) => (p.id || p.pondId) === selectedPondId);
      if (activePond) {
        top4[3] = activePond;
      }
    }

    return top4;
  }, [ponds, allAlerts, selectedPondId]);

  useEffect(() => {
    if (pondsLoading) return;

    if (dashboardPonds.length === 0) {
      setSelectedPondId("");
      localStorage.removeItem(SELECTED_POND_STORAGE_KEY);
      return;
    }

    const allowedPondIds = new Set(dashboardPonds.map((p) => p.id).filter(Boolean));

    if (selectedPondId && allowedPondIds.has(selectedPondId)) return;

    const savedPondId = localStorage.getItem(SELECTED_POND_STORAGE_KEY);
    if (savedPondId && allowedPondIds.has(savedPondId)) {
      setSelectedPondId(savedPondId);
      return;
    }

    // Mặc định chọn ao đầu tiên trong top 4 (ao có cảnh báo nguy cấp nhất hoặc vừa cập nhật nhất)
    const defaultPondId = dashboardPonds[0]?.id || "";
    setSelectedPondId(defaultPondId);
  }, [dashboardPonds, pondsLoading, selectedPondId]);

  const handleSelectPond = (pondId: string) => {
    if (!ponds.some((pond) => pond.id === pondId)) return;
    localStorage.setItem(SELECTED_POND_STORAGE_KEY, pondId);
    setSelectedPondId(pondId);
  };

  if (pondsLoading) {
    return <div className="w-full p-6 text-sm text-[var(--text-muted)]">Đang tải danh sách ao nuôi...</div>;
  }

  if (ponds.length === 0) {
    return <div className="w-full p-6 text-sm text-[var(--text-muted)]">Chưa có ao nuôi để hiển thị.</div>;
  }

  if (pondsError) {
    return <div className="w-full p-6 text-sm text-[var(--critical)]">Không thể tải danh sách ao nuôi: {pondsError}</div>;
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        <div className="lg:col-span-2 flex flex-col justify-between h-full gap-4 sm:gap-5">
          <WaterQualityChart waterQuality={waterQuality} loading={waterQualityLoading} error={waterQualityError} />
          <PondList
            ponds={dashboardPonds}
            totalPondsCount={ponds.length}
            infoPond={infoPond}
            alerts={allAlerts}
            selectedPondId={selectedPondId}
            onSelectPond={handleSelectPond}
          />
        </div>
        <div className="lg:col-span-1 flex flex-col h-full gap-4 sm:gap-5">
          <AIPrediction pondId={selectedPondId} pond={pond} alerts={pondAlerts} />
          <AlertsPond
            alerts={pondAlerts}
            pondId={selectedPondId}
            pondName={pond?.name || pond?.pondName}
            loading={alertsLoading}
            error={alertsError}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
