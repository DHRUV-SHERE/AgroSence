/** Display helpers tolerant of populated or plain-id references. */

export const fmtDate = (v?: string | null): string => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

export const fmtDateTime = (v?: string | null): string => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v)
    : d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const fmtMoney = (n: number | undefined | null): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n ?? 0));

/** Name for a reference that may be a populated object, a string id or missing. */
export const personName = (v: unknown): string => {
  if (!v) return "-";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return String(o.name ?? o.email ?? o.id ?? o._id ?? "-");
  }
  return String(v);
};

export const refId = (v: unknown): string | undefined => {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  const id = o.id ?? o._id;
  return id ? String(id) : undefined;
};
