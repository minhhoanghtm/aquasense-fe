/**
 * Tiện ích chuẩn hóa ngày giờ theo định dạng chuẩn Việt Nam (vi-VN, Asia/Ho_Chi_Minh)
 * Định dạng ngày: DD/MM/YYYY
 * Định dạng giờ: 24 giờ (HH:mm hoặc HH:mm:ss)
 */

export interface FormatDateTimeOptions {
  showSeconds?: boolean;
  dateFirst?: boolean;
}

/**
 * Định dạng ngày giờ đầy đủ chuẩn Việt Nam: DD/MM/YYYY HH:mm:ss (hoặc HH:mm nếu showSeconds = false)
 */
export const formatVietnamDateTime = (
  date?: string | Date | null,
  options?: FormatDateTimeOptions
): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  const showSeconds = options?.showSeconds ?? true;
  const dateFirst = options?.dateFirst ?? true;

  const parts = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(showSeconds ? { second: "2-digit" } : {}),
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const day = get("day");
  const month = get("month");
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");

  const timeStr = showSeconds ? `${hour}:${minute}:${second}` : `${hour}:${minute}`;
  const dateStr = `${day}/${month}/${year}`;

  return dateFirst ? `${dateStr} ${timeStr}` : `${timeStr} ${dateStr}`;
};

/**
 * Định dạng ngày chuẩn Việt Nam: DD/MM/YYYY
 */
export const formatVietnamDate = (date?: string | Date | null): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

/**
 * Định dạng giờ chuẩn Việt Nam: HH:mm hoặc HH:mm:ss
 */
export const formatVietnamTime = (
  date?: string | Date | null,
  showSeconds: boolean = false
): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    ...(showSeconds ? { second: "2-digit" } : {}),
    hour12: false,
  }).format(d);
};

/**
 * Định dạng ngắn gọn ngày giờ: DD/MM/YYYY HH:mm
 */
export const formatVietnamDateTimeShort = (
  date?: string | Date | null
): string => {
  return formatVietnamDateTime(date, { showSeconds: false, dateFirst: true });
};

/**
 * Hiển thị khoảng thời gian tương đối theo tiếng Việt (Vừa xong, X phút trước, X giờ trước...)
 */
export const getTimeAgo = (date?: string | Date | null): string => {
  if (!date) return "Chưa cập nhật";
  const timestamp = new Date(date).getTime();
  if (isNaN(timestamp)) return "Chưa cập nhật";

  const diff = Date.now() - timestamp;
  if (diff < 0) return "Vừa xong";

  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

/**
 * Định dạng thời lượng (duration) ra tiếng Việt (phút, giờ, ngày)
 */
export const formatVietnamDuration = (ms: number): string => {
  if (ms <= 0) return "0 phút";
  const minutes = Math.round(ms / (1000 * 60));
  if (minutes < 1) return "< 1 phút";
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) {
    return remMinutes > 0 ? `${hours} giờ ${remMinutes} phút` : `${hours} giờ`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days} ngày ${remHours} giờ` : `${days} ngày`;
};
