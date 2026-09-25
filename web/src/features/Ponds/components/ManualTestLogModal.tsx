import React, { useState, useEffect } from "react";
import { X, TestTube, Plus, Trash2, Calendar, AlertCircle, Check, Clock } from "lucide-react";
import {
  getManualTestLogs,
  createManualTestLog,
  deleteManualTestLog,
  type ManualTestLogItem,
} from "../../../services/pondApi";
import type { Pond } from "../../../types/Pond";

interface ManualTestLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  pond: Pond | null;
}

export const ManualTestLogModal: React.FC<ManualTestLogModalProps> = ({
  isOpen,
  onClose,
  pond,
}) => {
  const [logs, setLogs] = useState<ManualTestLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form state
  const [nh3Value, setNh3Value] = useState<number | "">("");
  const [no2Value, setNo2Value] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [testedAt, setTestedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pondId = pond?.pondId || pond?.id;

  const fetchLogs = async () => {
    if (!pondId) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getManualTestLogs(pondId);
      setLogs(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể tải danh sách nhật ký đo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && pondId) {
      fetchLogs();
      setTestedAt(new Date().toISOString().slice(0, 16));
    }
  }, [isOpen, pondId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pondId) return;

    if (nh3Value === "" || no2Value === "") {
      setErrorMsg("Vui lòng nhập đầy đủ giá trị đo NH3 và NO2.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await createManualTestLog(pondId, {
        nh3Value: Number(nh3Value),
        no2Value: Number(no2Value),
        note: note.trim() || undefined,
        testedAt: new Date(testedAt).toISOString(),
      });

      setSuccessMsg("Ghi nhận kết quả đo thủ công thành công!");
      setNh3Value("");
      setNo2Value("");
      setNote("");
      setTimeout(() => setSuccessMsg(""), 3000);
      await fetchLogs();
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi lưu kết quả đo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi đo này?")) return;
    try {
      await deleteManualTestLog(logId);
      setSuccessMsg("Đã xóa bản ghi thành công!");
      setTimeout(() => setSuccessMsg(""), 3000);
      await fetchLogs();
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi xóa bản ghi");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03161e]/85 animate-fadeIn">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[#07242e]/98 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(45,212,195,0.15)] text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[#051c24]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <TestTube size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                Nhật ký đo khí độc thủ công (NH3 / NO2)
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Ghi nhận chỉ số kiểm tra mẫu nước định kỳ bằng test kit tại <span className="text-cyan-300 font-semibold">{pond?.name || "Vuông nuôi"}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
              <Check size={15} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* New Measurement Log Form */}
          <form onSubmit={handleCreate} className="p-4 rounded-2xl border border-cyan-900/80 bg-[#051a22] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Plus size={13} />
              Ghi nhận lần đo mới
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* NH3 Input */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-body)] mb-1">
                  Chỉ số NH3 (mg/L) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={nh3Value}
                  onChange={(e) => setNh3Value(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Ví dụ: 0.05"
                  className="w-full rounded-xl border border-cyan-800 bg-[#07242e] px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              {/* NO2 Input */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-body)] mb-1">
                  Chỉ số NO2 (mg/L) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={no2Value}
                  onChange={(e) => setNo2Value(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Ví dụ: 0.10"
                  className="w-full rounded-xl border border-cyan-800 bg-[#07242e] px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              {/* Timestamp */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-body)] mb-1">
                  Thời gian lấy mẫu
                </label>
                <input
                  type="datetime-local"
                  value={testedAt}
                  onChange={(e) => setTestedAt(e.target.value)}
                  className="w-full rounded-xl border border-cyan-800 bg-[#07242e] px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-body)] mb-1">
                  Ghi chú kết quả
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Mẫu nước trong, sau mưa..."
                  className="w-full rounded-xl border border-cyan-800 bg-[#07242e] px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#041920] text-xs font-bold hover:brightness-110 shadow transition cursor-pointer disabled:opacity-50"
              >
                <Plus size={14} />
                <span>{isSubmitting ? "Đang lưu..." : "Lưu bản ghi"}</span>
              </button>
            </div>
          </form>

          {/* Historical Logs List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Clock size={13} className="text-cyan-400" />
              Lịch sử các lần đo ({logs.length} bản ghi)
            </h4>

            {loading ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                Đang tải lịch sử đo...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 rounded-2xl border border-cyan-900/40 bg-[#051c24] text-center text-xs text-[var(--text-muted)]">
                Chưa có nhật ký đo khí độc nào cho vuông nuôi này. Hãy nhập kết quả kiểm tra test kit ở biểu mẫu phía trên!
              </div>
            ) : (
              <div className="space-y-2.5">
                {logs.map((log) => {
                  const isNh3High = log.nh3Value > 0.1;
                  const isNo2High = log.no2Value > 0.2;
                  const dateStr = log.testedAt
                    ? new Date(log.testedAt).toLocaleString("vi-VN")
                    : "Gần đây";

                  return (
                    <div
                      key={log.logId}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl border border-cyan-900/60 bg-[#062029] gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold text-xs">
                          KIT
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white">
                              NH3: <strong className={isNh3High ? "text-rose-400 font-mono" : "text-emerald-400 font-mono"}>{log.nh3Value} mg/L</strong>
                            </span>
                            <span className="text-slate-500">|</span>
                            <span className="text-xs text-white">
                              NO2: <strong className={isNo2High ? "text-rose-400 font-mono" : "text-emerald-400 font-mono"}>{log.no2Value} mg/L</strong>
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 font-mono text-[10px] text-cyan-300/70">
                              <Calendar size={11} /> {dateStr}
                            </span>
                            {log.note && <span className="italic truncate max-w-xs">"{log.note}"</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleDelete(log.logId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Xóa bản ghi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--divider)] px-6 py-3.5 bg-[#051c24] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/20 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualTestLogModal;
