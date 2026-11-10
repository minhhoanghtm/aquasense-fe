import { memo, useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Waves,
  Cpu,
  BellRing,
  Brain,
  Users,
} from "lucide-react";
import { getCurrentUser } from "../services/authApi";
import type { User as UserType } from "../types/User";
import { canAccessRoute } from "../lib/rolePermissions";

const navigation = [
  {
    label: "Tổng quan",
    link: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Quản lý trại nuôi",
    link: "/farms",
    icon: Building2,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Quản lý vuông nuôi",
    link: "/monitoring",
    icon: Waves,
  },
  {
    label: "Cảm biến & Thiết bị",
    link: "/devices",
    icon: Cpu,
  },
  {
    label: "Cảnh báo & Lịch sử",
    link: "/alerts",
    icon: BellRing,
  },
  {
    label: "Phân tích AI",
    link: "/ai-analysis",
    icon: Brain,
  },
  {
    label: "Quản lý nhân viên",
    link: "/staff",
    icon: Users,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
];

export const Navigation = memo(() => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<UserType | null>(getCurrentUser());

  useEffect(() => {
    const handleStorageUpdate = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const filteredNavigation = useMemo(
    () => navigation.filter((item) => canAccessRoute(currentUser?.role, item.allowedRoles)),
    [currentUser?.role]
  );

  return (
    <nav className="flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2">
      {filteredNavigation.map((item) => {
        const isActive = location.pathname === item.link || 
          (item.link === "/dashboard" && location.pathname === "/");

        return (
          <Link
            key={item.link}
            to={item.link}
            className={`
              flex
              items-center
              rounded-xl
              px-2
              xl:px-2.5
              2xl:px-3
              py-1.5
              text-xs
              2xl:text-sm
              font-medium
              whitespace-nowrap
              border
              transition-colors
              duration-150
              ${isActive
                ? "bg-[var(--panel-bg-dark)] text-[var(--accent)] border-[var(--panel-border-strong)] shadow-inner font-semibold"
                : "border-transparent text-[var(--text-body)] hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)]"
              }
            `}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
});


export const MobileNavigation = memo(({
  onClose,
}: {
  onClose: () => void;
}) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<UserType | null>(getCurrentUser());

  useEffect(() => {
    const handleStorageUpdate = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const filteredNavigation = useMemo(
    () => navigation.filter((item) => canAccessRoute(currentUser?.role, item.allowedRoles)),
    [currentUser?.role]
  );

  return (
    <nav className="flex flex-col gap-1">
      {filteredNavigation.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.link ||
          (item.link === "/dashboard" && location.pathname === "/");

        return (
          <Link
            key={item.link}
            to={item.link}
            onClick={onClose}
            className={`
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-medium
              transition
              cursor-pointer
              ${
                isActive
                  ? "bg-[#0b2f3a] text-cyan-300 font-semibold border border-cyan-500/50 shadow-sm"
                  : "text-slate-200 hover:bg-[#07242e] hover:text-white border border-transparent"
              }
            `}
          >
            <Icon
              size={18}
              className={isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}
            />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
});
