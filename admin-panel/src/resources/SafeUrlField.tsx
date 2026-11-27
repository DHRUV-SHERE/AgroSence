import { Link, Typography } from "@mui/material";
import { useRecordContext } from "react-admin";

/** Parses `value` and returns it only when it is a well-formed http(s) URL (blocks javascript:, data:, vbscript: ...). */
export const safeHttpUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!/^https?:\/\//i.test(v)) return null;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
};

/** Drop-in replacement for react-admin's UrlField that renders a link only for http(s) URLs, plain text otherwise. */
export const SafeUrlField = ({ source }: { source: string; label?: string }) => {
  const record = useRecordContext();
  const raw = record ? (record as Record<string, unknown>)[source] : undefined;
  if (raw === undefined || raw === null || raw === "") return null;
  const href = safeHttpUrl(raw);
  if (!href) return <Typography component="span" variant="body2" color="text.secondary">{String(raw)} (invalid link)</Typography>;
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer nofollow" variant="body2">
      {href}
    </Link>
  );
};
