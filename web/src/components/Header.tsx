import { useState, useEffect, useRef } from "react";
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

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener("storage", handleStorageUpdate);

    const handleClickOutside = (event: MouseEvent) => {
      // Click outside profile dropdown
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      // Click outside mobile menu (both button and nav panel)
      if (
        mobileButtonRef.current && !mobileButtonRef.current.contains(event.target as Node) &&
        (!mobileNavRef.current || !mobileNavRef.current.contains(event.target as Node))
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event: Event) => {
      const target = event.target as Node;
      // Close profile dropdown if scrolled outside
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      // Close mobile menu if scrolled outside
      if (
        (!mobileNavRef.current || !mobileNavRef.current.contains(target)) &&
        (!mobileButtonRef.current || !mobileButtonRef.current.contains(target))
      ) {
        setIsOpen(false);
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
    <header className="sticky top-0 z-50 w-full bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--panel-border)]/40 shadow-sm">
      {/* ================= HEADER ================= */}
      <div
        className="flex h-14 sm:h-16 w-full max-w-7xl mx-auto items-center gap-3 px-4 sm:px-6">
        {/* ================= LOGO ================= */}
        <Link to="/">
          <div className="flex shrink-0 items-center gap-2">
            <WavesHorizontal
              className="h-5 w-5 text-[var(--leaf-highlight)]" />

            <span className="text-base font-bold text-[var(--text-primary)] sm:text-lg">AquaSense</span>

            <span className="text-[8px] font-bold text-[#2dd4c3] sm:text-[9px]">IoT</span>
          </div>
        </Link>

        {/* ================= SEARCH DESKTOP ================= */}
        <div className="ml-3 hidden h-8.5 w-[200px] shrink-0 items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2.5 lg:flex xl:w-[230px]">
          <Search size={14} className="shrink-0 text-[var(--text-muted)]" />

          <input type="text" placeholder="Tìm vuông, cảm biến, cảnh báo..."
            className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
        </div>

        {/* ================= DESKTOP NAVIGATION ================= */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <Navigation />
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {/* ================= NOTIFICATION BELL ================= */}
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-muted)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)]">
            <Bell size={15} />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff6678] text-[8px] font-bold text-white border border-[var(--bg-primary)]">
              2
            </span>
          </button>

          {/* ================= USER PROFILE ================= */}
          <div ref={profileRef} className="flex items-center gap-2">
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

              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                  {currentUser?.fullName || "Nguyễn Văn An"}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                  {currentUser?.role === "ADMIN"
                    ? "Quản trị viên"
                    : currentUser?.role === "TECHNICIAN"
                    ? "Kỹ thuật viên"
                    : "Nông dân"}
                </p>
              </div>
            </button>
            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-xl backdrop-blur-xl text-left">
                {/* User Info */}
                <div className="border-b border-[var(--divider)] px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {currentUser?.fullName || "Nguyễn Văn An"}
                  </p>

                  <p className="text-xs text-[var(--text-muted)]">
                    {currentUser?.email || "farmer@example.com"}
                  </p>
                </div>

                {/* Profile */}
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-body)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)]">
                  <User size={17} />
                  <span>Hồ sơ cá nhân</span>
                </Link>

                {/* Settings */}
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-body)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)]">
                  <Settings size={17} />
                  <span>Cài đặt</span>
                </Link>

                {/* Notifications */}
                <Link to="/notifications" className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-body)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)]">
                  <Bell size={17} />
                  <span>Thông báo</span>
                </Link>

                {/* Divider */}
                <div className="border-t border-[var(--divider)]" />

                {/* Logout */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10 cursor-pointer"
                  onClick={() => {
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

          {/* ================= MOBILE MENU ================= */}
          <button
            ref={mobileButtonRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--panel-bg)] text-[var(--text-muted)] transition hover:bg-[var(--panel-highlight)] hover:text-[var(--text-primary)] lg:hidden" aria-label="Menu">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE SEARCH ================= */}
      <div className="px-4 pb-3 sm:px-5 lg:hidden">
        <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3">
          <Search size={16} className="shrink-0 text-[var(--text-muted)]" />
          <input type="text" placeholder="Tìm vuông, cảm biến, cảnh báo..." className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
        </div>
      </div>

      {/* ================= MOBILE NAVIGATION ================= */}
      {isOpen && (
        <div ref={mobileNavRef} className="absolute left-0 right-0 top-full z-50 border-y border-[var(--panel-border)] bg-[var(--panel-bg)] p-3 shadow-xl lg:hidden">
          <MobileNavigation onClose={() => setIsOpen(false)} />
        </div>
      )}

    </header>
  );
};

export default Header;
