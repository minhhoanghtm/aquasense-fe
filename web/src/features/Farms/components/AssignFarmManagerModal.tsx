import React, { useState, useEffect, useCallback } from "react";
import { X, ShieldCheck, UserCheck, Search, Loader2, AlertCircle, Building2 } from "lucide-react";
import type { Farm } from "../../../types/Farm";
import type { User } from "../../../types/User";
import { getStaffList } from "../../../services/staffApi";
import { assignFarmManager } from "../../../services/farmApi";
import { useModalZIndex } from "../../../utils/modalStack";

interface AssignFarmManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: Farm | null;
  onSuccess: () => Promise<void>;
}

export const AssignFarmManagerModal: React.FC<AssignFarmManagerModalProps> = ({
  isOpen,
  onClose,
  farm,
  onSuccess,
}) => {
  const [managers, setManagers] = useState<User[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchManagers = useCallback(async () => {
    setLoadingManagers(true);
    try {
      const res = await getStaffList({ limit: 100 });
      const mgrs = (res.data || []).filter(
        (u) => u.role?.toUpperCase() === "MANAGER"
      );
      setManagers(mgrs);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách Quản lý (Manager)");
    } finally {
      setLoadingManagers(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && farm) {
      setSelectedManagerId(farm.ownerId || farm.owner?.userId || "");
      setError(null);
      setSearch("");
      fetchManagers();
    }
  }, [isOpen, farm, fetchManagers]);

  const zIndex = useModalZIndex(isOpen, 100);

  if (!isOpen || !farm) return null;

  const filteredManagers = managers.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      m.phoneNumber?.includes(search) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedManagerId) {
      setError("Vui lòng chọn Quản lý để phân quyền trại nuôi!");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await assignFarmManager(farm.farmId, selectedManagerId);
      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Lỗi khi phân quyền Quản lý cho trại nuôi!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center p-4 bg-[#03161e]/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--panel-border-strong)] bg-[var(--panel-bg-dark)] p-6 shadow-2xl text-left flex flex-col gap-4 relative max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--divider)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-heading)]">
                Phân quyền Quản lý trại nuôi
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Chỉ định Quản lý (Manager) phụ trách trại:{" "}
                <strong className="text-teal-300">{farm.farmName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Current info */}
        <div className="p-3.5 rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-teal-400" />
            <span className="text-[var(--text-muted)]">Quản lý hiện tại:</span>
            <span className="font-semibold text-white">
              {farm.owner?.fullName || "Chưa phân công"}
            </span>
          </div>
          {farm.owner?.phoneNumber && (
            <span className="text-[var(--text-subtle)]">{farm.owner.phoneNumber}</span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc SĐT Quản lý..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-teal-400"
          />
        </div>

        {/* List Managers */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 max-h-[300px]">
          {loadingManagers ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
              <Loader2 size={24} className="animate-spin text-teal-400" />
              <span>Đang tải danh sách Quản lý...</span>
            </div>
          ) : filteredManagers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              Không tìm thấy Quản lý (Manager) nào phù hợp.
            </div>
          ) : (
            filteredManagers.map((m) => {
              const id = m.userId || m.id || "";
              const isSelected = selectedManagerId === id;
              return (
                <div
                  key={id}
                  onClick={() => setSelectedManagerId(id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-purple-500/15 border-purple-500/40 text-white shadow-md shadow-purple-500/10"
                      : "bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--text-primary)] hover:border-purple-400/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs uppercase">
                      {m.fullName
                        ? m.fullName.split(" ").slice(-2).map((n) => n[0]).join("")
                        : "QL"}
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-white">
                        {m.fullName}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {m.phoneNumber} {m.email ? `· ${m.email}` : ""}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center transition ${
                      isSelected
                        ? "border-purple-400 bg-purple-500 text-white"
                        : "border-[var(--panel-border)]"
                    }`}
                  >
                    {isSelected && <UserCheck size={12} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[var(--divider)] flex items-center justify-end gap-3">
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
            disabled={saving || !selectedManagerId}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 transition cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            <span>Xác nhận phân quyền</span>
          </button>
        </div>
      </div>
    </div>
  );
};
