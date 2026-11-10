import { useState, useEffect, useRef, memo } from "react";
import {
  WavesHorizontal,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { Navigation, MobileNavigation } from "./Navigation";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authApi";
import type { User as UserType } from "../types/User";
import { getRoleLabel } from "../lib/rolePermissions";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserType | null>(getCurrentUser());
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const seenAlertIds = useRef(new Set<string>());

  useEffect(() => {
    const handleStorageUpdate = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener("storage", handleStorageUpdate);
    const handleAlert = (event: Event) => {
      const customEvent = event as CustomEvent<{ alert?: unknown }>;
      const alert = customEvent?.detail?.alert;
      if (!alert) return;
      const id = typeof alert === "object" && alert !== null && "alertId" in alert && typeof alert.alertId === "string"
        ? alert.alertId
        : typeof alert === "object" && alert !== null && "id" in alert && typeof alert.id === "string"
          ? alert.id
          : undefined;
      if (!id || seenAlertIds.current.has(id)) return;
      seenAlertIds.current.add(id);
      setNotificationCount((count) => count + 1);
    };
    window.addEventListener("alerts-updated", handleAlert);

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen((prev) => (prev ? false : prev));
      }
      if (
        mobileButtonRef.current && !mobileButtonRef.current.contains(target) &&
        (!mobileNavRef.current || !mobileNavRef.current.contains(target))
      ) {
        setIsOpen((prev) => (prev ? false : prev));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("alerts-updated", handleAlert);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Only listen to scroll to close dropdowns when a dropdown is actually open
  useEffect(() => {
    if (!isProfileOpen && !isOpen) return;
    const handleScroll = () => {
      setIsProfileOpen(false);
      setIsOpen(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isProfileOpen, isOpen]);
  return (
    <header className="sticky top-0 z-50 w-full bg-[#061c24] border-b border-[var(--panel-border)]/60 shadow-md">
      {/* ================= HEADER ================= */}
      <div
        className="relative z-50 flex h-14 sm:h-16 w-full items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 bg-[#061c24]">
        {/* ================= LOGO ================= */}
        <Link to="/" className="shrink-0">
          <div className="flex shrink-0 items-center gap-2">
            <WavesHorizontal
              className="h-5 w-5 text-[var(--leaf-highlight)]" />

            <span className="text-base font-bold text-[var(--text-primary)] sm:text-lg">AquaSense</span>

            <span className="text-[8px] font-bold text-[#2dd4c3] sm:text-[9px]">IoT</span>
          </div>
        </Link>

        {/* ================= DESKTOP NAVIGATION ================= */}
        <div className="hidden items-center justify-center lg:flex px-2 flex-1 min-w-0">
          <Navigation />
        </div>

        {/* ================= RIGHT SIDE (SEARCH + NOTIFICATION + USER) ================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* ================= SEARCH DESKTOP (FIXED ON RIGHT) ================= */}
          <div className={`hidden h-8.5 items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2.5 xl:flex hover:border-cyan-500 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]/40 transition-all duration-300 ease-in-out ${
            isSearchFocused ? 'w-48 xl:w-56 2xl:w-64' : 'w-32 xl:w-36 2xl:w-48'
          }`}>
            <Search size={14} className="shrink-0 text-[var(--text-muted)]" />

            <input
              type="text"
              placeholder="Tìm kiếm..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* ================= NOTIFICATION BELL ================= */}
          <button
            type="button"
            onClick={() => navigate("/alerts")}
            title="Cảnh báo & Lịch sử"
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)] cursor-pointer">
            <Bell size={15} />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          {/* ================= USER PROFILE ================= */}
          <div ref={profileRef} className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-[var(--panel-highlight)] cursor-pointer"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-semibold text-[var(--text-on-accent)] text-xs uppercase">
                {currentUser?.fullName
                  ? currentUser.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(-2)
                      .join("")
                  : "?"}
              </div>

              <div className="hidden 2xl:block text-left">
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                  {currentUser?.fullName || "Chưa đăng nhập"}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                  {getRoleLabel(currentUser?.role)}
                </p>
              </div>
            </button>
            {/* Profile Dropdown */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
                  onClick={() => setIsProfileOpen(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-cyan-800/80 bg-[#061c24] shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-left"
                >
                  {/* User Info */}
                  <div className="border-b border-cyan-900/60 px-4 py-3 bg-[#04161d]">
                    <p className="text-sm font-medium text-[var(--text-heading)]">
                      {currentUser?.fullName || "Chưa đăng nhập"}
                    </p>

                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {currentUser?.phoneNumber || currentUser?.email || "Chưa có thông tin liên hệ"}
                    </p>
                  </div>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-body)] transition hover:bg-[#092b36] hover:text-[var(--text-heading)]"
                  >
                    <User size={17} className="text-[var(--text-muted)]" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>

                  {/* Settings */}
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-body)] transition hover:bg-[#092b36] hover:text-[var(--text-heading)]"
                  >
                    <Settings size={17} className="text-[var(--text-muted)]" />
                    <span>Cài đặt</span>
                  </Link>

                  {/* Notifications -> Alerts */}
                  <Link
                    to="/alerts"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-body)] transition hover:bg-[#092b36] hover:text-[var(--text-heading)]"
                  >
                    <Bell size={17} className="text-[var(--text-muted)]" />
                    <span>Thông báo & Cảnh báo</span>
                  </Link>

                  {/* Divider */}
                  <div className="border-t border-cyan-900/60" />

                  {/* Logout */}
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[var(--critical)] transition hover:bg-[var(--critical-bg)] cursor-pointer"
                    disabled={isLoggingOut}
                    onClick={async () => {
                      setIsProfileOpen(false);
                      setIsLoggingOut(true);
                      try {
                        await logout();
                        navigate("/login");
                      } catch (error) {
                        console.error("Đăng xuất thất bại:", error);
                      } finally {
                        setIsLoggingOut(false);
                      }
                    }}
                  >
                    <LogOut size={17} />
                    <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            ref={mobileButtonRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-heading)] lg:hidden cursor-pointer"
            aria-label="Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE SEARCH ================= */}
      <div className="relative z-50 px-4 pb-3 sm:px-5 lg:hidden bg-[#061c24]">
        <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg-dark)] px-3 hover:border-cyan-500 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]/40 transition-colors">
          <Search size={16} className="shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm vuông, cảm biến, cảnh báo..."
            className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none border-none focus:outline-none focus:ring-0 placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* ================= MOBILE NAVIGATION & BACKDROP ================= */}
      {isOpen && (
        <>
          {/* Lớp nền mờ tối che phủ toàn bộ nội dung trang bên dưới để không bị xuyên thấu / nhầm lẫn */}
          <div
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden animate-fadeIn"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Khung menu dropdown với màu nền đặc 100%, không bị xuyên thấu */}
          <div
            ref={mobileNavRef}
            className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-120px)] overflow-y-auto border-b border-cyan-800/80 bg-[#061c24] p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] lg:hidden animate-fadeIn"
          >
            <MobileNavigation onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}

    </header>
  );
};

export default memo(Header, () => true);
