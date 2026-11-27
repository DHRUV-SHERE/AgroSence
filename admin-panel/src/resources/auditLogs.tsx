import { Datagrid, FunctionField, List, SearchInput, Show, SimpleShowLayout, TextField, TopToolbar } from "react-admin";
import { Chip } from "@mui/material";
import { EmptyState, ListActions, NoResults } from "./shared";
import { fmtDateTime, personName } from "../format";

interface Log {
  action?: string;
  actor?: unknown;
  actorId?: unknown;
  user?: unknown;
  targetType?: string;
  targetId?: unknown;
  target?: unknown;
  details?: unknown;
  meta?: unknown;
  createdAt?: string;
}

const actor = (r: Log) => personName(r.actor ?? r.user ?? r.actorId);
const target = (r: Log) => {
  const t = r.target ?? r.targetId;
  return [r.targetType, t ? personName(t) : ""].filter(Boolean).join(" ") || "-";
};
const details = (r: Log) => {
  const d = r.details ?? r.meta;
  if (d === undefined || d === null || d === "") return "";
  return typeof d === "string" ? d : JSON.stringify(d);
};

const filters = [<SearchInput key="q" source="q" alwaysOn placeholder="Search action or actor" />];

export const AuditLogList = () => (
  <List
    filters={filters}
    sort={{ field: "createdAt", order: "DESC" }}
    perPage={25}
    actions={<ListActions />}
    empty={<EmptyState noun="audit entries" />}
  >
    <Datagrid rowClick="show" bulkActionButtons={false} empty={<NoResults noun="audit entries" />}>
      <FunctionField label="When" source="createdAt" render={(r: Log) => fmtDateTime(r.createdAt)} />
      <FunctionField label="Action" source="action" render={(r: Log) => <Chip size="small" label={r.action ?? "-"} variant="outlined" />} />
      <FunctionField label="By" sortable={false} render={actor} />
      <FunctionField label="Target" sortable={false} render={target} />
      <FunctionField
        label="Details"
        sortable={false}
        render={(r: Log) => {
          const d = details(r);
          return d.length > 70 ? `${d.slice(0, 70)}...` : d;
        }}
      />
    </Datagrid>
  </List>
);

export const AuditLogShow = () => (
  <Show actions={<TopToolbar />}>
    <SimpleShowLayout>
      <FunctionField label="When" render={(r: Log) => fmtDateTime(r.createdAt)} />
      <TextField source="action" />
      <FunctionField label="By" render={actor} />
      <FunctionField label="Target" render={target} />
      <FunctionField label="Details" render={(r: Log) => <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{details(r)}</pre>} />
    </SimpleShowLayout>
  </Show>
);
