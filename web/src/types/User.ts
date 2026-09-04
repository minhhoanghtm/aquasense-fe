export type UserRole = "FARMER" | "TECHNICIAN" | "ADMIN" | string;

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  address?: string;
  bio?: string;
  department?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
