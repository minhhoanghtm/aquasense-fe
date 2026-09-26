export type Role = "ADMIN" | "MANAGER" | "FARMER";
export type UserRole = Role | string;
export type UserStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "PENDING_APPROVAL";

export interface User {
  // Backend actual fields
  userId?: string;
  fullName: string;
  phoneNumber?: string;
  email?: string | null;
  gender?: "MALE" | "FEMALE" | null;
  dateOfBirth?: string | null;
  passwordHash?: string;
  role: Role | string;
  fcmToken?: string | null;
  isActive?: boolean;
  mustChangePassword?: boolean;
  tokenVersion?: number;
  createdAt?: string;
  updatedAt?: string;

  // Frontend aliases / backward compat
  id?: string;
  password?: string;
  status?: UserStatus;
  avatar?: string;
  avatarColor?: string;
  address?: string;
  bio?: string;
  department?: string;
  position?: string;
  assignedPondIds?: string[];
  joinDate?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
