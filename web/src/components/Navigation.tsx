import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Waves,
  Cpu,
  BellRing,
  Brain,
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
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-2 sm:gap-3">
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
              px-3.5
              py-1.5
              text-xs sm:text-sm
              font-medium
              whitespace-nowrap
              transition
              ${isActive
                ? "bg-[#0b353e] text-[var(--accent)] border border-[#2dd4c3]/20 shadow-inner"
                : "text-[var(--text-body)] hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)]"
              }
            `}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};


export const MobileNavigation = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  return (
    <nav className="flex flex-col gap-1">
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.link}
            to={item.link}
            onClick={onClose}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-4
              py-3

              text-sm
              font-medium
              text-[var(--text-body)]

              transition

              hover:bg-[var(--panel-highlight)]
              hover:text-[var(--text-primary)]
            "
          >
            <Icon
              size={18}
              className="text-[var(--leaf-highlight)]"
            />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};