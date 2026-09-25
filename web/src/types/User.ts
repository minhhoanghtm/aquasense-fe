export type Role = "MANAGER" | "FARMER";
export type UserRole = Role | string;

export type UserStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "PENDING_APPROVAL";

export interface User {
  userId?: string;
  id: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  passwordHash?: string;
  password?: string;
  role: Role | string;
  fcmToken?: string;
  isActive?: boolean;
  status?: UserStatus;
  avatar?: string;
  avatarColor?: string;
  address?: string;
  bio?: string;
  department?: string;
  position?: string;
  assignedPondIds?: string[];
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
