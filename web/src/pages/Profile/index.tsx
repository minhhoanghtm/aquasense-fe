import { useState, useEffect } from "react";
import Title from "../../components/Title";
import ProfileHeader from "../../features/Profile/ProfileHeader";
import PersonalInfoTab from "../../features/Profile/PersonalInfoTab";
import SecurityTab from "../../features/Profile/SecurityTab";
import ManagedPondsTab from "../../features/Profile/ManagedPondsTab";
import PreferencesTab from "../../features/Profile/PreferencesTab";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePonds } from "../../hooks/usePonds";
import { usePond } from "../../hooks/usePond";
import { useDevices } from "../../hooks/useDevices";
import { getCurrentUser } from "../../services/authApi";
import type { User } from "../../types/User";
import { User as UserIcon, Shield, Waves, Sliders } from "lucide-react";

export default function Profile() {
  useDocumentTitle("Hồ sơ cá nhân - AquaSense");

  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "ponds" | "preferences">("personal");

  const { ponds } = usePonds();
  const selectedPondId = ponds.length > 0 ? ponds[0].id : "";
  const { pond, device } = usePond(selectedPondId);
  const { devices, stats } = useDevices();

  // Keep user updated if changed in localStorage / storage event
  useEffect(() => {
    const handleStorage = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleUserUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const tabs = [
    {
      id: "personal",
      label: "Thông tin cá nhân",
      icon: UserIcon,
    },
    {
      id: "security",
      label: "Bảo mật & Mật khẩu",
      icon: Shield,
    },
    {
      id: "ponds",
      label: "Vuông nuôi phụ trách",
      icon: Waves,
      badge: ponds.length > 0 ? ponds.length : undefined,
    },
    {
      id: "preferences",
      label: "Cài đặt & Thông báo",
      icon: Sliders,
    },
  ];

  return (
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
        totalPonds={ponds.length}
        activeDevices={stats.active}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--divider)] pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--accent)] text-[var(--text-on-accent)] shadow-md shadow-[var(--accent)]/20"
                  : "text-[var(--text-muted)] hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? "bg-[var(--bg-primary)]/30 text-white"
                      : "bg-[var(--panel-bg)] text-[var(--accent)] border border-[var(--panel-border)]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="transition-all animate-in fade-in duration-300">
        {activeTab === "personal" && (
          <PersonalInfoTab user={user} onUserUpdated={handleUserUpdated} />
        )}
        {activeTab === "security" && <SecurityTab user={user} />}
        {activeTab === "ponds" && (
          <ManagedPondsTab ponds={ponds} devices={devices} />
        )}
        {activeTab === "preferences" && <PreferencesTab />}
      </div>
    </div>
  );
}
