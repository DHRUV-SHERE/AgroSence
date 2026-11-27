import type { ReactNode } from "react";
import {
  BulkDeleteWithConfirmButton,
  CreateButton,
  DeleteWithConfirmButton,
  ExportButton,
  TopToolbar,
  useListContext,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Box, Button, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/InboxOutlined";
import { useCan } from "../permissions";

const STATE_NAMES = [
  "All States", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh",
];
export const stateChoices = STATE_NAMES.map((n) => ({ id: n, name: n }));

export const required = (label: string) => (v: unknown) =>
  typeof v === "string" && v.trim().length > 0 ? undefined : `${label} is required`;

export const minLength = (label: string, n: number) => (v: unknown) =>
  typeof v === "string" && v.trim().length >= n ? undefined : `${label} must be at least ${n} characters`;

export const url = (v: unknown) => {
  if (!v) return undefined;
  try {
    const u = new URL(String(v));
    return u.protocol === "http:" || u.protocol === "https:" ? undefined : "Must start with http:// or https://";
  } catch {
    return "Enter a valid URL, e.g. https://example.com";
  }
};

/** Empty state shown by lists: different copy when filters are active vs. nothing exists yet. */
export const EmptyState = ({ noun, canCreate }: { noun: string; canCreate?: boolean }) => (
  <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
    <InboxIcon sx={{ fontSize: 56, opacity: 0.5 }} />
    <Typography variant="h6" sx={{ mt: 1 }}>
      No {noun} yet
    </Typography>
    <Typography variant="body2" sx={{ mb: 2 }}>
      {canCreate ? `Create the first one to get started.` : `Nothing to show here.`}
    </Typography>
    {canCreate && <CreateButton variant="contained" />}
  </Box>
);

export const NoResults = ({ noun }: { noun: string }) => {
  const { filterValues, setFilters } = useListContext();
  return (
    <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
      <Typography variant="h6">No {noun} match your filters</Typography>
      <Button sx={{ mt: 1 }} onClick={() => setFilters({}, {})} disabled={Object.keys(filterValues).length === 0}>
        Clear filters
      </Button>
    </Box>
  );
};

export const ListActions = ({ create, exporter = true }: { create?: boolean; exporter?: boolean }) => (
  <TopToolbar>
    {create && <CreateButton />}
    {exporter && <ExportButton />}
  </TopToolbar>
);

/** Bulk delete is rendered only for roles that may delete. */
export const BulkActions = ({ allow }: { allow: boolean }): ReactNode =>
  allow ? (
    <BulkDeleteWithConfirmButton
      mutationMode="pessimistic"
      confirmTitle="Delete selected items?"
      confirmContent="This permanently deletes every selected item and cannot be undone."
    />
  ) : null;

export const RowDelete = ({ noun }: { noun: string }) => {
  const resource = useResourceContext();
  return (
    <DeleteWithConfirmButton
      mutationMode="pessimistic"
      confirmTitle={`Delete this ${noun}?`}
      confirmContent="This cannot be undone."
      resource={resource}
    />
  );
};

export { useCan };

/** Single-line text cell with ellipsis; full text is available as a native tooltip and on the Show/Edit page. */
export const TruncatedTextField = ({ source, maxWidth = 280 }: { source: string; label?: string; sortable?: boolean; maxWidth?: number }) => {
  const record = useRecordContext();
  const value = record ? (record as Record<string, unknown>)[source] : undefined;
  const text = value == null ? "" : String(value);
  return (
    <Box component="span" title={text} sx={{ display: "block", maxWidth, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {text}
    </Box>
  );
};
