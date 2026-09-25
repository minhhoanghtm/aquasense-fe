import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Waves,
  Cpu,
  BellRing,
  Brain,
  Users,
} from "lucide-react";

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
  },
];

export const Navigation = memo(() => {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1 xl:gap-2">
      {navigation.map((item) => {
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
                ? "bg-[#0b353e] text-[var(--accent)] border-[#2dd4c3]/20 shadow-inner font-semibold"
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

  return (
    <nav className="flex flex-col gap-1">
      {navigation.map((item) => {
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
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                  : "text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300"
              }
            `}
          >
            <Icon
              size={18}
              className={isActive ? "text-cyan-400" : "text-cyan-500/80"}
            />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
});