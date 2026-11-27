import {
  Create,
  Datagrid,
  DateField,
  Edit,
  EditButton,
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
  DeleteWithConfirmButton,
  FunctionField,
} from "react-admin";
import { BulkActions, EmptyState, ListActions, NoResults, RowDelete, minLength, required, stateChoices, url } from "./shared";
import { useCan } from "../permissions";
import { SafeUrlField } from "./SafeUrlField";

const filters = [
  <SearchInput key="q" source="q" alwaysOn placeholder="Search schemes" />,
  <SelectInput key="state" source="state" choices={stateChoices} label="State" />,
];

export const SchemeList = () => {
  const { isStaff } = useCan();
  return (
    <List
      filters={filters}
      sort={{ field: "createdAt", order: "DESC" }}
      perPage={20}
      actions={<ListActions create={isStaff} />}
      empty={<EmptyState noun="schemes" canCreate={isStaff} />}
    >
      <Datagrid
        rowClick="edit"
        bulkActionButtons={isStaff ? <BulkActions allow /> : false}
        empty={<NoResults noun="schemes" />}
        sx={{ "& .column-description,& .column-eligibility,& .column-benefits": { maxWidth: 280 } }}
      >
        <TextField source="name" />
        <TextField source="state" sortable />
        <FunctionField label="Description" source="description" sortable={false} render={(r: { description?: string }) => ((r.description ?? "").length > 90 ? `${r.description?.slice(0, 90)}...` : r.description)} />
        <TextField source="eligibility" />
        <TextField source="benefits" />
        <SafeUrlField source="applyLink" label="Apply link" />
        <DateField source="createdAt" label="Created" />
        <EditButton />
        <RowDelete noun="scheme" />
      </Datagrid>
    </List>
  );
};

const Fields = () => (
  <>
    <TextInput source="name" validate={[required("Name"), minLength("Name", 3)]} fullWidth />
    <TextInput source="description" multiline minRows={3} validate={required("Description")} fullWidth />
    <TextInput source="eligibility" multiline minRows={2} validate={required("Eligibility")} fullWidth />
    <TextInput source="benefits" multiline minRows={2} validate={required("Benefits")} fullWidth />
    <TextInput source="applyLink" label="Apply link" validate={[required("Apply link"), url]} fullWidth />
    <SelectInput source="state" choices={stateChoices} defaultValue="All States" validate={required("State")} />
  </>
);

const EditToolbar = () => (
  <Toolbar sx={{ justifyContent: "space-between" }}>
    <SaveButton />
    <DeleteWithConfirmButton mutationMode="pessimistic" confirmTitle="Delete this scheme?" confirmContent="This cannot be undone." />
  </Toolbar>
);

export const SchemeCreate = () => (
  <Create redirect="list">
    <SimpleForm sx={{ maxWidth: 960 }}>
      <Fields />
    </SimpleForm>
  </Create>
);

export const SchemeEdit = () => (
  <Edit mutationMode="pessimistic" redirect="list">
    <SimpleForm sx={{ maxWidth: 960 }} toolbar={<EditToolbar />}>
      <Fields />
    </SimpleForm>
  </Edit>
);

export const SchemeShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="description" />
      <TextField source="eligibility" />
      <TextField source="benefits" />
      <TextField source="state" />
      <SafeUrlField source="applyLink" />
      <DateField source="createdAt" showTime />
    </SimpleShowLayout>
  </Show>
);
