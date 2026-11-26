import { useCallback, useEffect, useRef, useState } from "react";
import type { Pond, PondWithDevices } from "../types/Pond";
import type { Alerts } from "../types/Alerts";
import { getAllPondsPage, getPondsPage, type PaginatedPonds } from "../services/pondApi";
import type { PondStatus } from "../types/Pond";
import { getAlerts } from "../services/alertsApi";
import { getCurrentUser } from "../services/authApi";
import {
    getErrorMessage,
    isAbortError,
    SELECTED_POND_STORAGE_KEY,
    syncAuthorizedPonds,
} from "../services/pondAccessControl";

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
    const [pagination, setPagination] = useState<Omit<PaginatedPonds, "data">>({
        total: 0,
        page: 1,
        limit: query.limit ?? 100,
        totalPages: 0,
    });
    const lastAccountId = useRef<string | undefined>(getCurrentUser()?.userId ?? query.userId);
    const requestVersion = useRef(0);
    const activeController = useRef<AbortController | null>(null);

    const fetchPondsData = useCallback(async () => {
        const requestId = ++requestVersion.current;
        if (activeController.current) {
            activeController.current.abort();
        }
        const controller = new AbortController();
        activeController.current = controller;

        try {
            setError(null);
            setLoading(true);

            const currentAccountId = getCurrentUser()?.userId ?? query.userId;
            if (lastAccountId.current !== currentAccountId) {
                setPonds([]);
                setInfoPond([]);
                setAllAlerts([]);
                lastAccountId.current = currentAccountId;
            }
            setAlertsError(null);

            const [pondsResult, alertsResult] = await Promise.allSettled([
                query.allPages
                    ? getAllPondsPage(
                        { search: query.search, status: query.status, userId: query.userId, farmId: query.farmId },
                        { signal: controller.signal },
                    )
                    : getPondsPage(
                        { page: query.page, limit: query.limit ?? 100, search: query.search, status: query.status, userId: query.userId, farmId: query.farmId },
                        { signal: controller.signal },
                    ),
                getAlerts(undefined, { signal: controller.signal }),
            ]);

            if (controller.signal.aborted || requestId !== requestVersion.current) return;

            if (pondsResult.status === "rejected") throw pondsResult.reason;

            const nextPonds = sortPonds(pondsResult.value.data);
            syncAuthorizedPonds(nextPonds.map((p) => p.id || p.pondId));
            const nextAllowedIds = new Set(
                nextPonds.flatMap((p) => [p.id, p.pondId].filter((id): id is string => Boolean(id))),
            );
            const savedPondId = localStorage.getItem(SELECTED_POND_STORAGE_KEY);
            if (savedPondId && !query.search && !query.status && !query.farmId && !nextAllowedIds.has(savedPondId)) {
                localStorage.removeItem(SELECTED_POND_STORAGE_KEY);
            }

            let safeAlerts: Alerts[] = [];
            if (alertsResult.status === "fulfilled" && Array.isArray(alertsResult.value)) {
                safeAlerts = nextAllowedIds.size === 0 && nextPonds.length === 0
                    ? []
                    : alertsResult.value;
            } else if (alertsResult.status === "rejected" && !isAbortError(alertsResult.reason)) {
                setAlertsError(getErrorMessage(alertsResult.reason, "Không thể tải cảnh báo."));
            }

            setPonds(nextPonds);
            setPagination({
                total: pondsResult.value.total,
                page: pondsResult.value.page,
                limit: pondsResult.value.limit,
                totalPages: pondsResult.value.totalPages,
            });
            setInfoPond(nextPonds.map((pond) => ({ ...pond, devices: [] })));
            setAllAlerts(safeAlerts);
        } catch (err) {
            if (isAbortError(err) || controller.signal.aborted || requestId !== requestVersion.current) return;
            console.error("Lỗi lấy danh sách ao và thiết bị:", err);
            setError(getErrorMessage(err, "Không thể tải danh sách ao nuôi."));
        } finally {
            if (requestId === requestVersion.current) setLoading(false);
        }
    }, [query.page, query.limit, query.search, query.status, query.userId, query.farmId, query.allPages]);

    useEffect(() => {
        void fetchPondsData();

        const handleUpdate = () => {
            void fetchPondsData();
        };

        const handlePondRevoked = (event: Event) => {
            const revokedPondId = (event as CustomEvent<{ pondId?: string }>).detail?.pondId;
            if (!revokedPondId) return;
            setPonds((prev) => prev.filter((p) => (p.id || p.pondId) !== revokedPondId && p.pondId !== revokedPondId));
            setInfoPond((prev) => prev.filter((p) => (p.id || p.pondId) !== revokedPondId && p.pondId !== revokedPondId));
            setAllAlerts((prev) => prev.filter((a) => a.pondId !== revokedPondId));
        };

        const handleAuthCleared = () => {
            requestVersion.current += 1;
            activeController.current?.abort();
            activeController.current = null;
            lastAccountId.current = undefined;
            setPonds([]);
            setInfoPond([]);
            setAllAlerts([]);
            setError(null);
            setAlertsError(null);
            setLoading(false);
        };

        window.addEventListener("ponds-updated", handleUpdate);
        window.addEventListener("pond-access-revoked", handlePondRevoked);
        window.addEventListener("auth-cleared", handleAuthCleared);

        return () => {
            activeController.current?.abort();
            window.removeEventListener("ponds-updated", handleUpdate);
            window.removeEventListener("pond-access-revoked", handlePondRevoked);
            window.removeEventListener("auth-cleared", handleAuthCleared);
        };
    }, [fetchPondsData]);

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
