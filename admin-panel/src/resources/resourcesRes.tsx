import {
  Create,
  Datagrid,
  DateField,
  DeleteWithConfirmButton,
  Edit,
  EditButton,
  FunctionField,
  ImageField,
  ImageInput,
  List,
  SaveButton,
  SearchInput,
  SimpleForm,
  TextField,
  TextInput,
  Toolbar,
  type Validator,
} from "react-admin";
import { Avatar } from "@mui/material";
import { BulkActions, EmptyState, ListActions, NoResults, RowDelete, minLength, required, url } from "./shared";
import { useCan } from "../permissions";
import { SafeUrlField } from "./SafeUrlField";

const filters = [<SearchInput key="q" source="q" alwaysOn placeholder="Search resources" />];

const MAX_IMAGE = 5 * 1024 * 1024;
const imageSize: Validator = (v: unknown) =>
  v && typeof v === "object" && (v as { rawFile?: File }).rawFile && (v as { rawFile: File }).rawFile.size > MAX_IMAGE
    ? "Image must be 5MB or smaller"
    : undefined;

export const ResourceList = () => {
  const { isStaff } = useCan();
  return (
    <List
      filters={filters}
      sort={{ field: "createdAt", order: "DESC" }}
      perPage={20}
      actions={<ListActions create={isStaff} />}
      empty={<EmptyState noun="resources" canCreate={isStaff} />}
    >
      <Datagrid
        rowClick="edit"
        bulkActionButtons={isStaff ? <BulkActions allow /> : false}
        empty={<NoResults noun="resources" />}
      >
        <FunctionField
          label=""
          sortable={false}
          render={(r: { image?: string; name?: string }) => (
            <Avatar variant="rounded" src={r.image} alt={r.name} sx={{ width: 44, height: 44 }}>
              {r.name?.charAt(0)}
            </Avatar>
          )}
        />
        <TextField source="name" />
        <TextField source="popularbrand" label="Popular brand" />
        <TextField source="purpose" />
        <SafeUrlField source="link" />
        <DateField source="createdAt" label="Created" />
        <EditButton />
        <RowDelete noun="resource" />
      </Datagrid>
    </List>
  );
};

const Fields = ({ imageRequired }: { imageRequired: boolean }) => (
  <>
    <TextInput source="name" validate={[required("Name"), minLength("Name", 2)]} fullWidth />
    <TextInput source="description" multiline minRows={3} validate={required("Description")} fullWidth />
    <ImageInput
      source="image"
      label="Image (jpg, png, webp, max 5MB)"
      accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
      maxSize={MAX_IMAGE}
      validate={imageRequired ? [(v: unknown) => (v ? undefined : "An image is required"), imageSize] : [imageSize]}
    >
      <ImageField source="src" title="title" sx={{ "& img": { maxWidth: 280, maxHeight: 200, borderRadius: 1 } }} />
    </ImageInput>
    <TextInput source="popularbrand" label="Popular brand" validate={required("Popular brand")} fullWidth />
    <TextInput source="link" validate={[required("Link"), url]} fullWidth />
    <TextInput source="purpose" multiline validate={required("Purpose")} fullWidth />
    <TextInput source="advantages" multiline validate={required("Advantages")} fullWidth />
    <TextInput source="howtouse" label="How to use" multiline minRows={2} validate={required("How to use")} fullWidth />
  </>
);

const EditToolbar = () => (
  <Toolbar sx={{ justifyContent: "space-between" }}>
    <SaveButton />
    <DeleteWithConfirmButton mutationMode="pessimistic" confirmTitle="Delete this resource?" confirmContent="This cannot be undone." />
  </Toolbar>
);

export const ResourceCreate = () => (
  <Create redirect="list">
    <SimpleForm sx={{ maxWidth: 720 }}>
      <Fields imageRequired />
    </SimpleForm>
  </Create>
);

/** The image input previews the current image; picking a new file replaces it. */
export const ResourceEdit = () => (
  <Edit mutationMode="pessimistic" redirect="list">
    <SimpleForm sx={{ maxWidth: 720 }} toolbar={<EditToolbar />}>
      <Fields imageRequired={false} />
    </SimpleForm>
  </Edit>
);
