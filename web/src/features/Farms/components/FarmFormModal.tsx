import React, { useState, useEffect, useCallback } from "react";
import { X, Building2, MapPin, Maximize2, Loader2, AlertCircle, Shield } from "lucide-react";
import type { Farm, CreateFarmPayload, UpdateFarmPayload } from "../../../types/Farm";
import type { User } from "../../../types/User";
import { getCurrentUser } from "../../../services/authApi";
import { getStaffList } from "../../../services/staffApi";
import Dropdown from "../../../components/Dropdown";

interface FarmFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateFarmPayload | UpdateFarmPayload) => Promise<void>;
  initialData?: Farm | null;
  loading?: boolean;
}

export const FarmFormModal: React.FC<FarmFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const [farmName, setFarmName] = useState("");
  const [address, setAddress] = useState("");
  const [totalArea, setTotalArea] = useState<string>("");
  const [ownerId, setOwnerId] = useState<string>("");
  const [managers, setManagers] = useState<User[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManagers = useCallback(async () => {
    setLoadingManagers(true);
    try {
      const res = await getStaffList({ limit: 100 });
      const mgrs = (res.data || []).filter((u) => u.role?.toUpperCase() === "MANAGER");
      setManagers(mgrs);
    } catch (e) {
      console.warn("Không thể tải danh sách Manager:", e);
    } finally {
      setLoadingManagers(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchManagers();
    }
  }, [isOpen, isAdmin, fetchManagers]);

  useEffect(() => {
    if (initialData) {
      setFarmName(initialData.farmName || "");
      setAddress(initialData.address || "");
      setTotalArea(
        initialData.totalArea !== null && initialData.totalArea !== undefined
          ? String(initialData.totalArea)
          : ""
      );
      setOwnerId(initialData.ownerId || initialData.owner?.userId || "");
    } else {
      setFarmName("");
      setAddress("");
      setTotalArea("");
      setOwnerId(currentUser?.userId || "");
    }
    setError(null);
  }, [initialData, isOpen, currentUser?.userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) {
      setError("Vui lòng nhập tên trại nuôi!");
      return;
    }

    const areaNum = totalArea.trim() ? parseFloat(totalArea) : undefined;
    if (areaNum !== undefined && (isNaN(areaNum) || areaNum <= 0)) {
      setError("Tổng diện tích phải là số lớn hơn 0!");
      return;
    }

    setError(null);
    try {
      await onSubmit({
        farmName: farmName.trim(),
        address: address.trim() || undefined,
        totalArea: areaNum,
        ownerId: isAdmin && ownerId ? ownerId : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi lưu thông tin trại nuôi!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#03161e]/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--panel-border-strong)] bg-[var(--panel-bg-dark)] p-6 sm:p-7 shadow-2xl text-left flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--divider)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300">
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-heading)]">
                {initialData ? "Chỉnh sửa trại nuôi" : "Thêm trại nuôi mới"}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {initialData
                  ? `Cập nhật thông tin cho trại "${initialData.farmName}"`
                  : "Khởi tạo thông tin cơ sở nuôi trồng thủy sản"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên trại nuôi */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Tên trại nuôi <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="VD: Trại Nuôi Tôm Sóc Trăng 01"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition"
              />
            </div>
          </div>

          {/* Quản lý phụ trách (Chỉ Admin mới có quyền chỉ định / thay đổi) */}
          {isAdmin && (
            <div className="relative z-30">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Phân quyền Quản lý phụ trách trại (Manager)
              </label>
              <Dropdown
                value={ownerId}
                options={[
                  {
                    label: loadingManagers ? "-- Đang tải danh sách Quản lý... --" : "-- Chọn Quản lý phụ trách --",
                    value: "",
                  },
                  ...managers.map((m) => ({
                    label: m.fullName,
                    description: m.phoneNumber || m.email || undefined,
                    value: m.userId || m.id || "",
                  })),
                ]}
                onChange={setOwnerId}
                icon={<Shield size={16} className="text-purple-400" />}
                placeholder="-- Chọn Quản lý phụ trách --"
                searchPlaceholder="Tìm kiếm tên hoặc SĐT Quản lý..."
              />
              <p className="text-[11px] text-[var(--text-subtle)] mt-1 pl-1">
                Quản trị viên phân quyền trại nuôi cho Quản lý này để họ phụ trách các ao nuôi trực thuộc.
              </p>
            </div>
          )}

          {/* Địa chỉ / Vị trí */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Địa chỉ / Vị trí trại
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-3 text-[var(--text-subtle)]" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: Xã Vĩnh Châu, Thị xã Vĩnh Châu, Tỉnh Sóc Trăng"
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition resize-none custom-scrollbar"
              />
            </div>
          </div>

          {/* Tổng diện tích (m²) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Tổng diện tích quy hoạch (m²)
            </label>
            <div className="relative">
              <Maximize2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="number"
                step="any"
                min="0.01"
                value={totalArea}
                onChange={(e) => setTotalArea(e.target.value)}
                placeholder="VD: 10000 (tương đương 1 ha)"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition"
              />
            </div>
            {totalArea && !isNaN(Number(totalArea)) && Number(totalArea) > 0 && (
              <p className="text-[11px] text-teal-400/80 mt-1 pl-1">
                ≈ {(Number(totalArea) / 10000).toFixed(2)} hecta (ha)
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[var(--divider)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[var(--text-body)] hover:text-white hover:bg-[var(--panel-highlight)] transition cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] text-xs sm:text-sm font-bold hover:brightness-110 shadow-md shadow-[var(--accent)]/20 transition cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{initialData ? "Lưu thay đổi" : "Tạo trại nuôi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
