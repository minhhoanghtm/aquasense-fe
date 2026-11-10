import { memo, useEffect, useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import UnassignedNoticeModal from "./UnassignedNoticeModal";
import { getCurrentUser } from "../services/authApi";
import { getPondsPage } from "../services/pondApi";
import { getFarms } from "../services/farmApi";
import { Waves } from "lucide-react";
import type { User } from "../types/User";

const MainLayout = memo(function MainLayout() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [isUnassigned, setIsUnassigned] = useState(false);
  const [checked, setChecked] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);

  const checkAssignments = useCallback(async (): Promise<boolean> => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (!user) {
      setIsUnassigned(false);
      setChecked(true);
      return true;
    }

    const role = user.role?.toUpperCase();
    if (role === "ADMIN") {
      setIsUnassigned(false);
      setChecked(true);
      return true;
    }

    try {
      if (role === "FARMER") {
        const res = await getPondsPage({ limit: 1 });
        const hasPonds = (res.total ?? 0) > 0 || (res.data && res.data.length > 0);
        setIsUnassigned(!hasPonds);
        setChecked(true);
        return hasPonds;
      }

      if (role === "MANAGER") {
        const [pondsRes, farmsRes] = await Promise.allSettled([
          getPondsPage({ limit: 1 }),
          getFarms({ limit: 1 }),
        ]);
        const pondsTotal =
          pondsRes.status === "fulfilled" ? (pondsRes.value.total ?? 0) : 0;
        const farmsTotal =
          farmsRes.status === "fulfilled" ? (farmsRes.value.total ?? 0) : 0;
        const hasAssignments = pondsTotal > 0 || farmsTotal > 0;
        setIsUnassigned(!hasAssignments);
        setChecked(true);
        return hasAssignments;
      }
    } catch (err) {
      console.warn("Lỗi kiểm tra phân công quản trị:", err);
    }

    setChecked(true);
    return true;
  }, []);

  useEffect(() => {
    checkAssignments();

    const handleUpdate = () => {
      checkAssignments();
    };

    window.addEventListener("ponds-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ponds-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [checkAssignments]);

  const handleRefreshAssignments = async (): Promise<boolean> => {
    const hasNow = await checkAssignments();
    if (hasNow) {
      window.dispatchEvent(new Event("ponds-updated"));
    }
    return hasNow;
  };

  const isProfilePage = location.pathname.startsWith("/profile");
  const userRole = currentUser?.role?.toUpperCase();
  const isTargetRole = userRole === "FARMER" || userRole === "MANAGER";

  // While initially checking for farmer/manager, render a subtle loader to avoid flashing child errors
  if (!checked && isTargetRole) {
    return (
      <>
        <Header />
        <div className="flex-1 w-full flex items-center justify-center p-6 text-center">
          <div className="text-xs text-[var(--text-muted)] animate-pulse flex items-center gap-2">
            <Waves className="w-4 h-4 text-teal-400 animate-spin" />
            Đang xác thực thông tin phân công ao nuôi...
          </div>
        </div>
      </>
    );
  }

  const showModal = isUnassigned && (!modalDismissed || !isProfilePage);

  return (
    <>
      <Header />
      <div className="flex-1 w-full flex flex-col">
        {isUnassigned && !isProfilePage ? (
          <div className="flex-1 w-full flex items-center justify-center p-6 text-center">
            <div className="dashboard-card max-w-md p-8 border border-[var(--panel-border)] bg-[var(--panel-bg)]/60 text-[var(--text-muted)] flex flex-col items-center gap-3">
              <Waves className="w-10 h-10 text-teal-400/60 animate-pulse" />
              <p className="text-sm font-semibold text-[var(--text-heading)]">
                Tài khoản đang chờ phân công phụ trách
              </p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {currentUser?.role === "MANAGER"
                  ? "Tài khoản quản lý chưa được phân công trạm nuôi. Vui lòng liên hệ Quản trị viên để được cấp quyền."
                  : "Tài khoản chưa được phân công vuông nuôi nào. Vui lòng liên hệ cấp trên để được phân công."}
              </p>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>

      <UnassignedNoticeModal
        isOpen={showModal}
        role={currentUser?.role || "FARMER"}
        fullName={currentUser?.fullName}
        onRefresh={handleRefreshAssignments}
        onClose={() => setModalDismissed(true)}
        canDismiss={isProfilePage}
      />
    </>
  );
});

export default MainLayout;
