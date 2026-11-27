import type { DataProvider, RaRecord } from "react-admin";
import { request } from "./api/http";
import type { ApiUser, Stats, UserRole } from "./api/types";

/** Maps react-admin resource names onto contract endpoints. */
const ENDPOINT: Record<string, string> = {
  users: "/admin/users",
  crops: "/admin/crops",
  orders: "/admin/orders",
  contacts: "/admin/contacts",
  schemes: "/admin/schemes",
  resources: "/admin/resources",
  "audit-logs": "/admin/audit-logs",
};

/** Public fallbacks: the contract only lists writes for these under /admin. */
const PUBLIC_FALLBACK: Record<string, string> = {
  schemes: "/schemes",
  resources: "/resources",
};

const endpoint = (resource: string) => {
  const e = ENDPOINT[resource];
  if (!e) throw new Error(`Unknown resource "${resource}"`);
  return e;
};

type Raw = Record<string, unknown>;

const isRawFile = (v: unknown): v is { rawFile: File } =>
  typeof v === "object" && v !== null && (v as { rawFile?: unknown }).rawFile instanceof File;

const READONLY_KEYS = new Set(["id", "_id", "createdAt", "updatedAt", "__v", "userId"]);

/** Builds a JSON body, or FormData when a new file was picked. */
const buildPayload = (data: Raw): { json?: Raw; form?: FormData } => {
  const clean: Raw = {};
  Object.entries(data).forEach(([k, v]) => {
    if (READONLY_KEYS.has(k) || v === undefined) return;
    // An existing image URL stays server-side; only a new file is sent.
    if (k === "image" && !isRawFile(v)) return;
    clean[k] = v;
  });
  if (!Object.values(clean).some(isRawFile)) return { json: clean };
  const form = new FormData();
  Object.entries(clean).forEach(([k, v]) => {
    if (isRawFile(v)) form.append(k, v.rawFile);
    else if (v !== null) form.append(k, String(v));
  });
  return { form };
};

const normalize = <T extends RaRecord>(row: unknown): T => {
  const r = row as Raw;
  return { ...r, id: (r.id ?? r._id) as string } as T;
};

const status = (e: unknown) => (e as { status?: number }).status;

const getList: DataProvider["getList"] = async (resource, params) => {
  const { page, perPage } = params.pagination ?? { page: 1, perPage: 20 };
  const { field, order } = params.sort ?? { field: "createdAt", order: "DESC" };
  const query: Record<string, string | number | undefined> = {
    page,
    limit: perPage,
    sort: field ? `${order === "DESC" ? "-" : ""}${field === "id" ? "createdAt" : field}` : undefined,
  };
  Object.entries(params.filter ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") query[k] = String(v);
  });
  let res;
  try {
    res = await request<unknown[]>(endpoint(resource), { query });
  } catch (e) {
    const fb = PUBLIC_FALLBACK[resource];
    if (fb && status(e) === 404) res = await request<unknown[]>(fb, { query });
    else throw e;
  }
  const rows = Array.isArray(res.data) ? res.data : [];
  return { data: rows.map((r) => normalize(r)) as never[], total: res.meta?.total ?? rows.length };
};

const getOne: DataProvider["getOne"] = async (resource, params) => {
  let res;
  try {
    res = await request<unknown>(`${endpoint(resource)}/${params.id}`);
  } catch (e) {
    const fb = PUBLIC_FALLBACK[resource];
    if (fb && status(e) === 404) res = await request<unknown>(`${fb}/${params.id}`);
    else throw e;
  }
  return { data: normalize(res.data) as never };
};

export interface AgroDataProvider extends DataProvider {
  getStats(): Promise<Stats>;
  setUserRole(id: string, role: UserRole): Promise<ApiUser>;
  setUserActive(id: string, active: boolean): Promise<ApiUser>;
}

const dataProvider: AgroDataProvider = {
  getList,
  getOne,

  async getMany(resource, params) {
    const rows = await Promise.all(params.ids.map((id) => getOne(resource, { id })));
    return { data: rows.map((r) => r.data) as never[] };
  },

  async getManyReference(resource, params) {
    return getList(resource, { ...params, filter: { ...params.filter, [params.target]: params.id } });
  },

  async create(resource, params) {
    const { json, form } = buildPayload(params.data as Raw);
    const res = await request<unknown>(endpoint(resource), { method: "POST", json, form });
    return { data: normalize(res.data) as never };
  },

  async update(resource, params) {
    const { json, form } = buildPayload(params.data as Raw);
    const res = await request<unknown>(`${endpoint(resource)}/${params.id}`, {
      method: "PUT",
      json,
      form,
    });
    return { data: normalize(res.data ?? { ...params.data, id: params.id }) as never };
  },

  async updateMany(resource, params) {
    const { json } = buildPayload(params.data as Raw);
    await Promise.all(params.ids.map((id) => request(`${endpoint(resource)}/${id}`, { method: "PUT", json })));
    return { data: params.ids };
  },

  async delete(resource, params) {
    await request(`${endpoint(resource)}/${params.id}`, { method: "DELETE" });
    return { data: { ...(params.previousData ?? {}), id: params.id } as never };
  },

  /** The contract has no bulk endpoint, so fan out and report partial failures. */
  async deleteMany(resource, params) {
    const results = await Promise.allSettled(
      params.ids.map((id) => request(`${endpoint(resource)}/${id}`, { method: "DELETE" })),
    );
    const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failed.length) {
      const reason = (failed[0].reason as Error)?.message ?? "unknown error";
      throw new Error(`${failed.length} of ${params.ids.length} could not be deleted: ${reason}`);
    }
    return { data: params.ids };
  },

  async getStats() {
    return (await request<Stats>("/admin/stats")).data;
  },

  async setUserRole(id, role) {
    const res = await request<ApiUser>(`/admin/users/${id}/role`, { method: "PATCH", json: { role } });
    return normalize<ApiUser & RaRecord>(res.data);
  },

  async setUserActive(id, active) {
    const res = await request<ApiUser>(`/admin/users/${id}/status`, { method: "PATCH", json: { active } });
    return normalize<ApiUser & RaRecord>(res.data);
  },
};

export default dataProvider;
