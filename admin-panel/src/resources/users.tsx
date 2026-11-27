import { useState } from "react";
import {
  Datagrid,
  DateField,
  DeleteWithConfirmButton,
  Edit,
  EditButton,
  EmailField,
  FunctionField,
  List,
  SaveButton,
  SearchInput,
  SelectInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  Toolbar,
  TopToolbar,
  email,
  regex,
  useDataProvider,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField as MuiTextField,
} from "@mui/material";
import type { AgroDataProvider } from "../dataProvider";
import type { ApiUser, UserRole } from "../api/types";
import { session } from "../api/http";
import { BulkActions, EmptyState, ListActions, NoResults, RowDelete, required, stateChoices } from "./shared";
import { useCan } from "../permissions";

const roleColor = (r: string): "error" | "warning" | "default" =>
  r === "admin" ? "error" : r === "moderator" ? "warning" : "default";
const isActive = (u: Partial<ApiUser>) => u.active !== false;

const RoleChip = ({ record }: { record: ApiUser }) => (
  <Chip
    size="small"
    label={record.role}
    color={roleColor(record.role)}
    variant={record.role === "user" ? "outlined" : "filled"}
    sx={{ textTransform: "capitalize" }}
  />
);
const StatusChip = ({ record }: { record: ApiUser }) =>
  isActive(record) ? (
    <Chip size="small" label="Active" color="success" variant="outlined" />
  ) : (
    <Chip size="small" label="Suspended" color="error" />
  );

const filters = [
  <SearchInput key="q" source="q" alwaysOn placeholder="Search name, email, mobile" />,
  <SelectInput
    key="role"
    source="role"
    choices={[
      { id: "user", name: "User" },
      { id: "moderator", name: "Moderator" },
      { id: "admin", name: "Admin" },
    ]}
  />,
];

export const UserList = () => {
  const { isAdmin } = useCan();
  return (
    <List
      filters={filters}
      sort={{ field: "createdAt", order: "DESC" }}
      perPage={20}
      actions={<ListActions />}
      empty={<EmptyState noun="users" />}
    >
      <Datagrid
        rowClick="show"
        bulkActionButtons={isAdmin ? <BulkActions allow /> : false}
        empty={<NoResults noun="users" />}
      >
        <TextField source="name" />
        <EmailField source="email" />
        <TextField source="mobile" />
        <TextField source="state" />
        <TextField source="language" />
        <FunctionField label="Role" source="role" render={(r: ApiUser) => <RoleChip record={r} />} />
        <FunctionField label="Status" sortable={false} render={(r: ApiUser) => <StatusChip record={r} />} />
        <DateField source="createdAt" label="Joined" />
        {isAdmin && <EditButton />}
        {isAdmin && <RowDelete noun="user" />}
      </Datagrid>
    </List>
  );
};

const RoleDialog = ({ user, onClose, onDone }: { user: ApiUser; onClose: () => void; onDone: () => void }) => {
  const dp = useDataProvider<AgroDataProvider>();
  const notify = useNotify();
  const [role, setRole] = useState<UserRole>(user.role);
  const [busy, setBusy] = useState(false);
  const self = session.getUser()?.id === user.id;
  const submit = async () => {
    setBusy(true);
    try {
      await dp.setUserRole(user.id, role);
      notify(`${user.name} is now ${role}`, { type: "success" });
      onDone();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Could not change role", { type: "error" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Change role</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {self
            ? "You cannot change your own role."
            : `Choose a role for ${user.name}. Admins can manage everything, including other admins.`}
        </DialogContentText>
        <MuiTextField
          select
          fullWidth
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={self}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="moderator">Moderator</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </MuiTextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={busy || self || role === user.role}>
          {busy ? "Saving..." : "Change role"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StatusDialog = ({ user, onClose, onDone }: { user: ApiUser; onClose: () => void; onDone: () => void }) => {
  const dp = useDataProvider<AgroDataProvider>();
  const notify = useNotify();
  const [busy, setBusy] = useState(false);
  const suspending = isActive(user);
  const submit = async () => {
    setBusy(true);
    try {
      await dp.setUserActive(user.id, !suspending);
      notify(suspending ? `${user.name} suspended` : `${user.name} restored`, { type: "success" });
      onDone();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Could not update account status", { type: "error" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{suspending ? "Suspend account?" : "Restore account?"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {suspending
            ? `${user.name} will no longer be able to sign in until restored.`
            : `${user.name} will be able to sign in again.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" color={suspending ? "error" : "primary"} onClick={submit} disabled={busy}>
          {suspending ? "Suspend" : "Restore"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminActions = () => {
  const record = useRecordContext<ApiUser>();
  const refresh = useRefresh();
  const [dialog, setDialog] = useState<"role" | "status" | null>(null);
  if (!record) return null;
  const self = session.getUser()?.id === record.id;
  const done = () => {
    setDialog(null);
    refresh();
  };
  return (
    <TopToolbar>
      <EditButton />
      <Button onClick={() => setDialog("role")} disabled={self}>
        Change role
      </Button>
      <Button color={isActive(record) ? "error" : "primary"} onClick={() => setDialog("status")} disabled={self}>
        {isActive(record) ? "Suspend" : "Restore"}
      </Button>
      {!self && (
        <DeleteWithConfirmButton
          mutationMode="pessimistic"
          confirmTitle="Delete this user?"
          confirmContent="The account and its sign-in access are permanently removed."
        />
      )}
      {dialog === "role" && <RoleDialog user={record} onClose={() => setDialog(null)} onDone={done} />}
      {dialog === "status" && <StatusDialog user={record} onClose={() => setDialog(null)} onDone={done} />}
    </TopToolbar>
  );
};

export const UserShow = () => {
  const { isAdmin } = useCan();
  return (
    <Show actions={isAdmin ? <AdminActions /> : <TopToolbar />}>
      <SimpleShowLayout>
        <TextField source="name" />
        <TextField source="userId" label="User ID" />
        <EmailField source="email" />
        <TextField source="mobile" />
        <TextField source="state" />
        <TextField source="address" />
        <TextField source="language" />
        <FunctionField label="Role" render={(r: ApiUser) => <RoleChip record={r} />} />
        <FunctionField label="Status" render={(r: ApiUser) => <StatusChip record={r} />} />
        <DateField source="createdAt" label="Joined" showTime />
      </SimpleShowLayout>
    </Show>
  );
};

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

export const UserEdit = () => (
  <Edit mutationMode="pessimistic" redirect="show">
    <SimpleForm sx={{ maxWidth: 560 }} toolbar={<EditToolbar />}>
      <TextInput source="name" validate={required("Name")} fullWidth />
      <TextInput source="email" type="email" validate={[required("Email"), email()]} fullWidth />
      <TextInput
        source="mobile"
        validate={[required("Mobile"), regex(/^\d{10}$/, "Enter a 10-digit mobile number")]}
        fullWidth
      />
      <SelectInput source="state" choices={stateChoices.filter((s) => s.id !== "All States")} fullWidth />
      <TextInput source="address" multiline fullWidth />
      <SelectInput source="language" choices={["English", "Hindi", "Gujarati"].map((n) => ({ id: n, name: n }))} fullWidth />
    </SimpleForm>
  </Edit>
);
