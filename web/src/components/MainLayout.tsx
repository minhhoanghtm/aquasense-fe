import { memo, useEffect, useState, useCallback, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import AssignmentEmptyState from "./AssignmentEmptyState";
import { getCurrentUser } from "../services/authApi";
import { getPondsPage } from "../services/pondApi";
import { getFarms } from "../services/farmApi";
import { SELECTED_POND_STORAGE_KEY } from "../services/pondAccessControl";
import { useTelemetrySession } from "../hooks/useTelemetryRealtime";
import { Waves } from "lucide-react";
import type { User } from "../types/User";

const MainLayout = memo(function MainLayout() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [isUnassigned, setIsUnassigned] = useState(false);
  const [checked, setChecked] = useState(false);
  const checkVersionRef = useRef(0);

  useTelemetrySession(Boolean(currentUser && checked && !isUnassigned));

  const checkAssignments = useCallback(async (): Promise<boolean> => {
    const version = ++checkVersionRef.current;
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
        if (version !== checkVersionRef.current) return true;
        const hasPonds = (res.total ?? 0) > 0 || (res.data && res.data.length > 0);
        if (!hasPonds) {
          localStorage.removeItem(SELECTED_POND_STORAGE_KEY);
        }
        setIsUnassigned(!hasPonds);
        setChecked(true);
        return hasPonds;
      }

      if (role === "MANAGER") {
        const farmsRes = await getFarms({ limit: 1 });
        if (version !== checkVersionRef.current) return true;
        const hasAssignedFarm = (farmsRes.total ?? 0) > 0 || farmsRes.data.length > 0;
        if (!hasAssignedFarm) {
          localStorage.removeItem(SELECTED_POND_STORAGE_KEY);
        }
        setIsUnassigned(!hasAssignedFarm);
        setChecked(true);
        return hasAssignedFarm;
      }
    } catch (err) {
      console.warn("Lỗi kiểm tra phân công quản trị:", err);
    }

    if (version === checkVersionRef.current) {
      setChecked(true);
    }
    return true;
  }, []);

  useEffect(() => {
    void checkAssignments();

    const handleUpdate = () => {
      void checkAssignments();
    };

    const handleAuthCleared = () => {
      checkVersionRef.current += 1;
      setCurrentUser(null);
      setIsUnassigned(false);
      setChecked(true);
    };

    window.addEventListener("ponds-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("auth-cleared", handleAuthCleared);
    return () => {
      window.removeEventListener("ponds-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("auth-cleared", handleAuthCleared);
    };
  }, [checkAssignments]);

  const handleRefreshAssignments = async (): Promise<boolean> => {
    const hasNow = await checkAssignments();
    if (hasNow) {
      window.dispatchEvent(new Event("ponds-updated"));
    }
    return hasNow;
  };

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

  return (
    <>
      <Header />
      <div className="flex-1 w-full flex flex-col">
        {isUnassigned && !location.pathname.startsWith("/profile") ? (
          <AssignmentEmptyState user={currentUser} onRefresh={handleRefreshAssignments} />
        ) : (
          <Outlet />
        )}
      </div>
    </>
  );
});

export default MainLayout;
