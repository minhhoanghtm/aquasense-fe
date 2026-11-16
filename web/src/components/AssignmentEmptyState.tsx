import { useState } from "react";
import { Building2, RefreshCw, ShieldCheck, Waves } from "lucide-react";
import type { User } from "../types/User";

interface AssignmentEmptyStateProps {
  user: User | null;
  onRefresh: () => Promise<boolean>;
}

/** Role-specific empty state; deliberately inline rather than a blocking modal. */
export default function AssignmentEmptyState({ user, onRefresh }: AssignmentEmptyStateProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const isManager = user?.role?.toUpperCase() === "MANAGER";
  const target = isManager ? "Quản trị viên" : "Quản lý trại";
  const Icon = isManager ? Building2 : Waves;

  const handleRefresh = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setChecked(false);
    try {
      setChecked(!(await onRefresh()));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6">
      <section className="dashboard-card w-full max-w-2xl p-6 sm:p-8 text-left border border-[var(--panel-border-strong)] bg-[var(--panel-bg)]/70">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"><Icon size={24} /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">{isManager ? "Tài khoản quản lý" : "Tài khoản nông hộ"}</p>
            <h1 className="mt-1 text-xl font-bold text-[var(--text-heading)]">{isManager ? "Bạn chưa được phân công trại nuôi" : "Bạn chưa được phân công ao nuôi"}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {user?.fullName ? `${user.fullName}, ` : ""}
              {isManager ? "Quản trị viên cần gán bạn vào một trại trước khi bạn có thể quản lý ao và nhân sự thuộc trại đó." : "Quản lý trại cần gán bạn vào một ao trước khi bạn có thể theo dõi chất lượng nước và xử lý công việc tại ao."}
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)]/40 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-heading)]"><ShieldCheck size={16} className="text-teal-300" />Cách tiếp tục</div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--text-muted)]">
            <li>Liên hệ trực tiếp với <strong className="text-[var(--text-body)]">{target}</strong> của cơ sở.</li>
            <li>{isManager ? "Đề nghị được gán vào trại nuôi cần phụ trách." : "Đề nghị được gán vào ao nuôi cần phụ trách."}</li>
            <li>Sau khi được phân công, chọn <strong className="text-[var(--text-body)]">Kiểm tra lại</strong> để cập nhật quyền truy cập.</li>
          </ol>
        </div>
        {checked && <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">Chưa có phân công mới. Nếu vừa được gán, vui lòng đợi một lát rồi kiểm tra lại.</p>}
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={handleRefresh} disabled={isChecking} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--text-on-accent)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
            <RefreshCw size={16} className={isChecking ? "animate-spin" : ""} />{isChecking ? "Đang kiểm tra..." : "Kiểm tra lại"}
          </button>
        </div>
      </section>
    </main>
  );
}
