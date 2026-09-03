import { useEffect, useState } from "react";
import type { Pond, PondWithDevices } from "../types/Pond";
import type { Alerts } from "../types/Alerts";
import { getPonds, getPondsWithDevices } from "../services/pondApi";
import { getAlerts } from "../services/alertsApi";

export const usePonds = () => {
    const [ponds, setPonds] = useState<Pond[]>([]);
    const [infoPond, setInfoPond] = useState<PondWithDevices[]>([]);
    const [allAlerts, setAllAlerts] = useState<Alerts[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPondsData = async () => {
            try {
                setLoading(true);

                const [pondsData, infoPondsData, alertsData] = await Promise.all([
                    getPonds(),
                    getPondsWithDevices(),
                    getAlerts(),
                ]);

                setPonds(pondsData);
                setInfoPond(infoPondsData);
                setAllAlerts(alertsData);
            } catch (error) {
                console.error("Lỗi lấy danh sách ao và thiết bị:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPondsData();
    }, []);

    return {
        ponds,
        infoPond,
        allAlerts,
        loading,
    };
};