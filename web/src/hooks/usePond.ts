import { useEffect, useState } from "react";
import type { Pond } from "../types/Pond";
import type { Devices } from "../types/Devices";
import { getPondDashboard } from "../services/pondApi";

export const usePond = (pondId: string) => {
    const [pond, setPond] = useState<Pond | null>(null);
    const [device, setDevice] = useState<Devices | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!pondId) {
            setPond(null);
            setDevice(null);
            return;
        }

        const fetchPond = async () => {
            try {
                setLoading(true);

                const data = await getPondDashboard(pondId);

                setPond(data.pond);
                setDevice(data.devices && data.devices.length > 0 ? data.devices[0] : null);
            } catch (error) {
                console.error("Lỗi lấy thông tin ao:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPond();
    }, [pondId]);

    return {
        pond,
        device,
        loading,
    };
};