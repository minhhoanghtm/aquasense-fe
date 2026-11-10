import type { Pond } from "../types/Pond";
import type { Farm } from "../types/Farm";
import type { User } from "../types/User";

export interface AssignedFarmerInfo {
  userId: string;
  fullName: string;
  phoneNumber?: string;
  email?: string | null;
}

/**
 * Lấy danh sách các Nông dân (Farmer) đã được phân công cho một vuông nuôi
 */
export function getPondAssignedFarmers(
  pond?: Pond | null,
  staffList: User[] = []
): AssignedFarmerInfo[] {
  if (!pond) return [];

  const staffMap = new Map<string, User>();
  staffList.forEach((u) => {
    const id = u.userId || u.id;
    if (id) staffMap.set(id, u);
  });

  const resultMap = new Map<string, AssignedFarmerInfo>();

  if (Array.isArray(pond.farmerAssignments)) {
    for (const assignment of pond.farmerAssignments) {
      const fId = assignment.farmerId;
      if (!fId) continue;
      const fromRelation = assignment.farmer;
      const fromStaffList = staffMap.get(fId);

      // Chỉ lấy nếu là FARMER (hoặc khi từ bảng pond_farmer_assignments)
      const role = (fromRelation?.role || fromStaffList?.role || "FARMER").toUpperCase();
      if (role === "FARMER" || !fromStaffList) {
        resultMap.set(fId, {
          userId: fId,
          fullName:
            fromRelation?.fullName ||
            fromStaffList?.fullName ||
            "Nông dân đã phân công",
          phoneNumber: fromRelation?.phoneNumber || fromStaffList?.phoneNumber,
          email: fromRelation?.email ?? fromStaffList?.email,
        });
      }
    }
  }

  // Fallback tương thích nếu pond.userId là một FARMER trong danh sách nhân sự
  if (pond.userId && !resultMap.has(pond.userId)) {
    const ownerStaff = staffMap.get(pond.userId);
    if (ownerStaff && ownerStaff.role?.toUpperCase() === "FARMER") {
      resultMap.set(pond.userId, {
        userId: pond.userId,
        fullName: ownerStaff.fullName,
        phoneNumber: ownerStaff.phoneNumber,
        email: ownerStaff.email,
      });
    }
  }

  return Array.from(resultMap.values());
}

export interface FarmAssignmentSummary {
  isManagerAssigned: boolean;
  managerName: string | null;
  ownerName: string | null;
  ownerRole: string | null;
  totalPonds: number;
  assignedPondsCount: number;
  assignedFarmers: AssignedFarmerInfo[];
}

/**
 * Tổng hợp trạng thái phân công của một Trại nuôi (Quản lý trại & Nông dân tại các vuông thuộc trại)
 */
export function getFarmAssignmentSummary(
  farm: Farm,
  staffList: User[] = []
): FarmAssignmentSummary {
  const staffMap = new Map<string, User>();
  staffList.forEach((u) => {
    const id = u.userId || u.id;
    if (id) staffMap.set(id, u);
  });

  const ownerFromStaff = farm.ownerId ? staffMap.get(farm.ownerId) : undefined;
  const ownerRole = (farm.owner?.role || ownerFromStaff?.role || "").toUpperCase() || null;
  const ownerName = farm.owner?.fullName || ownerFromStaff?.fullName || null;
  const isManagerAssigned = ownerRole === "MANAGER" && !!ownerName;

  const ponds = farm.ponds || [];
  const totalPonds = ponds.length || farm.pondCount || 0;
  let assignedPondsCount = 0;
  const farmersMap = new Map<string, AssignedFarmerInfo>();

  for (const pond of ponds) {
    const pondFarmers = getPondAssignedFarmers(pond, staffList);
    if (pondFarmers.length > 0) {
      assignedPondsCount += 1;
      for (const pf of pondFarmers) {
        farmersMap.set(pf.userId, pf);
      }
    }
  }

  return {
    isManagerAssigned,
    managerName: isManagerAssigned ? ownerName : null,
    ownerName,
    ownerRole,
    totalPonds,
    assignedPondsCount,
    assignedFarmers: Array.from(farmersMap.values()),
  };
}
