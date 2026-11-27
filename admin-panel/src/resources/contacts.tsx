import {
  Datagrid,
  DeleteWithConfirmButton,
  EmailField,
  FunctionField,
  List,
  SearchInput,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
} from "react-admin";
import { BulkActions, EmptyState, ListActions, NoResults, RowDelete } from "./shared";
import { fmtDateTime } from "../format";

interface Contact {
  createdAt?: string;
  dateSubmitted?: string;
  message?: string;
}

const when = (r: Contact) => fmtDateTime(r.createdAt ?? r.dateSubmitted);

const filters = [<SearchInput key="q" source="q" alwaysOn placeholder="Search name, email, message" />];

export const ContactList = () => (
  <List
    filters={filters}
    sort={{ field: "createdAt", order: "DESC" }}
    perPage={20}
    actions={<ListActions />}
    empty={<EmptyState noun="messages" />}
  >
    <Datagrid rowClick="show" bulkActionButtons={<BulkActions allow />} empty={<NoResults noun="messages" />}>
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="mobile" />
      <FunctionField
        label="Message"
        sortable={false}
        render={(r: Contact) => ((r.message ?? "").length > 80 ? `${r.message?.slice(0, 80)}...` : r.message)}
      />
      <FunctionField label="Received" source="createdAt" render={when} />
      <RowDelete noun="message" />
    </Datagrid>
  </List>
);

export const ContactShow = () => (
  <Show
    actions={
      <TopToolbar>
        <DeleteWithConfirmButton mutationMode="pessimistic" confirmTitle="Delete this message?" confirmContent="This cannot be undone." />
      </TopToolbar>
    }
  >
    <SimpleShowLayout>
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="mobile" />
      <TextField source="address" />
      <TextField source="message" sx={{ whiteSpace: "pre-wrap" }} />
      <FunctionField label="Received" render={when} />
    </SimpleShowLayout>
  </Show>
);
