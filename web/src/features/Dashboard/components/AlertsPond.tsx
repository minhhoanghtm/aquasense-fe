import { TriangleAlert } from 'lucide-react';
import { getTimeAgo } from '../../../utils/date';
const AlertsPond = ({ alerts }: { alerts: any }) => {
    // console.log("Alerts:", alerts);
    const count = alerts.length;
    // console.log("Messages:", messages);
    return (
        <div className='border border-(--panel-border-strong) p-3 rounded-xl text-left'>
            {/* Title + icon  */}
            <div className='flex justify-between items-center w-full mb-6'>
                {/* title  */}
                <div className="flex flex-col items-start">
                    <h4 className="text-(--primary)">Cảnh báo Ao</h4>
                    <p className="text-xs text-(--text-muted)">{count > 0 ? `${count} cảnh báo cần chú ý` : "Không có cảnh báo nào"}</p>
                </div>

                <TriangleAlert size={16} />
            </div>

            {/* List alert */}
            <div className="flex flex-col w-full mt-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
                {alerts?.map((alert: any, index: number) => (
                    <div
                        key={alert.id ?? index}
                        className="relative flex flex-col w-full px-4 py-3 border-b border-(--panel-border-strong)"
                    >
                        <span className="absolute left-0 top-3 bottom-3 w-[3px] bg-red-400 rounded-full" />

                        <p className="font-semibold">
                            {alert.message}
                        </p>

                        <p className="text-xs text-(--text-muted)">
                            {getTimeAgo(alert.createdAt)}
                        </p>
                    </div>
                ))}
            </div>
        </div >
    )
}

export default AlertsPond