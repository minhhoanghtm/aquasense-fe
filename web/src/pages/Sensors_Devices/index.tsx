import { useState, useMemo, useEffect, useCallback } from "react";
import Title from "../../components/Title";
import DeviceKPIStats, {
  type KPIFilterType,
} from "../../features/Sensors_Devices/DeviceKPIStats";
import DeviceFilterBar, {
  type DeviceFilterValues,
  type ViewMode,
} from "../../features/Sensors_Devices/DeviceFilterBar";
import DeviceTableView from "../../features/Sensors_Devices/DeviceTableView";
import DeviceCardView from "../../features/Sensors_Devices/DeviceCardView";
import DevicePagination from "../../features/Sensors_Devices/DevicePagination";
import DeviceDetailDrawer from "../../features/Sensors_Devices/DeviceDetailDrawer";
import DeviceFormModal from "../../features/Sensors_Devices/DeviceFormModal";
import ReportFaultModal from "../../features/Sensors_Devices/ReportFaultModal";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useDevices, invalidateDevicesCache } from "../../hooks/useDevices";
import { useTelemetryRealtime } from "../../hooks/useTelemetryRealtime";
import {
  createDevice,
  updateDevice,
  deleteDevice,
  reportDeviceFault,
} from "../../services/deviceApi";
import { getFarms } from "../../services/farmApi";
import type { Devices as DeviceType } from "../../types/Devices";
import type { Farm, FarmFilterOption } from "../../types/Farm";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Plus,
  RefreshCw,
} from "lucide-react";
import { getCurrentUser } from "../../services/authApi";
import { canManageDevices, canReadFarmDirectory } from "../../lib/rolePermissions";
import {
  getDeviceTypeInfo,
  getConnectionStatus,
  getDeviceCondition,
} from "../../features/Sensors_Devices/deviceUtils";

export default function Devices() {
  useDocumentTitle("Cảm biến & Thiết bị – AquaSense");

  const currentUser = getCurrentUser();
  const roleUpper = currentUser?.role?.toUpperCase();
  const isAdmin = roleUpper === "ADMIN";
  const isManager = roleUpper === "MANAGER";
  const isFarmer = roleUpper === "FARMER";
  const canManage = canManageDevices(roleUpper);
  const canReadFarms = canReadFarmDirectory(roleUpper);

  // Data fetching
  const { ponds, loading: pondsLoading } = usePonds();
  const pondIds = useMemo(
    () => ponds.map((p) => p.id || p.pondId).filter((id): id is string => Boolean(id)),
    [ponds],
  );
  const selectedPondId = ponds.length > 0 ? ponds[0].id || ponds[0].pondId || "" : "";
  const { pond, device } = usePond(selectedPondId);
  const { devices, loading: devicesLoading, error: devicesError, refetch } = useDevices();
  useTelemetryRealtime(pondIds.length > 0 ? pondIds : (selectedPondId || undefined));

  // The Backend limits the farm directory to ADMIN/MANAGER. FARMER filters are
  // derived below from the ponds already returned by the scoped /ponds API.
  const [farms, setFarms] = useState<Farm[]>([]);
  useEffect(() => {
    if (!canReadFarms) {
      return;
    }

    let isMounted = true;
    getFarms({ limit: 100 })
      .then((res) => {
        if (isMounted && res?.data) {
          setFarms(res.data);
        }
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách trại nuôi:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [canReadFarms]);

  const filterFarms = useMemo<FarmFilterOption[]>(() => {
    if (canReadFarms) {
      return farms.map(({ farmId, farmName }) => ({ farmId, farmName }));
    }

    const scopedFarms = new Map<string, FarmFilterOption>();
    ponds.forEach((pond) => {
      if (!pond.farmId || scopedFarms.has(pond.farmId)) return;
      const pondName = pond.pondName || pond.name;
      scopedFarms.set(pond.farmId, {
        farmId: pond.farmId,
        farmName: pondName ? `Trại nuôi của ao ${pondName}` : "Trại nuôi được phân công",
      });
    });
    return [...scopedFarms.values()];
  }, [canReadFarms, farms, ponds]);

  // Farm Map mapping for quick lookup: [farmId -> farmName] and [pondId -> farmName]
  const farmMap = useMemo(() => {
    const map: Record<string, string> = {};
    filterFarms.forEach((f) => {
      if (f.farmId) map[f.farmId] = f.farmName;
    });
    ponds.forEach((p) => {
      const pId = p.pondId || p.id;
      if (pId && p.farmId && map[p.farmId]) {
        map[pId] = map[p.farmId];
      }
    });
    return map;
  }, [filterFarms, ponds]);

  // Authorized devices based on role
  const allowedPondIds = useMemo(
    () => new Set(ponds.map((p) => p.id || p.pondId)),
    [ponds]
  );

  const authorizedDevices = useMemo(() => {
    if (isAdmin) return devices;
    if (isFarmer || isManager) {
      return devices.filter((d) => d.pondId && allowedPondIds.has(d.pondId));
    }
    return devices;
  }, [isAdmin, isFarmer, isManager, devices, allowedPondIds]);

  // KPI counts (Non-overlapping & synchronized)
  const activeStats = useMemo(() => {
    const total = authorizedDevices.length;
    const active = authorizedDevices.filter((d) => {
      const conn = getConnectionStatus(d.status);
      return conn.isOnline;
    }).length;
    const offline = authorizedDevices.filter((d) => {
      const conn = getConnectionStatus(d.status);
      const cond = getDeviceCondition(d.status, d.signal_strength, d.battery_level);
      return !conn.isOnline && cond.condition !== "MAINTENANCE";
    }).length;
    const warning = authorizedDevices.filter((d) => {
      const cond = getDeviceCondition(d.status, d.signal_strength, d.battery_level);
      return cond.condition === "WARNING" || cond.condition === "MAINTENANCE";
    }).length;
    return { total, active, offline, warning };
  }, [authorizedDevices]);

  // View Mode: Table View (default on Desktop) or Card View (Persisted in localStorage)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("aquasense_device_view_mode");
    return saved === "card" ? "card" : "table";
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("aquasense_device_view_mode", mode);
    // Smooth page size adaptation
    if (mode === "card" && pageSize === 10) {
      setPageSize(9);
    } else if (mode === "table" && pageSize === 9) {
      setPageSize(10);
    }
  };

  // Filter & Search states
  const [filters, setFilters] = useState<DeviceFilterValues>({
    search: "",
    farmId: "ALL",
    pondId: "ALL",
    deviceType: "ALL",
    connection: "ALL",
    condition: "ALL",
    sortBy: "updated_desc",
  });

  const effectiveFilters = useMemo<DeviceFilterValues>(() => {
    if (!pondsLoading && filters.pondId !== "ALL" && !allowedPondIds.has(filters.pondId)) {
      return { ...filters, pondId: "ALL" };
    }
    return filters;
  }, [allowedPondIds, filters, pondsLoading]);

  const [kpiFilter, setKpiFilter] = useState<KPIFilterType>("ALL");

  const handleKpiFilterChange = (newKpi: KPIFilterType) => {
    setKpiFilter(newKpi);
    setCurrentPage(1);

    if (newKpi === "ALL") {
      setFilters((prev) => ({
        ...prev,
        connection: "ALL",
        condition: "ALL",
      }));
    } else if (newKpi === "ONLINE") {
      setFilters((prev) => ({
        ...prev,
        connection: "ONLINE",
        condition: "ALL",
      }));
    } else if (newKpi === "OFFLINE") {
      setFilters((prev) => ({
        ...prev,
        connection: "OFFLINE",
        condition: "ALL",
      }));
    } else if (newKpi === "ALERT_OR_FAULT") {
      setFilters((prev) => ({
        ...prev,
        connection: "ALL",
        condition: "ALL",
      }));
    }
  };

  const handleFilterChange = (newFilters: DeviceFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
    if (newFilters.connection === "ALL" && newFilters.condition === "ALL") {
      setKpiFilter("ALL");
    } else if (newFilters.connection === "ONLINE") {
      setKpiFilter("ONLINE");
    } else if (newFilters.connection === "OFFLINE") {
      setKpiFilter("OFFLINE");
    }
  };

  // Execute filtering & sorting
  const filteredAndSortedDevices = useMemo(() => {
    let result = [...authorizedDevices];

    // 1. Search Query
    if (effectiveFilters.search.trim()) {
      const q = effectiveFilters.search.trim().toLowerCase();
      result = result.filter((d) => {
        const name = (d.name || d.deviceName || "").toLowerCase();
        const mac = (d.macAddress || "").toLowerCase();
        const code = (d.node_code || d.id || "").toLowerCase();
        const pName = (d.pond?.pondName || "").toLowerCase();
        const fName = (
          d.pond?.farm?.farmName ||
          (d.pond?.farmId && farmMap[d.pond.farmId]) ||
          ""
        ).toLowerCase();
        return (
          name.includes(q) ||
          mac.includes(q) ||
          code.includes(q) ||
          pName.includes(q) ||
          fName.includes(q)
        );
      });
    }

    // 2. Filter by Farm
    if (effectiveFilters.farmId && effectiveFilters.farmId !== "ALL") {
      result = result.filter((d) => {
        const farmId =
          d.pond?.farmId ||
          (d.pondId &&
            ponds.find((p) => (p.pondId || p.id) === d.pondId)?.farmId);
        return farmId === effectiveFilters.farmId;
      });
    }

    // 3. Filter by Pond
    if (effectiveFilters.pondId && effectiveFilters.pondId !== "ALL") {
      result = result.filter((d) => d.pondId === effectiveFilters.pondId);
    }

    // 4. Filter by Device Type
    if (effectiveFilters.deviceType && effectiveFilters.deviceType !== "ALL") {
      result = result.filter(
        (d) => getDeviceTypeInfo(d).key === effectiveFilters.deviceType
      );
    }

    // 5. Filter by Connection Status
    if (effectiveFilters.connection && effectiveFilters.connection !== "ALL") {
      result = result.filter((d) => {
        const conn = getConnectionStatus(d.status);
        return effectiveFilters.connection === "ONLINE" ? conn.isOnline : !conn.isOnline;
      });
    }

    // 6. Filter by Condition / KPI Alert
    if (effectiveFilters.condition && effectiveFilters.condition !== "ALL") {
      result = result.filter((d) => {
        const cond = getDeviceCondition(
          d.status,
          d.signal_strength,
          d.battery_level
        );
        return cond.condition === effectiveFilters.condition;
      });
    } else if (kpiFilter === "ALERT_OR_FAULT") {
      result = result.filter((d) => {
        const cond = getDeviceCondition(
          d.status,
          d.signal_strength,
          d.battery_level
        );
        return cond.condition === "WARNING" || cond.condition === "MAINTENANCE";
      });
    }

    // 7. Sorting
    result.sort((a, b) => {
      if (effectiveFilters.sortBy === "name_asc") {
        const nameA = a.name || a.deviceName || "";
        const nameB = b.name || b.deviceName || "";
        return nameA.localeCompare(nameB, "vi");
      }
      if (effectiveFilters.sortBy === "name_desc") {
        const nameA = a.name || a.deviceName || "";
        const nameB = b.name || b.deviceName || "";
        return nameB.localeCompare(nameA, "vi");
      }
      if (effectiveFilters.sortBy === "status") {
        const connA = getConnectionStatus(a.status).isOnline ? 1 : 0;
        const connB = getConnectionStatus(b.status).isOnline ? 1 : 0;
        return connB - connA;
      }
      // default: updated_desc
      const timeA = new Date(
        a.lastActiveAt || a.updatedAt || a.createdAt || 0
      ).getTime();
      const timeB = new Date(
        b.lastActiveAt || b.updatedAt || b.createdAt || 0
      ).getTime();
      return timeB - timeA;
    });

    return result;
  }, [authorizedDevices, effectiveFilters, kpiFilter, farmMap, ponds]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => (viewMode === "card" ? 9 : 10));

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedDevices.length / pageSize)
  );

  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedDevices.slice(start, start + pageSize);
  }, [filteredAndSortedDevices, currentPage, pageSize]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback(
    (text: string, type: "success" | "error" | "info" = "success") => {
      setToastMessage({ text, type });
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    },
    []
  );

  // Modals & Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceType | null>(null);

  const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
  const [faultDevice, setFaultDevice] = useState<DeviceType | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);

  // Handlers
  const handleAddNew = () => {
    setEditingDevice(null);
    setIsFormOpen(true);
  };

  const handleEditDevice = (dev: DeviceType) => {
    setEditingDevice(dev);
    setIsFormOpen(true);
  };

  const handleViewDetail = (dev: DeviceType) => {
    setSelectedDevice(dev);
    setIsDrawerOpen(true);
  };

  const handleOpenReportFault = (dev: DeviceType) => {
    setFaultDevice(dev);
    setIsFaultModalOpen(true);
  };

  const handleSubmitReportFault = async (deviceId: string, reason: string) => {
    await reportDeviceFault(deviceId, reason);
    showToast(
      "Đã gửi báo cáo sự cố thiết bị thành công! Thiết bị đã chuyển sang trạng thái bảo trì.",
      "success"
    );
    invalidateDevicesCache();
    refetch();
  };

  const handleDeleteDevice = async (dev: DeviceType) => {
    const devId = dev.deviceId || dev.id;
    if (!devId) {
      showToast("Thiết bị không có ID hợp lệ.", "error");
      return;
    }
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa thiết bị "${dev.name || dev.deviceName}"?`
      )
    ) {
      try {
        await deleteDevice(devId);
        showToast(
          `Đã xóa thiết bị "${dev.name || dev.deviceName}" thành công!`,
          "success"
        );
        invalidateDevicesCache();
        refetch();
        if (selectedDevice?.deviceId === devId) {
          setIsDrawerOpen(false);
        }
      } catch (err: any) {
        showToast(err.message || "Không thể xóa thiết bị", "error");
      }
    }
  };

  const handleSaveDevice = async (data: {
    deviceName: string;
    macAddress: string;
    pondId: string;
    firmwareVersion?: string;
    status?: string;
  }) => {
    if (editingDevice) {
      const devId = editingDevice.deviceId || editingDevice.id;
      if (!devId) throw new Error("Thiết bị không có ID hợp lệ.");
      await updateDevice(devId, data);
      showToast(`Đã cập nhật thiết bị "${data.deviceName}" thành công!`, "success");
    } else {
      await createDevice(data);
      showToast(`Đã đăng ký thiết bị mới "${data.deviceName}" thành công!`, "success");
    }
    invalidateDevicesCache();
    refetch();
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 relative text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold animate-slideDown backdrop-blur-md ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-950/50"
              : toastMessage.type === "error"
              ? "bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-950/50"
              : "bg-cyan-950/90 text-cyan-200 border-cyan-500/50 shadow-cyan-950/50"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Section: Title & Top Management Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <Title
          title="Cảm biến & Thiết bị"
          description="Theo dõi, quản lý và giám sát thiết bị IoT trong các trại nuôi."
          pond={pond}
          device={device}
        />

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={devicesLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-[var(--panel-border)] bg-[#041a22] text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-[#07242f] transition cursor-pointer shadow-md disabled:opacity-50"
            title="Làm mới dữ liệu thiết bị"
          >
            <RefreshCw
              size={14}
              className={devicesLoading ? "animate-spin text-cyan-400" : ""}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {/* Add Device Button (Admin, Manager only) */}
          {canManage && (
            <button
              type="button"
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#041920] text-xs font-bold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm thiết bị</span>
            </button>
          )}
        </div>
      </div>

      {/* Thông báo cho Nông dân khi chưa được phân công ao nào */}
      {isFarmer && !pondsLoading && ponds.length === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-3xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 shadow-md">
          <Info className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="text-xs sm:text-sm">
            Tài khoản Nông dân của bạn hiện chưa được phân công quản lý vuông nuôi nào. Vui lòng liên hệ Quản lý trang trại để được phân công phụ trách vuông nuôi.
          </p>
        </div>
      )}

      {/* Error Notice if API fails */}
      {devicesError && (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{devicesError}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-900/40 text-xs font-bold hover:bg-rose-900/70 transition cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Khu vực B – Thống kê tổng quan (Interactive KPI Cards) */}
      <DeviceKPIStats
        total={activeStats.total}
        active={activeStats.active}
        offline={activeStats.offline}
        warning={activeStats.warning}
        loading={devicesLoading}
        activeFilter={kpiFilter}
        onFilterChange={handleKpiFilterChange}
      />

      {/* Khu vực C – Bộ lọc và tìm kiếm (Filter Bar with View Mode Toggle) */}
      <DeviceFilterBar
        filters={effectiveFilters}
        onFilterChange={handleFilterChange}
        farms={filterFarms}
        ponds={ponds}
        totalResults={filteredAndSortedDevices.length}
        totalDevices={authorizedDevices.length}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* Khu vực D – Danh sách thiết bị (Table View hoặc Card View) */}
      {viewMode === "table" ? (
        <DeviceTableView
          devices={paginatedDevices}
          loading={devicesLoading}
          canManage={canManage}
          onViewDetail={handleViewDetail}
          onEditDevice={canManage ? handleEditDevice : undefined}
          onDeleteDevice={canManage ? handleDeleteDevice : undefined}
          onReportFault={handleOpenReportFault}
          farmMap={farmMap}
        />
      ) : (
        <DeviceCardView
          devices={paginatedDevices}
          loading={devicesLoading}
          canManage={canManage}
          onViewDetail={handleViewDetail}
          onEditDevice={canManage ? handleEditDevice : undefined}
          onDeleteDevice={canManage ? handleDeleteDevice : undefined}
          onReportFault={handleOpenReportFault}
          farmMap={farmMap}
        />
      )}

      {/* Khu vực E – Phân trang */}
      <DevicePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredAndSortedDevices.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={
          viewMode === "card" ? [9, 18, 36] : [10, 20, 50, 100]
        }
      />

      {/* Khu vực F – Chi tiết thiết bị (Slide-out Drawer) */}
      <DeviceDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
        canManage={canManage}
        onEditDevice={handleEditDevice}
        onDeleteDevice={handleDeleteDevice}
        onReportFault={handleOpenReportFault}
        farmMap={farmMap}
      />

      {/* Modal Thêm/Sửa thiết bị */}
      <DeviceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveDevice}
        initialData={editingDevice}
        ponds={ponds}
      />

      {/* Modal Báo cáo thiết bị hỏng */}
      <ReportFaultModal
        isOpen={isFaultModalOpen}
        onClose={() => {
          setIsFaultModalOpen(false);
          setFaultDevice(null);
        }}
        device={faultDevice}
        onSubmit={handleSubmitReportFault}
      />
    </div>
  );
}
