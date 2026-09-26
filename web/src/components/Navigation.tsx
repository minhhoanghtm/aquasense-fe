import { memo, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Waves,
  Cpu,
  BellRing,
  Brain,
  Users,
} from "lucide-react";
import { getCurrentUser } from "../services/authApi";
import type { User as UserType } from "../types/User";

const navigation = [
  {
    label: "Tổng quan",
    link: "/dashboard",
    icon: LayoutDashboard,
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

  const filteredNavigation = navigation.filter(
    (item) => !item.allowedRoles || (currentUser?.role && item.allowedRoles.includes(currentUser.role))
  );

  return (
    <nav className="flex items-center gap-1 xl:gap-2">
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
              px-2.5
              xl:px-3
              py-1.5
              text-xs
              xl:text-sm
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

  const filteredNavigation = navigation.filter(
    (item) => !item.allowedRoles || (currentUser?.role && item.allowedRoles.includes(currentUser.role))
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
                  ? "bg-[var(--panel-bg-dark)] text-[var(--accent)] font-semibold border border-[var(--panel-border-strong)]"
                  : "text-[var(--text-body)] hover:bg-[var(--panel-highlight)] hover:text-[var(--text-heading)] border border-transparent"
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