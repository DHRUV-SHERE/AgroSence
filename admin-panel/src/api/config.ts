const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const base = raw ?? (import.meta.env.DEV ? "http://localhost:5000" : "");

/** Backend origin without trailing slash or `/api`. */
export const API_ORIGIN = base.replace(/\/+$/, "").replace(/\/api$/, "");
export const API_URL = `${API_ORIGIN}/api`;

export const STORAGE = {
  access: "agro_admin_access",
  refresh: "agro_admin_refresh",
  user: "agro_admin_user",
} as const;

export type Role = "admin" | "moderator";
export const PANEL_ROLES: readonly string[] = ["admin", "moderator"];
