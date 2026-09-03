import { useEffect, useState } from "react"; import { getCurrentWaterQuality } from "../services/pondApi";
;

export const useWaterQuality = (pondId: string) => {
    const [waterQuality, setWaterQuality] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!pondId) {
            setWaterQuality(null);
            return;
        }

        const fetchWaterQuality = async () => {
            try {
                setLoading(true);

                const data = await getCurrentWaterQuality(pondId);

                setWaterQuality(data);
            } catch (error) {
                console.error("Lỗi lấy chỉ số nước:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWaterQuality();
    }, [pondId]);

    return {
        waterQuality,
        loading,
    };
};