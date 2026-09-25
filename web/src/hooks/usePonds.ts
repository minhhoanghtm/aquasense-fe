import { useEffect, useState } from "react";
import type { Pond, PondWithDevices } from "../types/Pond";
import type { Alerts } from "../types/Alerts";
import { getPonds, getPondsWithDevices } from "../services/pondApi";
import { getAlerts } from "../services/alertsApi";

let cachedPonds: Pond[] = [];
let cachedInfoPond: PondWithDevices[] = [];
let cachedAllAlerts: Alerts[] = [];

export const invalidatePondsCache = () => {
    cachedPonds = [];
    cachedInfoPond = [];
    cachedAllAlerts = [];
    window.dispatchEvent(new Event("ponds-updated"));
};

export const usePonds = () => {
    const [ponds, setPonds] = useState<Pond[]>(cachedPonds);
    const [infoPond, setInfoPond] = useState<PondWithDevices[]>(cachedInfoPond);
    const [allAlerts, setAllAlerts] = useState<Alerts[]>(cachedAllAlerts);
    const [loading, setLoading] = useState(cachedPonds.length === 0);

    const fetchPondsData = async (force: boolean = false) => {
        try {
            if (cachedPonds.length === 0 || force) {
                setLoading(true);
            }

            const [pondsData, infoPondsData, alertsData] = await Promise.all([
                getPonds(),
                getPondsWithDevices().catch(() => []),
                getAlerts().catch(() => []),
            ]);

            const safeAlerts = Array.isArray(alertsData) ? alertsData : [];
            cachedPonds = Array.isArray(pondsData) ? pondsData : [];
            cachedInfoPond = Array.isArray(infoPondsData) ? infoPondsData : [];
            cachedAllAlerts = safeAlerts;

            setPonds(cachedPonds);
            setInfoPond(cachedInfoPond);
            setAllAlerts(safeAlerts);
        } catch (error) {
            console.error("Lỗi lấy danh sách ao và thiết bị:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPondsData();

        const handleUpdate = () => {
            fetchPondsData(true);
        };

        window.addEventListener("ponds-updated", handleUpdate);
        return () => window.removeEventListener("ponds-updated", handleUpdate);
    }, []);

    return {
        ponds,
        infoPond,
        allAlerts,
        loading,
        refetch: () => fetchPondsData(true),
    };
};