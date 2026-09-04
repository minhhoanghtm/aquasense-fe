import Title from "../../components/Title";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import WarningSummary from "../../features/Alerts_History/components/WarningSummary";
import AlertRules from "../../features/Alerts_History/components/AlertRules";
import AlertList from "../../features/Alerts_History/components/AlertList";
import ResponseTime from "../../features/Alerts_History/components/ResponseTime";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useAlertsHistory } from "../../hooks/useAlertsHistory";

export default function Alerts() {
    useDocumentTitle("Cảnh báo & Lịch sử");

    const { ponds } = usePonds();
    const selectedPondId = ponds.length > 0 ? ponds[0].id : "";
    const { pond, device } = usePond(selectedPondId);
    const { alerts, rules, summary } = useAlertsHistory();

    const formattedAlerts = alerts.map((a) => ({
        id: a.id,
        time: a.time || new Date(a.createdAt).toLocaleDateString("vi-VN"),
        title: a.title || a.message,
        pondName: a.pondName || `Ao ${a.pondId}`,
        value: a.value,
        unit: a.unit || "",
        level: a.alertLevel || a.level || "WARNING",
        status: (a.status || (a.isRead ? "Đã xử lý" : "Chưa xử lý")) as any,
    }));

    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5">
            <Title
                title="Cảnh báo & Lịch sử"
                description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
                pond={pond}
                device={device}
            />

            {/* Top Full-Width Summary Card */}
            <WarningSummary
                danger={summary.danger}
                warning={summary.warning}
                resolved={summary.resolved}
            />

            {/* Bottom 2-Column Content: Alert List (Left) + Rules & Response Time (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                <div className="lg:col-span-8">
                    <AlertList alerts={formattedAlerts} />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
                    <AlertRules rules={rules} />
                    <ResponseTime />
                </div>
            </div>
        </div>
    );
}