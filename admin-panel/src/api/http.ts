import { API_URL, STORAGE } from "./config";
import type { ApiUser, Envelope } from "./types";

export class ApiError extends Error {
  status: number;
  errors?: { field?: string; message: string }[];
  constructor(message: string, status: number, errors?: { field?: string; message: string }[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const read = (k: string): string | null => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* storage unavailable */
  }
};

export const tokens = {
  get access() {
    return read(STORAGE.access);
  },
  get refresh() {
    return read(STORAGE.refresh);
  },
  set(access: string, refresh: string) {
    write(STORAGE.access, access);
    write(STORAGE.refresh, refresh);
  },
  clear() {
    write(STORAGE.access, null);
    write(STORAGE.refresh, null);
    write(STORAGE.user, null);
  },
};

export const session = {
  getUser(): ApiUser | null {
    const raw = read(STORAGE.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ApiUser;
    } catch {
      return null;
    }
  },
  setUser(u: ApiUser) {
    write(STORAGE.user, JSON.stringify(u));
  },
};

export const SESSION_EXPIRED_EVENT = "agro-admin:session-expired";

const NETWORK_MSG = "Cannot reach the server. Check your connection and try again.";

const parse = async <T>(res: Response): Promise<Envelope<T>> => {
  const text = await res.text();
  let body: Partial<Envelope<T>> = {};
  if (text) {
    try {
      body = JSON.parse(text) as Partial<Envelope<T>>;
    } catch {
      body = { message: text.slice(0, 200) };
    }
  }
  if (!res.ok || body.success === false) {
    const fallback: Record<number, string> = {
      400: "The request was invalid.",
      401: "Your session has expired. Please sign in again.",
      403: "You do not have permission to do that.",
      404: "The requested item was not found.",
      409: "That conflicts with existing data.",
      429: "Too many requests. Please wait a moment and retry.",
    };
    const fieldMsg = body.errors?.length
      ? body.errors.map((e) => (e.field ? `${e.field}: ${e.message}` : e.message)).join("; ")
      : "";
    const msg =
      body.message ||
      fieldMsg ||
      fallback[res.status] ||
      (res.status >= 500 ? "Server error. Please try again later." : `Request failed (${res.status})`);
    throw new ApiError(msg, res.status, body.errors);
  }
  return body as Envelope<T>;
};

let refreshing: Promise<boolean> | null = null;

/** Single-flight refresh: concurrent 401s share one refresh call. */
export const refreshTokens = (): Promise<boolean> => {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const refreshToken = tokens.refresh;
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const body = await parse<{ accessToken: string; refreshToken: string }>(res);
      tokens.set(body.data.accessToken, body.data.refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

export interface RequestOptions {
  method?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  form?: FormData;
  auth?: boolean;
}

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  const url = `${API_URL}${path}`;
  if (!query) return url;
  const qs = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
};

const send = (path: string, o: RequestOptions) => {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (o.auth !== false && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;
  let body: BodyInit | undefined;
  if (o.form) body = o.form;
  else if (o.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(o.json);
  }
  return fetch(buildUrl(path, o.query), { method: o.method ?? "GET", headers, body });
};

export async function request<T>(path: string, o: RequestOptions = {}): Promise<Envelope<T>> {
  const run = async () => {
    try {
      return await send(path, o);
    } catch {
      throw new ApiError(NETWORK_MSG, 0);
    }
  };
  let res = await run();
  if (res.status === 401 && o.auth !== false && tokens.refresh) {
    if (await refreshTokens()) {
      res = await run();
    } else {
      tokens.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }
  return parse<T>(res);
}
