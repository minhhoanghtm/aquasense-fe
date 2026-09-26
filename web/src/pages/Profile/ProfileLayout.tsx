import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import Title from "../../components/Title";
import ProfileHeader from "../../features/Profile/ProfileHeader";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useDevices } from "../../hooks/useDevices";
import { getCurrentUser, getProfile } from "../../services/authApi";
import type { User } from "../../types/User";
import { User as UserIcon, Shield, Waves, Sliders } from "lucide-react";

export interface ProfileContextValue {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  handleUserUpdated: (updatedUser: User) => void;
  ponds: ReturnType<typeof usePonds>["ponds"];
  devices: ReturnType<typeof useDevices>["devices"];
}

export const ProfileContext = React.createContext<ProfileContextValue | null>(null);

export const useProfileContext = () => {
  return React.useContext(ProfileContext);
};

export default function ProfileLayout() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(getCurrentUser());

  const { ponds } = usePonds();
  const selectedPondId = ponds.length > 0 ? ponds[0].id : "";
  const { pond, device } = usePond(selectedPondId);
  const { devices, stats } = useDevices();

  // Document title based on current path
  const getPageTitle = () => {
    if (location.pathname.includes("/security")) return "Bảo mật & Mật khẩu - AquaSense";
    if (location.pathname.includes("/ponds")) return "Vuông nuôi phụ trách - AquaSense";
    if (location.pathname.includes("/preferences") || location.pathname.includes("/settings")) return "Cài đặt & Thông báo - AquaSense";
    return "Thông tin cá nhân - AquaSense";
  };
  useDocumentTitle(getPageTitle());

  // Load user from backend /auth/me or fallback to localStorage
  useEffect(() => {
    const initUser = async () => {
      const freshUser = await getProfile();
      if (freshUser) {
        setUser(freshUser);
      } else {
        const stored = getCurrentUser();
        if (stored) setUser(stored);
      }
    };
    initUser();

    const handleStorage = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleUserUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const assignedPondsCount = user?.assignedPondIds?.length ?? (ponds.length > 0 ? ponds.length : undefined);

  const tabs = [
    {
      id: "personal",
      path: "/profile",
      aliasPaths: ["/profile/personal"],
      label: "Thông tin cá nhân",
      icon: UserIcon,
    },
    {
      id: "security",
      path: "/profile/security",
      aliasPaths: [],
      label: "Bảo mật & Mật khẩu",
      icon: Shield,
    },
    {
      id: "preferences",
      path: "/profile/preferences",
      aliasPaths: ["/profile/settings", "/settings"],
      label: "Cài đặt & Thông báo",
      icon: Sliders,
    },
  ];

  const isTabActive = (tab: (typeof tabs)[0]) => {
    if (location.pathname === tab.path) return true;
    return tab.aliasPaths.some((p) => location.pathname === p);
  };

  const contextValue: ProfileContextValue = React.useMemo(() => ({
    user,
    setUser,
    handleUserUpdated,
    ponds,
    devices,
  }), [user, ponds, devices]);

  return (
    <ProfileContext.Provider value={contextValue}>
      <div className="w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5">
        {/* Header Title */}
        <Title
          title="Hồ sơ cá nhân"
          description="Quản lý thông tin tài khoản, bảo mật và các vuông nuôi tôm thuộc quyền phụ trách"
          pond={pond}
          device={device}
        />

        {/* Hero Profile Card */}
        <ProfileHeader
          user={user}
          totalPonds={user?.assignedPondIds?.length || ponds.length}
          activeDevices={stats.active}
        />

        {/* Navigation Tabs as Links */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--divider)] pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab);
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer ${active
                    ? "bg-[var(--accent)] text-[var(--text-on-accent)] shadow-md shadow-[var(--accent)]/20"
                    : "text-[var(--text-muted)] hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)]"
                  }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${active
                        ? "bg-[var(--bg-primary)]/30 text-white"
                        : "bg-[var(--panel-bg)] text-[var(--accent)] border border-[var(--panel-border)]"
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Active Tab Content rendered via Outlet */}
        <div className="transition-all animate-in fade-in duration-300">
          <Outlet context={contextValue} />
        </div>
      </div>
    </ProfileContext.Provider>
  );
}
