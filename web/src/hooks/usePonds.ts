import { useEffect, useRef, useState } from "react";
import type { Pond, PondWithDevices } from "../types/Pond";
import type { Alerts } from "../types/Alerts";
import { getAllPondsPage, getPondsPage, type PaginatedPonds } from "../services/pondApi";
import type { PondStatus } from "../types/Pond";
import { getAlerts } from "../services/alertsApi";

const sortPonds = (ponds: Pond[]): Pond[] => [...ponds].sort((a, b) =>
    (a.name || a.pondName || a.id || a.pondId || "").localeCompare(
        b.name || b.pondName || b.id || b.pondId || "",
        "vi",
    ),
);

export const invalidatePondsCache = () => {
    window.dispatchEvent(new Event("ponds-updated"));
};

export interface PondQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: PondStatus;
    userId?: string;
    farmId?: string;
    allPages?: boolean;
}

export const usePonds = (query: PondQuery = {}) => {
    const [ponds, setPonds] = useState<Pond[]>([]);
    const [infoPond, setInfoPond] = useState<PondWithDevices[]>([]);
    const [allAlerts, setAllAlerts] = useState<Alerts[]>([]);
    const [alertsError, setAlertsError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Omit<PaginatedPonds, "data">>({ total: 0, page: 1, limit: query.limit ?? 100, totalPages: 0 });
    const lastUserId = useRef<string | undefined>(query.userId);

    const fetchPondsData = async () => {
        try {
            setError(null);
            setLoading(true);
            // Only wipe data if switching user account
            if (query.userId && lastUserId.current !== query.userId) {
                setPonds([]);
                setInfoPond([]);
                setAllAlerts([]);
                lastUserId.current = query.userId;
            }
            setAlertsError(null);

            const [pondsResult, alertsResult] = await Promise.allSettled([
                query.allPages
                    ? getAllPondsPage({ search: query.search, status: query.status, userId: query.userId, farmId: query.farmId })
                    : getPondsPage({ page: query.page, limit: query.limit ?? 100, search: query.search, status: query.status, userId: query.userId, farmId: query.farmId }),
                getAlerts(),
            ]);

            if (pondsResult.status === "rejected") throw pondsResult.reason;
            const nextPonds = sortPonds(pondsResult.value.data);
            const safeAlerts = alertsResult.status === "fulfilled" && Array.isArray(alertsResult.value)
                ? alertsResult.value
                : [];
            if (alertsResult.status === "rejected") {
                setAlertsError(alertsResult.reason instanceof Error ? alertsResult.reason.message : "Không thể tải cảnh báo.");
            }

            setPonds(nextPonds);
            setPagination({ total: pondsResult.value.total, page: pondsResult.value.page, limit: pondsResult.value.limit, totalPages: pondsResult.value.totalPages });
            setInfoPond(nextPonds.map((pond) => ({ ...pond, devices: [] })));
            setAllAlerts(safeAlerts);
        } catch (error) {
            console.error("Lỗi lấy danh sách ao và thiết bị:", error);
            setError(error instanceof Error ? error.message : "Không thể tải danh sách ao nuôi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPondsData();

        const handleUpdate = () => {
            fetchPondsData();
        };

        window.addEventListener("ponds-updated", handleUpdate);
        return () => window.removeEventListener("ponds-updated", handleUpdate);
    }, [query.page, query.limit, query.search, query.status, query.userId, query.farmId, query.allPages]);

    return {
        ponds,
        infoPond,
        allAlerts,
        alertsError,
        loading,
        error,
        pagination,
        refetch: fetchPondsData,
    };
};
