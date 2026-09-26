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
import { api } from "../services/api";
import type { User as UserType } from "../types/User";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(getCurrentUser());
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const stored = getCurrentUser();
      if (stored) {
        setCurrentUser(stored);
      } else {
        try {
          const res = await api<any>("/users");
          const usersList = Array.isArray(res) ? res : (res?.data ?? []);
          if (usersList && usersList.length > 0) {
            setCurrentUser(usersList[0]);
            localStorage.setItem("aquasense_user", JSON.stringify(usersList[0]));
          }
        } catch {
          // ignore
        }
      }
    };
    initUser();

    const handleStorageUpdate = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener("storage", handleStorageUpdate);

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

    const handleScroll = (event: Event) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen((prev) => (prev ? false : prev));
      }
      if (
        (!mobileNavRef.current || !mobileNavRef.current.contains(target)) &&
        (!mobileButtonRef.current || !mobileButtonRef.current.contains(target))
      ) {
        setIsOpen((prev) => (prev ? false : prev));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);
  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--panel-border)]/40 shadow-sm transform-gpu">
      {/* ================= HEADER ================= */}
      <div
        className="flex h-14 sm:h-16 w-full max-w-[1440px] mx-auto items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6">
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
        <div 
          className={`hidden items-center justify-center lg:flex px-2 overflow-hidden transition-all duration-500 ease-in-out ${
            isSearchFocused ? 'max-w-0 opacity-0' : 'flex-1 max-w-[1000px] opacity-100'
          }`}
        >
          <div className="min-w-max">
            <Navigation />
          </div>
        </div>

        {/* ================= RIGHT SIDE (SEARCH + NOTIFICATION + USER) ================= */}
        <div className={`flex items-center gap-2 sm:gap-3 transition-all duration-500 ease-in-out ${isSearchFocused ? 'flex-1' : 'shrink-0'}`}>
          {/* ================= SEARCH DESKTOP (FIXED ON RIGHT) ================= */}
          <div className={`hidden h-8.5 items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2.5 xl:flex focus-within:border-[var(--accent)] transition-all duration-500 ease-in-out ${
            isSearchFocused ? 'flex-1 w-full' : 'w-36 2xl:w-48 shrink-0'
          }`}>
            <Search size={14} className="shrink-0 text-[var(--text-muted)]" />

            <input
              type="text"
              placeholder="Tìm kiếm..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] !border-none !shadow-none"
            />
          </div>

          {/* ================= NOTIFICATION BELL ================= */}
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)] cursor-pointer">
            <Bell size={15} />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff6678] text-[8px] font-bold text-white border border-[var(--bg-primary)]">
              2
            </span>
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
                  : "ND"}
              </div>

              <div className="hidden 2xl:block text-left">
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                  {currentUser?.fullName || "Nguyễn Văn An"}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                  {currentUser?.role === "MANAGER" || currentUser?.role === "ADMIN"
                    ? "Quản lý"
                    : "Nông dân"}
                </p>
              </div>
            </button>
            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-lg text-left"
              >
                {/* User Info */}
                <div className="border-b border-[var(--panel-border)] px-4 py-3 bg-[var(--panel-bg-dark)]">
                  <p className="text-sm font-medium text-[var(--text-heading)]">
                    {currentUser?.fullName || "Nguyễn Văn An"}
                  </p>

                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {currentUser?.phoneNumber || currentUser?.email || "farmer@example.com"}
                  </p>
                </div>

                {/* Profile */}
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-body)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-heading)]"
                >
                  <User size={17} className="text-[var(--text-muted)]" />
                  <span>Hồ sơ cá nhân</span>
                </Link>

                {/* Settings */}
                <Link
                  to="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-body)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-heading)]"
                >
                  <Settings size={17} className="text-[var(--text-muted)]" />
                  <span>Cài đặt</span>
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-body)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-heading)]"
                >
                  <Bell size={17} className="text-[var(--text-muted)]" />
                  <span>Thông báo</span>
                </Link>

                {/* Divider */}
                <div className="border-t border-[var(--panel-border)]" />

                {/* Logout */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[var(--critical)] transition hover:bg-[var(--critical-bg)] cursor-pointer"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogOut size={17} />
                  <span>Đăng xuất</span>
                </button>
              </div>
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
      <div className="px-4 pb-3 sm:px-5 lg:hidden">
        <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3">
          <Search size={16} className="shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm vuông, cảm biến, cảnh báo..."
            className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* ================= MOBILE NAVIGATION ================= */}
      {isOpen && (
        <div
          ref={mobileNavRef}
          className="absolute left-0 right-0 top-full z-50 border-b border-[var(--panel-border)] bg-[var(--panel-bg)] p-3 shadow-lg lg:hidden"
        >
          <MobileNavigation onClose={() => setIsOpen(false)} />
        </div>
      )}

    </header>
  );
};

export default memo(Header);
