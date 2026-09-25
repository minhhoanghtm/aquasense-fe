import { api } from "./api";
import type { User } from "../types/User";

const fallbackStaffList: User[] = [
  {
    id: "u1",
    userId: "u1",
    fullName: "Nguyễn Văn An",
    // email: "farmer@example.com",
    phoneNumber: "0908123456",
    role: "FARMER",
    position: "Nhân viên Nuôi trồng",
    department: "Quản lý & Nuôi trồng Thủy sản",
    status: "ACTIVE",
    isActive: true,
    fcmToken: "fcm_token_an_nguyen_84908123456",
    assignedPondIds: ["p1", "p2", "p3"],
    joinDate: "2024-03-15",
    address: "Khu vực Cà Mau · Đồng bằng sông Cửu Long",
    bio: "Phụ trách theo dõi chất lượng nước, giám sát hệ thống cảm biến IoT và quy trình cấp khí ao tôm công nghệ cao.",
  },
  {
    id: "u2",
    userId: "u2",
    fullName: "Trần Minh Kỹ",
    // email: "technician@example.com",
    phoneNumber: "0912345678",
    role: "FARMER",
    position: "Kỹ thuật viên Nuôi trồng",
    department: "Kỹ thuật & Công nghệ IoT",
    status: "ACTIVE",
    isActive: true,
    fcmToken: "fcm_token_ky_tran_84912345678",
    assignedPondIds: ["p1", "p2", "p3", "p4"],
    joinDate: "2024-05-10",
    address: "Phường 5, TP. Cà Mau",
    bio: "Chuyên gia bảo trì thiết bị cảm biến môi trường nước, trạm gateway ESP32 và hệ thống cấp oxy tự động.",
  },
  {
    id: "u3",
    userId: "u3",
    fullName: "Lê Hoàng Quản Lý",
    // email: "manager@example.com",
    phoneNumber: "0933888999",
    role: "MANAGER",
    position: "Quản lý Trang trại",
    department: "Ban Quản lý Trang trại",
    status: "ACTIVE",
    isActive: true,
    fcmToken: "fcm_token_manager_84933888999",
    assignedPondIds: ["p1", "p2", "p3", "p4"],
    joinDate: "2023-11-01",
    address: "Trụ sở Trang trại AquaSense, Cà Mau",
    bio: "Quản lý toàn bộ hoạt động nuôi trồng, cấu hình ngưỡng và phân công nhân sự các vuông nuôi.",
  },
  {
    id: "u4",
    userId: "u4",
    fullName: "Phạm Thị Bích Ngọc",
    // email: "ngoc.pham@aquasense.vn",
    phoneNumber: "0977223344",
    role: "MANAGER",
    position: "Quản lý Kỹ thuật Thủy sản",
    department: "Quản lý Chất lượng",
    status: "ACTIVE",
    isActive: true,
    fcmToken: "fcm_token_ngoc_pham_84977223344",
    assignedPondIds: ["p1", "p2"],
    joinDate: "2025-01-15",
    address: "Huyện Cái Nước, Tỉnh Cà Mau",
    bio: "Phân tích dinh dưỡng thức ăn, kiểm tra mẫu nước vi sinh và theo dõi chỉ số tăng trưởng tôm định kỳ.",
  },
  {
    id: "u5",
    userId: "u5",
    fullName: "Võ Hoàng Nam",
    // email: "nam.vo@aquasense.vn",
    phoneNumber: "0944556677",
    role: "FARMER",
    position: "Nông dân Phụ trách Ao",
    department: "Quản lý & Nuôi trồng Thủy sản",
    status: "ACTIVE",
    isActive: true,
    fcmToken: "fcm_token_nam_vo_84944556677",
    assignedPondIds: ["p3", "p4"],
    joinDate: "2025-04-02",
    address: "Huyện Giá Rai, Bạc Liêu",
    bio: "Phụ trách kiểm tra quạt nước, xi-phông đáy ao và cho ăn theo định lượng AI gợi ý tại vuông Bạc Liêu.",
  },
  {
    id: "u6",
    userId: "u6",
    fullName: "Đỗ Quốc Bảo",
    // email: "bao.do@aquasense.vn",
    phoneNumber: "0988667788",
    role: "FARMER",
    position: "Nông dân Vận hành",
    department: "Quản lý & Nuôi trồng Thủy sản",
    status: "ON_LEAVE",
    isActive: false,
    fcmToken: "fcm_token_bao_do_84988667788",
    assignedPondIds: ["p2", "p4"],
    joinDate: "2025-06-20",
    address: "TP. Bạc Liêu, Tỉnh Bạc Liêu",
    bio: "Hiệu chuẩn các đầu dò pH, DO, độ mặn và kiểm tra đường truyền sóng LoRa/Wi-Fi của các trạm đo.",
  },
];

export const getStaffList = async (): Promise<User[]> => {
  try {
    const raw = await api<any>("/users");
    const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
    if (Array.isArray(list) && list.length > 0) {
      return list.map((u: any) => ({
        ...u,
        id: u.userId || u.id,
        userId: u.userId || u.id,
        status: u.isActive ? "ACTIVE" : "INACTIVE",
        assignedPondIds:
          u.assignedPondIds ||
          (u.ponds ? u.ponds.map((p: any) => p.pondId || p.id) : []),
      }));
    }
    return fallbackStaffList;
  } catch (error) {
    console.warn("Could not fetch staff list from API, using fallback data:", error);
    return fallbackStaffList;
  }
};

export const getStaffById = async (id: string): Promise<User | null> => {
  try {
    const u = await api<any>(`/users/${id}`);
    if (u) {
      return {
        ...u,
        id: u.userId || u.id,
        userId: u.userId || u.id,
        status: u.isActive ? "ACTIVE" : "INACTIVE",
        assignedPondIds:
          u.assignedPondIds ||
          (u.ponds ? u.ponds.map((p: any) => p.pondId || p.id) : []),
      };
    }
    return null;
  } catch (error) {
    console.warn(`Could not fetch staff ${id} from API:`, error);
    const found = fallbackStaffList.find((u) => u.id === id);
    return found || null;
  }
};

export interface CreateStaffPayload extends Partial<User> {
  password?: string;
}

export const createStaff = async (staffData: CreateStaffPayload): Promise<User> => {
  const payload: Record<string, any> = {
    fullName: staffData.fullName?.trim() || "",
    phoneNumber: staffData.phoneNumber?.trim() || "",
    email: staffData.email?.trim() || "",
    role: staffData.role || "FARMER",
  };

  try {
    const res = await api<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return {
      ...staffData,
      id: res.userId,
      userId: res.userId,
      fullName: res.fullName,
      phoneNumber: res.phoneNumber,
      email: res.email,
      role: res.role,
      status: "ACTIVE",
      isActive: true,
      assignedPondIds: staffData.assignedPondIds || [],
    };
  } catch (error) {
    console.error("Lỗi tạo nhân viên:", error);
    throw error;
  }
};

export const updateStaff = async (id: string, staffData: Partial<User>): Promise<User> => {
  const payload: Record<string, any> = {};
  if (staffData.fullName !== undefined) payload.fullName = staffData.fullName.trim();
  if (staffData.phoneNumber !== undefined) payload.phoneNumber = staffData.phoneNumber.trim();
  if (staffData.email !== undefined) payload.email = staffData.email.trim();
  if (staffData.role !== undefined) payload.role = staffData.role;
  if (staffData.isActive !== undefined) {
    payload.isActive = staffData.isActive;
  } else if (staffData.status !== undefined) {
    payload.isActive = staffData.status === "ACTIVE";
  }
  if (staffData.assignedPondIds !== undefined) {
    payload.assignedPondIds = staffData.assignedPondIds;
  }

  try {
    const res = await api<{ message: string; user: any }>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const u = res.user || res;
    return {
      ...staffData,
      ...u,
      id: u.userId || u.id || id,
      userId: u.userId || u.id || id,
      status: u.isActive ? "ACTIVE" : "INACTIVE",
      assignedPondIds:
        u.assignedPondIds ||
        staffData.assignedPondIds ||
        (u.ponds ? u.ponds.map((p: any) => p.pondId || p.id) : []),
    };
  } catch (error) {
    console.error(`Lỗi cập nhật nhân viên ${id}:`, error);
    throw error;
  }
};

export const approveStaffAccount = async (id: string): Promise<User> => {
  return await updateStaff(id, {
    isActive: true,
    status: "ACTIVE",
    updatedAt: new Date().toISOString(),
  });
};

export const rejectStaffAccount = async (id: string): Promise<boolean> => {
  return await deleteStaff(id);
};

export const changeStaffStatus = async (id: string, status: "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "PENDING_APPROVAL"): Promise<User> => {
  return await updateStaff(id, {
    status,
    isActive: status === "ACTIVE",
    updatedAt: new Date().toISOString(),
  });
};

export const deleteStaff = async (id: string): Promise<boolean> => {
  try {
    await api<any>(`/users/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error(`Lỗi xóa nhân viên ${id}:`, error);
    throw error;
  }
};

export const assignPondsToStaff = async (staffId: string, pondIds: string[]): Promise<User> => {
  const res = await updateStaff(staffId, { assignedPondIds: pondIds });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ponds-updated"));
  }
  return res;
};
