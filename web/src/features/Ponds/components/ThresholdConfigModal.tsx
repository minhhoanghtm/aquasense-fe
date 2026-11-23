import React, { useState, useEffect } from "react";
import { X, Sliders, Plus, Trash2, Edit3, AlertCircle, Sparkles } from "lucide-react";
import Dropdown from "../../../components/Dropdown";
import ConfirmModal from "../../../components/ConfirmModal";
import SuccessModal from "../../../components/SuccessModal";
import {
  getThresholdConfigs,
  createThresholdConfig,
  updateThresholdConfig,
  deleteThresholdConfig,
  type ThresholdConfigItem,
} from "../../../services/pondApi";
import type { Pond } from "../../../types/Pond";
import { getCurrentUser } from "../../../services/authApi";
import { canManagePonds } from "../../../lib/rolePermissions";
import { useModalZIndex } from "../../../utils/modalStack";

interface ThresholdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  pond: Pond | null;
}

const defaultMetricOptions = [
  { value: "temperature", label: "Nhiệt độ nước (°C)", min: 26, max: 32 },
  { value: "pH", label: "Độ pH", min: 7.5, max: 8.5 },
  { value: "dissolvedOxygen", label: "Oxy hòa tan (DO) (mg/L)", min: 4.5, max: 8.0 },
  { value: "salinity", label: "Độ mặn (ppt)", min: 10, max: 25 },
  { value: "turbidity", label: "Độ đục (NTU)", min: 10, max: 40 },
  { value: "waterLevel", label: "Mực nước ao (m)", min: 1.0, max: 1.6 },
  { value: "nh3", label: "Khí độc NH3 (mg/L)", min: 0, max: 0.1 },
  { value: "no2", label: "Khí độc NO2 (mg/L)", min: 0, max: 0.2 },
];

const METRIC_TRANSLATIONS: Record<string, string> = {
  dissolvedOxygen: "Oxy hòa tan (DO)",
  DO: "Oxy hòa tan (DO)",
  temperature: "Nhiệt độ nước",
  temp: "Nhiệt độ nước",
  pH: "Độ pH",
  ph: "Độ pH",
  salinity: "Độ mặn",
  turbidity: "Độ đục",
  waterLevel: "Mực nước ao",
  nh3: "Khí độc NH3",
  no2: "Khí độc NO2",
};

const formatThresholdErrorMessage = (rawMsg: string): string => {
  let msg = rawMsg;
  for (const [key, label] of Object.entries(METRIC_TRANSLATIONS)) {
    msg = msg.split(`"${key}"`).join(`"${label}"`);
    msg = msg.split(`'${key}'`).join(`"${label}"`);
  }
  return msg;
};

export const ThresholdConfigModal: React.FC<ThresholdConfigModalProps> = ({
  isOpen,
  onClose,
  pond,
}) => {
  const [configs, setConfigs] = useState<ThresholdConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // New config form state
  const [metricName, setMetricName] = useState("temperature");
  const [minValue, setMinValue] = useState<number | "">(26);
  const [maxValue, setMaxValue] = useState<number | "">(32);
  const [isAdding, setIsAdding] = useState(false);

  // Inline editing state
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editMin, setEditMin] = useState<number>(0);
  const [editMax, setEditMax] = useState<number>(0);

  // Modal dialog states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    configId: string;
    metricLabel: string;
  }>({
    isOpen: false,
    configId: "",
    metricLabel: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const pondId = pond?.pondId || pond?.id;
  const canManage = canManagePonds(getCurrentUser()?.role);

  const fetchConfigs = async () => {
    if (!pondId) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getThresholdConfigs(pondId);
      setConfigs(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể tải danh sách cấu hình ngưỡng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && pondId) {
      fetchConfigs();
    }
  }, [isOpen, pondId]);

  const handleMetricSelectChange = (val: string) => {
    setMetricName(val);
    const found = defaultMetricOptions.find((m) => m.value === val);
    if (found) {
      setMinValue(found.min);
      setMaxValue(found.max);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pondId) return;
    if (minValue === "" || maxValue === "") {
      setErrorMsg("Vui lòng nhập đầy đủ giá trị ngưỡng tối thiểu và tối đa.");
      return;
    }
    if (Number(minValue) > Number(maxValue)) {
      setErrorMsg("Giá trị tối thiểu (Min) không được lớn hơn giá trị tối đa (Max).");
      return;
    }

    try {
      setIsAdding(true);
      setErrorMsg("");
      await createThresholdConfig(pondId, {
        metricName,
        minValue: Number(minValue),
        maxValue: Number(maxValue),
        isActive: true,
      });
      const metricLabel = defaultMetricOptions.find((m) => m.value === metricName)?.label || metricName;
      setSuccessModal({
        isOpen: true,
        title: "Thêm thành công!",
        message: `Đã thiết lập cấu hình ngưỡng an toàn cho ${metricLabel} [${minValue} - ${maxValue}].`,
      });
      await fetchConfigs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi thêm cấu hình ngưỡng";
      setErrorMsg(formatThresholdErrorMessage(msg));
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (cfg: ThresholdConfigItem) => {
    setEditingConfigId(cfg.configId);
    setEditMin(cfg.minValue);
    setEditMax(cfg.maxValue);
  };

  const saveEdit = async (configId: string) => {
    if (editMin > editMax) {
      setErrorMsg("Giá trị tối thiểu không được lớn hơn giá trị tối đa.");
      return;
    }
    try {
      setErrorMsg("");
      await updateThresholdConfig(configId, {
        minValue: Number(editMin),
        maxValue: Number(editMax),
      });
      setEditingConfigId(null);
      setSuccessModal({
        isOpen: true,
        title: "Cập nhật thành công!",
        message: `Đã lưu cập nhật khoảng ngưỡng an toàn [${editMin} - ${editMax}] thành công.`,
      });
      await fetchConfigs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi cập nhật ngưỡng";
      setErrorMsg(formatThresholdErrorMessage(msg));
    }
  };

  const toggleActive = async (cfg: ThresholdConfigItem) => {
    try {
      await updateThresholdConfig(cfg.configId, {
        isActive: !cfg.isActive,
      });
      await fetchConfigs();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi đổi trạng thái");
    }
  };

  const handleDeleteClick = (cfg: ThresholdConfigItem) => {
    const label = defaultMetricOptions.find((m) => m.value === cfg.metricName)?.label || cfg.metricName;
    setDeleteConfirm({
      isOpen: true,
      configId: cfg.configId,
      metricLabel: label,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.configId) return;
    try {
      setIsDeleting(true);
      await deleteThresholdConfig(deleteConfirm.configId);
      const label = deleteConfirm.metricLabel;
      setDeleteConfirm({ isOpen: false, configId: "", metricLabel: "" });
      setSuccessModal({
        isOpen: true,
        title: "Đã xóa thành công!",
        message: `Đã xóa cấu hình ngưỡng cảnh báo an toàn cho "${label}".`,
      });
      await fetchConfigs();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Lỗi khi xóa cấu hình");
    } finally {
      setIsDeleting(false);
    }
  };

  const zIndex = useModalZIndex(isOpen, 100);

  if (!isOpen) return null;

  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center p-4 bg-[#03161e]/85 animate-fadeIn">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[#07242e]/98 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(45,212,195,0.15)] text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[#051c24]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-[var(--accent)] border border-cyan-500/30">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                Cấu hình ngưỡng cảnh báo an toàn
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Thiết lập khoảng giới hạn an toàn [Min - Max] cho <span className="text-cyan-300 font-semibold">{pond?.name || "Vuông nuôi"}</span>
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

          {/* Add Threshold Form */}
          {canManage && <form onSubmit={handleCreate} className="relative z-30 p-4 rounded-2xl border border-cyan-900/80 bg-[#051a22] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Plus size={13} />
              Thêm ngưỡng cảnh báo chỉ số
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="relative z-40">
                <label className="block text-[11px] font-semibold text-[var(--text-body)] mb-1">
                  Chỉ số đo
                </label>
                <Dropdown
                  value={metricName}
                  options={defaultMetricOptions.map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                  }))}
                  onChange={(val) => handleMetricSelectChange(val)}
                  searchPlaceholder="Tìm chỉ số..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-body)] mb-1">
                  Ngưỡng tối thiểu (Min)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-cyan-800 bg-[#07242e] px-3 py-2 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Min"
                    className="w-full bg-transparent text-xs text-white outline-none border-none focus:outline-none focus:ring-0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-body)] mb-1">
                  Ngưỡng tối đa (Max)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-xl border border-cyan-800 bg-[#07242e] px-3 py-2 transition-all duration-200 hover:border-cyan-500 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 shadow-sm">
                    <input
                      type="number"
                      step="0.01"
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Max"
                      className="w-full bg-transparent text-xs text-white outline-none border-none focus:outline-none focus:ring-0"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2dd4c3] to-[#159d96] text-[#041920] text-xs font-bold hover:brightness-110 shadow transition cursor-pointer disabled:opacity-50"
                  >
                    {isAdding ? "Lưu..." : "Thêm"}
                  </button>
                </div>
              </div>
            </div>
          </form>}

          {/* Configured Thresholds Table/List */}
          <div className="relative z-10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-400" />
              Các ngưỡng đang áp dụng ({configs.length})
            </h4>

            {loading ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                Đang tải danh sách ngưỡng...
              </div>
            ) : configs.length === 0 ? (
              <div className="p-8 rounded-2xl border border-cyan-900/40 bg-[#051c24] text-center text-xs text-[var(--text-muted)]">
                Chưa có cấu hình ngưỡng nào cho vuông nuôi này. Hãy thêm ngưỡng an toàn phía trên!
              </div>
            ) : (
              <div className="space-y-2.5">
                {configs.map((cfg) => {
                  const metricInfo = defaultMetricOptions.find((m) => m.value === cfg.metricName) || {
                    label: cfg.metricName,
                  };
                  const isEditingThis = editingConfigId === cfg.configId;

                  return (
                    <div
                      key={cfg.configId}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl border transition ${cfg.isActive
                        ? "border-cyan-900/80 bg-[#062029]"
                        : "border-slate-800 bg-[#04151c] opacity-60"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 font-bold text-xs">
                          {cfg.metricName.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{metricInfo.label}</div>
                          <div className="text-[11px] font-mono text-cyan-300/80 mt-0.5">
                            {isEditingThis ? (
                              <div className="flex items-center gap-2 mt-1">
                                <span>Min:</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editMin}
                                  onChange={(e) => setEditMin(Number(e.target.value))}
                                  className="w-16 rounded border border-cyan-700 bg-[#07242e] px-1.5 py-0.5 text-xs text-white"
                                />
                                <span>Max:</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editMax}
                                  onChange={(e) => setEditMax(Number(e.target.value))}
                                  className="w-16 rounded border border-cyan-700 bg-[#07242e] px-1.5 py-0.5 text-xs text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => saveEdit(cfg.configId)}
                                  className="px-2 py-0.5 rounded bg-emerald-500 text-black font-bold text-[10px] cursor-pointer"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingConfigId(null)}
                                  className="px-2 py-0.5 rounded bg-slate-700 text-white text-[10px] cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <span>
                                Giới hạn an toàn: <strong className="text-white">[{cfg.minValue} ~ {cfg.maxValue}]</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {canManage && <div className="flex items-center gap-2 mt-2 sm:mt-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => toggleActive(cfg)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${cfg.isActive
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                        >
                          {cfg.isActive ? "Đang bật" : "Đã tắt"}
                        </button>

                        {!isEditingThis && (
                          <button
                            type="button"
                            onClick={() => startEdit(cfg)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition cursor-pointer"
                            title="Chỉnh sửa giá trị"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cfg)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Xóa cấu hình"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, configId: "", metricLabel: "" })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa cấu hình ngưỡng"
        description={
          <span>
            Bạn có chắc chắn muốn xóa cấu hình ngưỡng cảnh báo cho thông số{" "}
            <strong className="text-white">{deleteConfirm.metricLabel}</strong>?
            Hệ thống sẽ ngừng giám sát ngưỡng an toàn cho chỉ số này.
          </span>
        }
        confirmText="Xóa cấu hình"
        cancelText="Hủy"
        variant="danger"
        loading={isDeleting}
      />

      {/* Success Notification Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: "", message: "" })}
        title={successModal.title}
        message={successModal.message}
        confirmText="Đồng ý"
      />
    </div>
  );
};

export default ThresholdConfigModal;
