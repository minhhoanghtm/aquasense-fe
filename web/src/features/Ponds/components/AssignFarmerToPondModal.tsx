import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  UserPlus,
  UserMinus,
  Check,
  Search,
  Loader2,
  AlertCircle,
  Save,
  RotateCcw,
  Users,
} from "lucide-react";
import type { Pond } from "../../../types/Pond";
import type { User } from "../../../types/User";
import { getStaffList } from "../../../services/staffApi";
import {
  assignPondToUser,
  revokePondFromUser,
  getPondById,
} from "../../../services/pondApi";
import { invalidatePondsCache } from "../../../hooks/usePonds";
import { getPondAssignedFarmers } from "../../../utils/assignmentUtils";
import { useModalZIndex } from "../../../utils/modalStack";

interface AssignFarmerToPondModalProps {
  isOpen: boolean;
  onClose: () => void;
  pond?: Pond | null;
  staffList?: User[];
  onSuccess?: () => Promise<void> | void;
}

export const AssignFarmerToPondModal: React.FC<AssignFarmerToPondModalProps> = ({
  isOpen,
  onClose,
  pond,
  staffList: externalStaffList,
  onSuccess,
}) => {
  const zIndex = useModalZIndex(isOpen, 100);
  const [farmers, setFarmers] = useState<User[]>([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [currentPondDetail, setCurrentPondDetail] = useState<Pond | null>(null);

  const [selectedFarmerIds, setSelectedFarmerIds] = useState<string[]>([]);
  const [initialFarmerIds, setInitialFarmerIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pondId = pond?.pondId || pond?.id || "";

  const fetchFarmers = useCallback(async () => {
    setLoadingFarmers(true);
    try {
      const res = await getStaffList({ limit: 100 });
      const onlyFarmers = (res.data || []).filter(
        (u) => u.role?.toUpperCase() === "FARMER"
      );
      setFarmers(onlyFarmers);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách Nông dân (Farmer).");
    } finally {
      setLoadingFarmers(false);
    }
  }, []);

  // Tải danh sách Nông dân (FARMER)
  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setError(null);

    if (externalStaffList && externalStaffList.length > 0) {
      const onlyFarmers = externalStaffList.filter(
        (u) => u.role?.toUpperCase() === "FARMER"
      );
      if (onlyFarmers.length > 0) {
        setFarmers(onlyFarmers);
      } else {
        fetchFarmers();
      }
    } else {
      fetchFarmers();
    }
  }, [isOpen, externalStaffList, fetchFarmers]);

  // Khi mở modal cho vuông nuôi, đồng bộ danh sách Farmer đã phân công
  useEffect(() => {
    if (!isOpen || !pondId) {
      setCurrentPondDetail(null);
      return;
    }

    if (pond) {
      setCurrentPondDetail(pond);
      const assigned = getPondAssignedFarmers(pond, farmers).map((f) => f.userId);
      setSelectedFarmerIds(assigned);
      setInitialFarmerIds(assigned);
    }

    getPondById(pondId)
      .then((freshPond) => {
        setCurrentPondDetail(freshPond);
        const assigned = getPondAssignedFarmers(freshPond, farmers).map((f) => f.userId);
        setSelectedFarmerIds(assigned);
        setInitialFarmerIds(assigned);
      })
      .catch(() => {
        // Giữ nguyên dữ liệu pond hiện tại nếu gặp lỗi
      });
  }, [isOpen, pondId]);

  // Đồng bộ lại khi danh sách farmers vừa tải xong
  useEffect(() => {
    if (!isOpen || !currentPondDetail || farmers.length === 0) return;
    const assigned = getPondAssignedFarmers(currentPondDetail, farmers).map((f) => f.userId);
    if (initialFarmerIds.length === 0 && assigned.length > 0) {
      setSelectedFarmerIds(assigned);
      setInitialFarmerIds(assigned);
    }
  }, [farmers, currentPondDetail, isOpen]);

  const filteredFarmers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return farmers;
    return farmers.filter(
      (f) =>
        f.fullName?.toLowerCase().includes(q) ||
        f.phoneNumber?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q)
    );
  }, [farmers, search]);

  if (!isOpen || !pond) return null;

  const toggleFarmer = (farmerId: string) => {
    setSelectedFarmerIds((prev) =>
      prev.includes(farmerId)
        ? prev.filter((id) => id !== farmerId)
        : [...prev, farmerId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFarmerIds(
      farmers.map((f) => f.userId || f.id || "").filter(Boolean)
    );
  };

  const handleDeselectAll = () => {
    setSelectedFarmerIds([]);
  };

  const handleReset = () => {
    setSelectedFarmerIds(initialFarmerIds);
  };

  const addedCount = selectedFarmerIds.filter(
    (id) => !initialFarmerIds.includes(id)
  ).length;
  const removedCount = initialFarmerIds.filter(
    (id) => !selectedFarmerIds.includes(id)
  ).length;

  const targetPondName =
    currentPondDetail?.pondName ||
    currentPondDetail?.name ||
    pond.pondName ||
    pond.name ||
    "Vuông nuôi";

  const handleSave = async () => {
    if (!pondId) {
      setError("Không xác định được vuông nuôi cần phân công!");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const toAdd = selectedFarmerIds.filter(
        (id) => !initialFarmerIds.includes(id)
      );
      const toRemove = initialFarmerIds.filter(
        (id) => !selectedFarmerIds.includes(id)
      );

      for (const fId of toAdd) {
        await assignPondToUser(pondId, fId);
      }
      for (const fId of toRemove) {
        await revokePondFromUser(pondId, fId);
      }

      invalidatePondsCache();
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(
        err?.message || "Không thể cập nhật phân công Nông dân cho vuông nuôi."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center p-4 bg-[#03161e]/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--panel-border-strong)] bg-[#07242e]/98 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(45,212,195,0.15)] text-left flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-6 py-4 bg-[#051c24]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300 border border-teal-500/30">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
                Phân công Nông dân (Farmer)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Vuông nuôi:{" "}
                <strong className="text-[var(--accent)] font-semibold">
                  {targetPondName}
                </strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Thanh tìm kiếm Nông dân */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm Nông dân theo họ tên, SĐT hoặc email..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--panel-border)] bg-[#051c24] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Thống kê & Thao tác chọn nhanh */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[var(--text-body)]">
              <span>
                Đang chọn:{" "}
                <strong className="text-[var(--accent)] font-bold">
                  {selectedFarmerIds.length}
                </strong>{" "}
                / {farmers.length} nông dân
              </span>
              {addedCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium">
                  +{addedCount} mới
                </span>
              )}
              {removedCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium">
                  -{removedCount} bỏ gán
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[var(--accent)] hover:underline cursor-pointer font-medium"
              >
                Chọn tất cả
              </button>
              <span className="text-gray-600">·</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-medium"
              >
                Bỏ chọn hết
              </button>
              {(addedCount > 0 || removedCount > 0) && (
                <>
                  <span className="text-gray-600">·</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[var(--text-muted)] hover:text-white hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <RotateCcw size={11} />
                    <span>Đặt lại</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Danh sách Farmer */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {loadingFarmers ? (
              <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <Loader2 size={24} className="animate-spin text-teal-400" />
                <span>Đang tải danh sách Nông dân...</span>
              </div>
            ) : filteredFarmers.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <Users size={24} className="text-slate-500" />
                <span>Không tìm thấy Nông dân (Farmer) nào phù hợp.</span>
              </div>
            ) : (
              filteredFarmers.map((farmer) => {
                const fId = farmer.userId || farmer.id || "";
                const isSelected = selectedFarmerIds.includes(fId);
                const wasInitiallyAssigned = initialFarmerIds.includes(fId);
                const initials = farmer.fullName
                  ? farmer.fullName
                      .split(" ")
                      .slice(-2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "ND";

                return (
                  <div
                    key={fId}
                    onClick={() => toggleFarmer(fId)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer select-none ${
                      isSelected
                        ? "bg-cyan-950/70 border-[var(--accent)]/80 text-white shadow-sm"
                        : wasInitiallyAssigned
                        ? "bg-rose-950/20 border-rose-900/40 text-[var(--text-muted)] hover:border-rose-700"
                        : "bg-[#051c24] border-cyan-900/40 text-[var(--text-muted)] hover:border-cyan-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition ${
                          isSelected
                            ? "bg-[var(--accent)] text-[#062621] border-[var(--accent)]"
                            : wasInitiallyAssigned
                            ? "border-rose-800 bg-rose-950/30 text-rose-400"
                            : "border-cyan-800 bg-transparent"
                        }`}
                      >
                        {isSelected ? (
                          <Check size={14} />
                        ) : wasInitiallyAssigned ? (
                          <X size={12} />
                        ) : null}
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                          <span className="truncate">{farmer.fullName}</span>
                          {wasInitiallyAssigned && isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
                              Đã phân công
                            </span>
                          )}
                          {wasInitiallyAssigned && !isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-normal">
                              Đang bỏ gán
                            </span>
                          )}
                          {!wasInitiallyAssigned && isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold">
                              Gán mới
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-subtle)] truncate">
                          {farmer.phoneNumber || "Chưa có SĐT"}
                          {farmer.email ? ` · ${farmer.email}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFarmer(fId);
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition cursor-pointer"
                        >
                          <UserMinus size={12} />
                          <span>Bỏ gán</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFarmer(fId);
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-500/30 text-cyan-300 transition cursor-pointer"
                        >
                          <UserPlus size={12} />
                          <span>Phân công</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--divider)] bg-[#051c24] flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-subtle)]">
            {addedCount > 0 || removedCount > 0 ? (
              <span className="text-teal-300 font-medium">
                {addedCount > 0 ? `Gán mới ${addedCount} ND` : ""}
                {addedCount > 0 && removedCount > 0 ? " · " : ""}
                {removedCount > 0 ? `Thu hồi ${removedCount} ND` : ""}
              </span>
            ) : (
              <span>Chọn nông dân để phân công vận hành</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !pondId}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2dd4c3] to-[#159d96] text-[#041920] text-xs font-bold hover:brightness-110 shadow-lg shadow-[#2dd4c3]/20 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span>{saving ? "Đang lưu..." : "Lưu phân công"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignFarmerToPondModal;
