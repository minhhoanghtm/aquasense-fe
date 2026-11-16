import { useState, useMemo } from "react";
import Title from "../../components/Title";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import WarningSummary from "../../features/Alerts_History/components/WarningSummary";
import AlertRules from "../../features/Alerts_History/components/AlertRules";
import AlertList, { type AlertData } from "../../features/Alerts_History/components/AlertList";
import ResponseTime from "../../features/Alerts_History/components/ResponseTime";
import type { AlertLevel as AlertItemAlertLevel } from "../../components/AlertItem";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useAlertsHistory } from "../../hooks/useAlertsHistory";
import { resolveAlert } from "../../services/alertsApi";
import { getCurrentUser } from "../../services/authApi";
import { formatVietnamDateTime } from "../../utils/date";
import { useTelemetryRealtime } from "../../hooks/useTelemetryRealtime";
import { CheckCircle2, X, Info } from "lucide-react";

export default function Alerts() {
    useDocumentTitle("Cảnh báo & Lịch sử");

    const { ponds } = usePonds();
    const selectedPondId = ponds.length > 0 ? ponds[0].id : "";
    const { pond, device, devices } = usePond(selectedPondId);
    const { alerts, rules, summary, loading, error, refetch } = useAlertsHistory();
    useTelemetryRealtime(selectedPondId);

    const currentUser = getCurrentUser();
    const roleUpper = currentUser?.role?.toUpperCase();
    const isFarmer = roleUpper === "FARMER";

    // Danh sách ID các ao nuôi mà nông dân này được phân công quản lý
    const allowedPondIds = useMemo(() => {
        const set = new Set<string>();
        ponds.forEach((p) => {
            if (p.id) set.add(p.id);
            if (p.pondId) set.add(p.pondId);
        });
        return set;
    }, [ponds]);

    // Đối với Nông dân, chỉ giữ lại các cảnh báo liên quan đến ao mà nông dân đó thuộc quyền quản lý
    const authorizedAlerts = useMemo(() => {
        if (!isFarmer) return alerts;
        return alerts.filter((a) => {
            const pId = a.pondId || "";
            return allowedPondIds.has(pId);
        });
    }, [alerts, isFarmer, allowedPondIds]);

    // Thống kê cảnh báo theo danh sách ao thuộc quyền quản lý
    const activeSummary = useMemo(() => {
        if (!isFarmer) return summary;
        const dangerCount = authorizedAlerts.filter(
            (a) => a.alertLevel === "CRITICAL" || a.alertLevel === "DANGER" || a.level === "DANGER" || a.level === "CRITICAL"
        ).length;
        const warningCount = authorizedAlerts.filter(
            (a) => a.alertLevel === "WARNING" || a.level === "WARNING"
        ).length;
        const resolvedCount = authorizedAlerts.filter(
            (a) =>
                a.status === "RESOLVED" ||
                String(a.status).toUpperCase() === "RESOLVED" ||
                String(a.status).toUpperCase() === "ĐÃ XỬ LÝ" ||
                a.isRead
        ).length;
        return {
            danger: dangerCount,
            warning: warningCount,
            resolved: resolvedCount,
        };
    }, [isFarmer, summary, authorizedAlerts]);

    const [selectedAlertForResolve, setSelectedAlertForResolve] = useState<AlertData | null>(null);
    const [resolutionNote, setResolutionNote] = useState("");
    const [isResolving, setIsResolving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAlertForResolve?.id) return;
        try {
            setIsResolving(true);
            await resolveAlert(selectedAlertForResolve.id, resolutionNote);
            showToast(`Đã giải quyết cảnh báo: ${selectedAlertForResolve.title}`);
            setSelectedAlertForResolve(null);
            setResolutionNote("");
            refetch();
        } catch (err: any) {
            showToast(err.message || "Không thể xử lý cảnh báo.");
        } finally {
            setIsResolving(false);
        }
    };

    // Ánh xạ tên ao từ danh sách ponds
    const pondMap = useMemo(() => {
        const map = new Map<string, string>();
        ponds.forEach((p) => {
            const name = p.name || p.pondName || "";
            if (p.id) map.set(p.id, name);
            if (p.pondId) map.set(p.pondId, name);
        });
        return map;
    }, [ponds]);

    const formattedAlerts: AlertData[] = useMemo(() => {
        return authorizedAlerts.map((a) => {
            const pondId = a.pondId || "";
            const resolvedPondName =
                a.pondName || pondMap.get(pondId) || (ponds.length === 1 ? (ponds[0].name || "Ao nuôi") : "Ao nuôi");

            const formattedTime = a.createdAt
                ? formatVietnamDateTime(a.createdAt)
                : a.time || "";

            return {
                id: a.id || a.alertId || "",
                createdAt: a.createdAt,
                time: formattedTime,
                title: a.title || a.message || a.metricName || "Cảnh báo chỉ số",
                pondId: pondId,
                pondName: resolvedPondName,
                value: a.triggeredValue ?? a.value ?? "",
                unit: a.unit || "",
                level: (a.alertLevel === "CRITICAL" || a.alertLevel === "DANGER" || a.level === "DANGER"
                    ? "DANGER"
                    : "WARNING") as AlertItemAlertLevel,
                status: (a.status === "RESOLVED" || a.status === "Đã xử lý"
                    ? "Đã xử lý"
                    : "Chưa xử lý") as any,
                metricName: a.metricName,
                message: a.message || undefined,
                resolvedAt: a.resolvedAt,
                resolutionNote: a.resolutionNote,
            };
        });
    }, [authorizedAlerts, pondMap, ponds]);

    const pondOptions = useMemo(() => {
        return ponds.map((p) => ({
            id: p.id || p.pondId || "",
            name: p.name || p.pondName || "Ao nuôi",
        }));
    }, [ponds]);

    // Thời gian xử lý trung bình định dạng tiếng Việt
    const averageResolutionTime = useMemo(() => {
        const resolvedAlerts = authorizedAlerts.filter(
            (a) => (a.status === "RESOLVED" || a.status === "Đã xử lý") && a.createdAt && a.resolvedAt
        );
        if (resolvedAlerts.length === 0) return undefined;

        const totalMs = resolvedAlerts.reduce((acc, a) => {
            const start = new Date(a.createdAt).getTime();
            const end = new Date(a.resolvedAt!).getTime();
            const diff = end - start;
            return acc + (diff > 0 ? diff : 0);
        }, 0);

        const avgMs = totalMs / resolvedAlerts.length;
        const minutes = Math.round(avgMs / (1000 * 60));
        if (minutes < 1) return "< 1 phút";
        if (minutes < 60) return `${minutes} phút`;
        const hours = (minutes / 60).toFixed(1);
        return `${hours} giờ`;
    }, [authorizedAlerts]);

    return (
        <div className="w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4">
            <Title
                title="Cảnh báo & Lịch sử"
                description="Hệ thống giám sát chất lượng nước vuông nuôi tôm sử dụng IoT và AI"
                pond={pond}
                device={device}
                devices={devices}
            />

            {toastMessage && (
                <div className="rounded-xl border border-teal-500/40 bg-teal-950/60 p-3 text-sm text-teal-200 flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {isFarmer && !loading && ponds.length === 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-center gap-3">
                    <Info size={18} className="text-amber-400 shrink-0" />
                    <span>
                        Tài khoản Nông dân của bạn hiện chưa được phân công quản lý vuông nuôi nào. Vui lòng liên hệ Quản lý để được phân công phụ trách vuông nuôi.
                    </span>
                </div>
            )}

            {/* Top Full-Width Summary Card */}
            <WarningSummary
                danger={activeSummary.danger}
                warning={activeSummary.warning}
                resolved={activeSummary.resolved}
            />

            {loading && <div className="text-sm text-[var(--text-muted)]">Đang tải cảnh báo...</div>}
            {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-sm text-rose-200">
                    Không thể tải cảnh báo: {error}
                </div>
            )}

            {/* Bottom 2-Column Content: Alert List (Left) + Rules & Response Time (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
                <div className="lg:col-span-8">
                    <AlertList
                        alerts={formattedAlerts}
                        ponds={pondOptions}
                        onExportSuccess={showToast}
                        onAlertClick={(alert) => {
                            if (alert.status !== "Đã xử lý" && alert.status !== "RESOLVED") {
                                setSelectedAlertForResolve(alert);
                                setResolutionNote("");
                            }
                        }}
                    />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
                    <AlertRules rules={rules} />
                    <ResponseTime time={averageResolutionTime} />
                </div>
            </div>

            {/* Modal Giải quyết cảnh báo */}
            {selectedAlertForResolve && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03161e]/85 animate-fadeIn">
                    <div className="w-full max-w-md rounded-2xl border border-[var(--panel-border-strong)] bg-[#07242e] p-6 shadow-2xl text-left">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)]">
                            <h3 className="text-base font-bold text-[var(--text-heading)]">Xác nhận xử lý cảnh báo</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedAlertForResolve(null)}
                                className="text-[var(--text-muted)] hover:text-white cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 text-sm text-[var(--text-body)]">
                            <div>
                                <span className="text-[var(--text-muted)]">Cảnh báo: </span>
                                <span className="font-semibold text-rose-400">{selectedAlertForResolve.title}</span>
                            </div>
                            {selectedAlertForResolve.pondName && (
                                <div>
                                    <span className="text-[var(--text-muted)]">Ao nuôi: </span>
                                    <span>{selectedAlertForResolve.pondName}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-[var(--text-muted)]">Thời gian ghi nhận: </span>
                                <span>{selectedAlertForResolve.time}</span>
                            </div>
                        </div>

                        <form onSubmit={handleResolve} className="mt-4 flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-medium text-[var(--text-muted)]">Ghi chú khắc phục (tùy chọn):</label>
                                <textarea
                                    value={resolutionNote}
                                    onChange={(e) => setResolutionNote(e.target.value)}
                                    placeholder="VD: Đã bật quạt nước tăng DO và bón vôi ổn định pH..."
                                    rows={3}
                                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-[#03161e] border border-[var(--panel-border)] text-white focus:outline-none focus:border-teal-400"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAlertForResolve(null)}
                                    className="px-3.5 py-2 text-xs rounded-xl border border-[var(--panel-border)] text-[var(--text-muted)] hover:bg-[#03161e] cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isResolving}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-black hover:bg-teal-400 disabled:opacity-50 cursor-pointer"
                                >
                                    {isResolving ? "Đang lưu..." : "Xác nhận đã xử lý"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
