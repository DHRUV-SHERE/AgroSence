import type { AuthProvider } from "react-admin";
import { PANEL_ROLES } from "./api/config";
import { ApiError, request, session, tokens } from "./api/http";
import type { ApiUser } from "./api/types";

interface LoginResult {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

const authProvider: AuthProvider = {
  async login({ identifier, password }: { identifier: string; password: string }) {
    const { data } = await request<LoginResult>("/auth/login", {
      method: "POST",
      json: { identifier: identifier?.trim(), password },
      auth: false,
    });
    if (!PANEL_ROLES.includes(data.user.role)) {
      // Never keep a session for a non-staff account.
      tokens.set(data.accessToken, data.refreshToken);
      await request("/auth/logout", {
        method: "POST",
        json: { refreshToken: data.refreshToken },
      }).catch(() => undefined);
      tokens.clear();
      throw new Error("This account does not have admin panel access.");
    }
    tokens.set(data.accessToken, data.refreshToken);
    session.setUser(data.user);
  },

  async logout() {
    const refreshToken = tokens.refresh;
    if (refreshToken && tokens.access) {
      await request("/auth/logout", { method: "POST", json: { refreshToken } }).catch(() => undefined);
    }
    tokens.clear();
  },

  async checkAuth() {
    const user = session.getUser();
    if (!tokens.access || !tokens.refresh || !user || !PANEL_ROLES.includes(user.role)) {
      tokens.clear();
      throw new Error("Not authenticated");
    }
  },

  async checkError(error: unknown) {
    const status = error instanceof ApiError ? error.status : (error as { status?: number })?.status;
    if (status === 401) {
      tokens.clear();
      throw new Error("Session expired");
    }
    // 403 and everything else: stay signed in; the UI shows the message.
  },

  async getPermissions() {
    return session.getUser()?.role ?? null;
  },

  async getIdentity() {
    const user = session.getUser();
    if (!user) throw new Error("Not authenticated");
    return {
      id: user.id,
      fullName: user.name,
      avatar: user.avatar,
      email: user.email,
      role: user.role,
    };
  },
};

/** Re-reads the signed-in user from the server and updates the local session. */
export const refreshIdentity = async (): Promise<ApiUser> => {
  const { data } = await request<ApiUser>("/auth/me");
  session.setUser(data);
  return data;
};

export default authProvider;
