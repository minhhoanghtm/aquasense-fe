import React, { useState, useEffect } from "react";
import { X, Building2, Check, Loader2, AlertCircle, Search, Waves } from "lucide-react";
import type { User } from "../../../types/User";
import type { Farm } from "../../../types/Farm";
import { assignFarmManager } from "../../../services/farmApi";
import { getCurrentUser } from "../../../services/authApi";

interface AssignFarmToManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: User | null;
  farms: Farm[];
  onSuccess: () => Promise<void>;
}

export const AssignFarmToManagerModal: React.FC<AssignFarmToManagerModalProps> = ({
  isOpen,
  onClose,
  manager,
  farms,
  onSuccess,
}) => {
  const currentUser = getCurrentUser();
  const [selectedFarmIds, setSelectedFarmIds] = useState<string[]>([]);
  const [initialFarmIds, setInitialFarmIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const managerId = manager?.userId || manager?.id || "";

  useEffect(() => {
    if (isOpen && manager) {
      const assigned = farms
        .filter((f) => f.ownerId === managerId)
        .map((f) => f.farmId);
      setSelectedFarmIds(assigned);
      setInitialFarmIds(assigned);
      setErrorMsg("");
      setSearch("");
    }
  }, [isOpen, manager, farms, managerId]);

  if (!isOpen || !manager) return null;

  const toggleFarm = (farmId: string) => {
    setSelectedFarmIds((prev) =>
      prev.includes(farmId) ? prev.filter((id) => id !== farmId) : [...prev, farmId]
    );
  };

  const filteredFarms = farms.filter(
    (f) =>
      f.farmName?.toLowerCase().includes(search.toLowerCase()) ||
      f.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg("");

      // Find farms to assign to this manager
      const toAssign = selectedFarmIds.filter((id) => !initialFarmIds.includes(id));
      // Find farms to unassign from this manager (reassign to current admin)
      const toUnassign = initialFarmIds.filter((id) => !selectedFarmIds.includes(id));

      for (const farmId of toAssign) {
        await assignFarmManager(farmId, managerId);
      }

      for (const farmId of toUnassign) {
        const adminId = currentUser?.userId || currentUser?.id;
        if (adminId) {
          await assignFarmManager(farmId, adminId);
        }
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể lưu phân công trại nuôi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#03161e]/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[var(--panel-bg-dark)] shadow-2xl text-left flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[var(--panel-bg-dark)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-heading)]">
                Phân quyền trại nuôi cho Quản lý
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Quản lý: <span className="text-purple-300 font-semibold">{manager.fullName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Toolbar: Search + Quick stats */}
        <div className="px-6 pt-4 pb-2 space-y-2">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm trại nuôi theo tên, địa chỉ..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
            <span>
              Đã chọn: <strong className="text-purple-300 font-semibold">{selectedFarmIds.length}</strong> / {farms.length} trại
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedFarmIds(farms.map((f) => f.farmId))}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
              >
                Chọn tất cả
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setSelectedFarmIds([])}
                className="text-[11px] text-[var(--text-muted)] hover:text-white font-medium cursor-pointer"
              >
                Bỏ chọn hết
              </button>
            </div>
          </div>
        </div>

        {/* Farms List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-2 space-y-2">
          {filteredFarms.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              Không tìm thấy trại nuôi nào.
            </div>
          ) : (
            filteredFarms.map((farm) => {
              const isChecked = selectedFarmIds.includes(farm.farmId);
              const isOtherManager =
                farm.ownerId &&
                farm.ownerId !== managerId &&
                farm.owner?.fullName;
              const pondCount = farm.ponds?.length ?? farm.pondCount ?? 0;

              return (
                <div
                  key={farm.farmId}
                  onClick={() => toggleFarm(farm.farmId)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? "bg-purple-500/15 border-purple-500/40 text-white shadow-md shadow-purple-500/10"
                      : "bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--text-primary)] hover:border-purple-400/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-5 w-5 mt-0.5 rounded-md border flex items-center justify-center transition shrink-0 ${
                        isChecked
                          ? "border-purple-400 bg-purple-500 text-white"
                          : "border-[var(--panel-border)] bg-[var(--panel-bg-dark)]"
                      }`}
                    >
                      {isChecked && <Check size={13} strokeWidth={3} />}
                    </div>

                    <div>
                      <div className="font-bold text-xs sm:text-sm text-[var(--text-heading)]">
                        {farm.farmName}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {farm.address || "Chưa có địa chỉ"}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-cyan-300">
                          <Waves size={11} />
                          <span>{pondCount} vuông nuôi</span>
                        </span>
                        {isOtherManager && !isChecked && (
                          <span className="text-amber-400/90 text-[10px]">
                            (Đang thuộc: {farm.owner?.fullName})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--divider)] px-6 py-4 flex items-center justify-end gap-3 bg-[var(--panel-bg-dark)]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--text-body)] hover:text-white transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 transition cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            <span>Lưu phân quyền ({selectedFarmIds.length} trại)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignFarmToManagerModal;
