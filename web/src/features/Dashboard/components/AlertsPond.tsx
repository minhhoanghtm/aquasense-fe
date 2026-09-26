import { TriangleAlert } from 'lucide-react';
import { getTimeAgo } from '../../../utils/date';
const AlertsPond = ({ alerts }: { alerts: any }) => {
    const safeAlerts = Array.isArray(alerts) ? alerts : [];
    const count = safeAlerts.length;
    return (
        <div className='dashboard-card p-5 text-left h-full flex flex-col'>
            {/* Title + icon  */}
            <div className='flex justify-between items-center w-full mb-6'>
                {/* title  */}
                <div className="flex flex-col items-start">
                    <h4 className="text-[var(--text-heading)] font-semibold text-base leading-tight tracking-wide">Cảnh báo Ao</h4>
                    <p className="text-[9px] text-[var(--text-muted)] font-bold tracking-wider mt-0.5 uppercase">{count > 0 ? `${count} cảnh báo cần chú ý` : "Không có cảnh báo nào"}</p>
                </div>

                <TriangleAlert size={20} className="text-[var(--critical)]" />
            </div>

            {/* List alert */}
            <div className="flex flex-col w-full mt-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
                {safeAlerts.map((alert: any, index: number) => (
                    <div
                        key={alert.id ?? index}
                        className="relative flex flex-col w-full px-4 py-3 border-b border-(--panel-border-strong)"
                    >
                        <span className="absolute left-0 top-3 bottom-3 w-[3px] bg-red-400 rounded-full" />

                        <p className="font-semibold">
                            {alert.message || alert.title || "Cảnh báo"}
                        </p>

                        <p className="text-xs text-(--text-muted)">
                            {getTimeAgo(alert.createdAt || alert.time)}
                        </p>
                    </div>
                ))}
            </div>
        </div >
    )
}

export default AlertsPond