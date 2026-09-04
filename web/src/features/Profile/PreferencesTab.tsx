import { useState } from "react";
import {
  Bell,
  Cpu,
  Sparkles,
  CheckCircle2,
  Save,
  Volume2,
  MessageSquare,
  Mail,
  BellRing,
  Sliders,
  Check,
} from "lucide-react";

export default function PreferencesTab() {
  const [preferences, setPreferences] = useState({
    smsAlert: true,
    emailAlert: true,
    pushNotification: true,
    soundAlarm: false,
    pollInterval: "10",
    aiAutoRecommend: true,
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setIsSaved(false);
  };

  const handleSelectChange = (key: keyof typeof preferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("aquasense_user_prefs", JSON.stringify(preferences));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const notificationChannels = [
    {
      id: "smsAlert" as const,
      title: "Tin nhắn SMS khẩn cấp",
      description: "Gửi SMS trực tiếp đến số điện thoại khi có cảnh báo mức ĐỎ (Critical).",
      icon: MessageSquare,
      color: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    },
    {
      id: "emailAlert" as const,
      title: "Email báo cáo định kỳ",
      description: "Báo cáo tổng hợp chất lượng nước & khuyến nghị AI hàng ngày vào 07:00 sáng.",
      icon: Mail,
      color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
    },
    {
      id: "pushNotification" as const,
      title: "Thông báo trình duyệt (Web Push)",
      description: "Hiển thị popup thông báo thời gian thực ngay khi đang mở hệ thống AquaSense.",
      icon: BellRing,
      color: "text-[var(--accent)] bg-[var(--accent)]/15 border-[var(--accent)]/30",
    },
    {
      id: "soundAlarm" as const,
      title: "Âm thanh còi báo động",
      description: "Phát âm thanh cảnh báo khi phát hiện bất thường môi trường nghiêm trọng.",
      icon: Volume2,
      color: "text-rose-400 bg-rose-500/15 border-rose-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Kênh thông báo & Cảnh báo khẩn cấp */}
      <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 sm:p-7 backdrop-blur-xl shadow-lg">
        {/* Header */}
        <div className="flex flex-col gap-1 pb-5 border-b border-[var(--divider)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
              <Bell size={18} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-heading)]">
              Kênh thông báo & Cảnh báo khẩn cấp
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] pl-10.5">
            Nhận thông báo tức thời khi các chỉ số môi trường (pH, DO, nhiệt độ) vượt ngưỡng an toàn
          </p>
        </div>

        {/* 2-Column Grid of Notification Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {notificationChannels.map((channel) => {
            const Icon = channel.icon;
            const isEnabled = preferences[channel.id];

            return (
              <div
                key={channel.id}
                onClick={() => handleToggle(channel.id)}
                className={`flex items-start justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none group ${
                  isEnabled
                    ? "bg-[var(--panel-bg)] border-[var(--panel-border-strong)] shadow-sm"
                    : "bg-[var(--panel-bg)]/60 border-[var(--panel-border)]/50 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-3.5 pr-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${channel.color}`}
                  >
                    <Icon size={19} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">
                        {channel.title}
                      </h4>
                      {isEnabled && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)] border border-[var(--success)]/30">
                          <Check size={10} /> Đang bật
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {channel.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <div className="pt-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(channel.id);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-[var(--accent)]" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Cấu hình cảm biến & AI */}
      <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 sm:p-7 backdrop-blur-xl shadow-lg">
        {/* Header */}
        <div className="flex flex-col gap-1 pb-5 border-b border-[var(--divider)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
              <Cpu size={18} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-heading)]">
              Tần suất đồng bộ & Trợ lý AI
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] pl-10.5">
            Cấu hình tốc độ đồng bộ dữ liệu cảm biến IoT và gợi ý can thiệp từ mô hình AI
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Chu kỳ cập nhật */}
          <div className="space-y-2 p-4 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]">
            <label className="text-xs font-bold text-[var(--text-body)] flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders size={14} className="text-[var(--accent)]" />
              Chu kỳ cập nhật cảm biến
            </label>
            <p className="text-xs text-[var(--text-muted)]">
              Tần suất lấy mẫu dữ liệu từ trạm Gateway đo pH, DO, Salinity
            </p>
            <select
              value={preferences.pollInterval}
              onChange={(e) => handleSelectChange("pollInterval", e.target.value)}
              className="w-full mt-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 cursor-pointer"
            >
              <option value="5">Thời gian thực (5 giây / lần)</option>
              <option value="10">Tiêu chuẩn (10 giây / lần)</option>
              <option value="30">Tiết kiệm mạng (30 giây / lần)</option>
              <option value="60">Định kỳ (1 phút / lần)</option>
            </select>
          </div>

          {/* Tự động phân tích AI */}
          <div className="space-y-2 p-4 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)]">
            <label className="text-xs font-bold text-[var(--text-body)] flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles size={14} className="text-[var(--accent)]" />
              Tự động phân tích & Khuyến nghị AI
            </label>
            <p className="text-xs text-[var(--text-muted)]">
              Tự động chẩn đoán bất thường và đề xuất giải pháp xử lý nước
            </p>
            <select
              value={preferences.aiAutoRecommend ? "true" : "false"}
              onChange={(e) => handleSelectChange("aiAutoRecommend", e.target.value === "true")}
              className="w-full mt-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 cursor-pointer"
            >
              <option value="true">Bật - Phân tích & Gợi ý hành động tự động</option>
              <option value="false">Tắt - Chỉ hiển thị dữ liệu thuần</option>
            </select>
          </div>
        </div>

        {/* Save Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-[var(--divider)]">
          {isSaved ? (
            <span className="flex items-center gap-1.5 text-xs text-[var(--success)] font-medium">
              <CheckCircle2 size={16} /> Đã lưu toàn bộ tùy chọn thành công!
            </span>
          ) : (
            <span className="text-xs text-[var(--text-subtle)]">
              Tùy chọn sẽ được lưu vào hệ thống và áp dụng ngay lập tức.
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] text-[var(--text-on-accent)] px-6 py-2.5 text-sm font-bold shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:brightness-105 active:scale-[0.98] transition duration-200 cursor-pointer w-full sm:w-auto"
          >
            <Save size={16} />
            <span>Lưu tất cả tùy chọn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
