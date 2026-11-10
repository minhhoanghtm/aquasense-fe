import * as XLSX from "xlsx";
import { formatVietnamDateTime } from "./date";

export interface ExportAlertItem {
  id: string;
  time?: string;
  createdAt?: string;
  title: string;
  pondId?: string;
  pondName?: string;
  value?: number | string;
  unit?: string;
  level: string;
  status: string;
  message?: string;
  metricName?: string;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
}

export interface ExportFilterInfo {
  pondName?: string;
  startDate?: string;
  endDate?: string;
  datePreset?: string;
  levelOrStatus?: string;
  searchKeyword?: string;
}

export const exportAlertsToExcel = (
  alerts: ExportAlertItem[],
  filterInfo?: ExportFilterInfo,
  summary?: { danger: number; warning: number; resolved: number }
): void => {
  const wb = XLSX.utils.book_new();

  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const total = safeAlerts.length;

  const dangerCount =
    summary?.danger ??
    safeAlerts.filter(
      (a) =>
        a.level === "DANGER" ||
        a.level === "CRITICAL" ||
        String(a.level).toUpperCase() === "CRITICAL"
    ).length;

  const warningCount =
    summary?.warning ??
    safeAlerts.filter(
      (a) => a.level === "WARNING" || String(a.level).toUpperCase() === "WARNING"
    ).length;

  const resolvedCount =
    summary?.resolved ??
    safeAlerts.filter(
      (a) =>
        a.status === "RESOLVED" ||
        a.status === "Đã xử lý" ||
        String(a.status).toUpperCase() === "RESOLVED"
    ).length;

  const unresolvedCount = Math.max(0, total - resolvedCount);

  // Date range description text
  let dateRangeText = "Tất cả thời gian";
  if (filterInfo?.startDate && filterInfo?.endDate) {
    dateRangeText = `Từ ${filterInfo.startDate} đến ${filterInfo.endDate}`;
  } else if (filterInfo?.startDate) {
    dateRangeText = `Từ ${filterInfo.startDate}`;
  } else if (filterInfo?.endDate) {
    dateRangeText = `Đến ${filterInfo.endDate}`;
  } else if (filterInfo?.datePreset && filterInfo.datePreset !== "ALL") {
    dateRangeText = filterInfo.datePreset;
  }

  /* ==========================================
     SHEET 1: DANH SÁCH CHI TIẾT CẢNH BÁO
     ========================================== */
  const sheet1Data: (string | number)[][] = [
    ["HỆ THỐNG GIÁM SÁT VUÔNG TÔM THÔNG MINH - SMART SHRIMP FARM"],
    ["BÁO CÁO LỊCH SỬ CẢNH BÁO & SỰ CỐ CHẤT LƯỢNG NƯỚC"],
    [`Thời gian xuất báo cáo: ${formatVietnamDateTime(new Date())}`],
    [
      `Bộ lọc: Ao nuôi: ${filterInfo?.pondName || "Tất cả"} | Thời gian: ${dateRangeText} | Trạng thái: ${
        filterInfo?.levelOrStatus || "Tất cả"
      }${filterInfo?.searchKeyword ? ` | Từ khóa: "${filterInfo.searchKeyword}"` : ""}`,
    ],
    [
      `Tổng số cảnh báo: ${total} | Mức nguy hiểm: ${dangerCount} | Mức cảnh báo: ${warningCount} | Đã xử lý: ${resolvedCount} | Chưa xử lý: ${unresolvedCount}`,
    ],
    [], // Dòng trống ngăn cách
    [
      "STT",
      "Mã cảnh báo",
      "Thời gian phát hiện",
      "Ao nuôi",
      "Thông số vi phạm",
      "Giá trị đo được",
      "Đơn vị",
      "Mức độ cảnh báo",
      "Trạng thái xử lý",
      "Thời gian giải quyết",
      "Biện pháp khắc phục / Ghi chú",
      "Nội dung chi tiết",
    ],
  ];

  safeAlerts.forEach((alert, index) => {
    const isDanger =
      alert.level === "DANGER" ||
      alert.level === "CRITICAL" ||
      String(alert.level).toUpperCase() === "CRITICAL";
    const isResolved =
      alert.status === "RESOLVED" ||
      alert.status === "Đã xử lý" ||
      String(alert.status).toUpperCase() === "RESOLVED";

    const displayTime = alert.createdAt
      ? formatVietnamDateTime(alert.createdAt)
      : alert.time || "-";

    const displayResolvedAt = alert.resolvedAt
      ? formatVietnamDateTime(alert.resolvedAt)
      : "-";

    sheet1Data.push([
      index + 1,
      alert.id || "-",
      displayTime,
      alert.pondName || "Ao nuôi",
      alert.metricName || alert.title || "-",
      alert.value !== undefined && alert.value !== null ? String(alert.value) : "-",
      alert.unit || "-",
      isDanger ? "NGUY HIỂM" : "CẢNH BÁO",
      isResolved ? "ĐÃ XỬ LÝ" : "CHƯA XỬ LÝ",
      displayResolvedAt,
      alert.resolutionNote || "-",
      alert.message || alert.title || "-",
    ]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  // Cấu hình độ rộng các cột cho Sheet 1
  ws1["!cols"] = [
    { wch: 6 },  // STT
    { wch: 20 }, // Mã cảnh báo
    { wch: 22 }, // Thời gian phát hiện
    { wch: 18 }, // Ao nuôi
    { wch: 18 }, // Thông số
    { wch: 14 }, // Giá trị
    { wch: 10 }, // Đơn vị
    { wch: 18 }, // Mức độ
    { wch: 16 }, // Trạng thái
    { wch: 22 }, // Thời gian giải quyết
    { wch: 35 }, // Biện pháp khắc phục
    { wch: 45 }, // Nội dung chi tiết
  ];

  XLSX.utils.book_append_sheet(wb, ws1, "Danh sách cảnh báo");

  /* ==========================================
     SHEET 2: THỐNG KÊ TỔNG HỢP & THEO AO NUÔI
     ========================================== */
  const pondStatsMap = new Map<
    string,
    { total: number; danger: number; warning: number; resolved: number }
  >();

  safeAlerts.forEach((a) => {
    const pName = a.pondName || "Chưa phân loại";
    const current = pondStatsMap.get(pName) || {
      total: 0,
      danger: 0,
      warning: 0,
      resolved: 0,
    };
    current.total += 1;
    if (
      a.level === "DANGER" ||
      a.level === "CRITICAL" ||
      String(a.level).toUpperCase() === "CRITICAL"
    ) {
      current.danger += 1;
    } else {
      current.warning += 1;
    }
    if (
      a.status === "RESOLVED" ||
      a.status === "Đã xử lý" ||
      String(a.status).toUpperCase() === "RESOLVED"
    ) {
      current.resolved += 1;
    }
    pondStatsMap.set(pName, current);
  });

  const resolveRate = total > 0 ? ((resolvedCount / total) * 100).toFixed(1) : "0";

  const sheet2Data: (string | number)[][] = [
    ["BẢNG THỐNG KÊ TỔNG HỢP SỰ CỐ & CẢNH BÁO"],
    [`Thời gian lập: ${formatVietnamDateTime(new Date())}`],
    [],
    ["1. TỔNG QUAN CHUNG"],
    ["Chỉ số thống kê", "Số lượng", "Tỷ lệ (%)"],
    ["Tổng số cảnh báo đã ghi nhận", total, "100%"],
    ["Mức độ Nguy hiểm (Critical)", dangerCount, total > 0 ? `${((dangerCount / total) * 100).toFixed(1)}%` : "0%"],
    ["Mức độ Cảnh báo (Warning)", warningCount, total > 0 ? `${((warningCount / total) * 100).toFixed(1)}%` : "0%"],
    ["Đã xử lý / Khắc phục xong", resolvedCount, `${resolveRate}%`],
    ["Chưa xử lý (Tồn đọng)", unresolvedCount, total > 0 ? `${((unresolvedCount / total) * 100).toFixed(1)}%` : "0%"],
    [],
    ["2. THỐNG KÊ CHI TIẾT THEO TỪNG AO NUÔI"],
    ["STT", "Tên ao nuôi", "Tổng sự cố", "Nguy hiểm", "Cảnh báo", "Đã xử lý", "Chưa xử lý", "Tỷ lệ xử lý (%)"],
  ];

  let pIndex = 1;
  pondStatsMap.forEach((stats, pName) => {
    const pUnresolved = stats.total - stats.resolved;
    const pRate = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : "0";
    sheet2Data.push([
      pIndex++,
      pName,
      stats.total,
      stats.danger,
      stats.warning,
      stats.resolved,
      pUnresolved,
      `${pRate}%`,
    ]);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2["!cols"] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws2, "Thống kê tổng hợp");

  /* ==========================================
     XUẤT FILE EXCEL (.XLSX)
     ========================================== */
  const now = new Date();
  const dateFormatted = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(
    2,
    "0"
  )}`;
  const fileName = `Bao_cao_canh_bao_Smart_Shrimp_Farm_${dateFormatted}.xlsx`;

  XLSX.writeFile(wb, fileName);
};
