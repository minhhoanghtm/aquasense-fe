import { useEffect, useState } from "react";
import type { Pond } from "../types/Pond";
import type { Devices } from "../types/Devices";
import { getPondDashboard } from "../services/pondApi";

const pondCache = new Map<string, { pond: Pond | null; device: Devices | null }>();

export const invalidatePondCache = (pondId?: string) => {
    if (pondId) {
        pondCache.delete(pondId);
    } else {
        pondCache.clear();
    }
};

export const usePond = (pondId: string) => {
    const cached = pondId ? pondCache.get(pondId) : null;
    const [pond, setPond] = useState<Pond | null>(cached?.pond ?? null);
    const [device, setDevice] = useState<Devices | null>(cached?.device ?? null);
    const [loading, setLoading] = useState(!cached && !!pondId);

    useEffect(() => {
        if (!pondId) {
            setPond(null);
            setDevice(null);
            return;
        }

        const fetchPond = async () => {
            try {
                if (!pondCache.has(pondId)) {
                    setLoading(true);
                }

                const data = await getPondDashboard(pondId);
                const devicesList = Array.isArray(data.devices) ? data.devices : [];
                const dev = devicesList.length > 0 ? (devicesList[0] as Devices) : null;

                pondCache.set(pondId, { pond: data.pond, device: dev });
                setPond(data.pond);
                setDevice(dev);
            } catch (error) {
                console.error("Lỗi lấy thông tin ao:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPond();

        const handleUpdate = () => {
            pondCache.delete(pondId);
            fetchPond();
        };

        window.addEventListener("ponds-updated", handleUpdate);
        return () => {
            window.removeEventListener("ponds-updated", handleUpdate);
        };
    }, [pondId]);

    return {
        pond,
        device,
        loading,
    };
};