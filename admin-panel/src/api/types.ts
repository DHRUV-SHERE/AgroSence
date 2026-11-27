export type UserRole = "user" | "moderator" | "admin";

export interface ApiUser {
  id: string;
  userId?: string;
  name: string;
  mobile?: string;
  email?: string;
  state?: string;
  address?: string;
  language?: string;
  role: UserRole;
  avatar?: string;
  active?: boolean;
  createdAt?: string;
}

export interface Envelope<T> {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number; pages: number };
  message?: string;
  errors?: { field?: string; message: string }[];
}

export interface Stats {
  users: number;
  crops: number;
  orders: number;
  contacts: number;
  schemes: number;
  resources: number;
  ordersByStatus: { status: string; count: number }[];
  signupsByDay: { date: string; count: number }[];
  revenue: number;
}
