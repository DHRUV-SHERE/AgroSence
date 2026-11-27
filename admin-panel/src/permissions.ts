import { usePermissions } from "react-admin";

export type StaffRole = "admin" | "moderator";

export interface Can {
  loading: boolean;
  role: StaffRole | null;
  isAdmin: boolean;
  isStaff: boolean;
}

/** Role flags derived from authProvider.getPermissions. */
export const useCan = (): Can => {
  const { permissions, isPending } = usePermissions<string | null>();
  const role = permissions === "admin" || permissions === "moderator" ? permissions : null;
  return { loading: isPending, role, isAdmin: role === "admin", isStaff: role !== null };
};
