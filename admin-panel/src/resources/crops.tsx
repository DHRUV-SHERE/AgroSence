import {
  Datagrid,
  DateField,
  DeleteWithConfirmButton,
  FunctionField,
  List,
  NumberField,
  SearchInput,
  SelectInput,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
} from "react-admin";
import { Avatar, Box, Chip } from "@mui/material";
import { BulkActions, EmptyState, ListActions, NoResults, RowDelete } from "./shared";
import { fmtMoney, personName } from "../format";

interface Crop {
  id: string;
  cropName?: string;
  cropImages?: string[];
  cropStatus?: string;
  cropSellingPrice?: number;
  cropUnit?: string;
  userId?: unknown;
  seller?: unknown;
}

const price = (r: Crop) => `${fmtMoney(r.cropSellingPrice)} / ${r.cropUnit ?? "unit"}`;
const seller = (r: Crop) => personName(r.seller ?? r.userId);

const filters = [
  <SearchInput key="q" source="q" alwaysOn placeholder="Search crops" />,
  <SelectInput
    key="status"
    source="status"
    choices={[
      { id: "Available", name: "Available" },
      { id: "Sold", name: "Sold" },
    ]}
  />,
  <SelectInput
    key="organic"
    source="organic"
    label="Organic"
    choices={[
      { id: "true", name: "Organic" },
      { id: "false", name: "Non-organic" },
    ]}
  />,
];

export const CropList = () => (
  <List
    filters={filters}
    sort={{ field: "createdAt", order: "DESC" }}
    perPage={20}
    actions={<ListActions />}
    empty={<EmptyState noun="crop listings" />}
  >
    <Datagrid rowClick="show" bulkActionButtons={<BulkActions allow />} empty={<NoResults noun="crop listings" />}>
      <FunctionField
        label=""
        sortable={false}
        render={(r: Crop) => (
          <Avatar variant="rounded" src={r.cropImages?.[0]} alt={r.cropName} sx={{ width: 44, height: 44 }}>
            {r.cropName?.charAt(0)}
          </Avatar>
        )}
      />
      <TextField source="cropName" label="Crop" />
      <TextField source="cropCategory" label="Category" />
      <FunctionField label="Price" source="cropSellingPrice" render={price} />
      <NumberField source="cropQuantity" label="Qty" />
      <FunctionField label="Seller" sortable={false} render={seller} />
      <FunctionField
        label="Status"
        source="cropStatus"
        render={(r: Crop) => (
          <Chip size="small" label={r.cropStatus ?? "-"} color={r.cropStatus === "Sold" ? "default" : "success"} variant="outlined" />
        )}
      />
      <DateField source="sellingDate" label="Listed" />
      <RowDelete noun="listing" />
    </Datagrid>
  </List>
);

const ShowActions = () => (
  <TopToolbar>
    <DeleteWithConfirmButton
      mutationMode="pessimistic"
      confirmTitle="Remove this listing?"
      confirmContent="This is a moderation action. The listing is permanently removed."
    />
  </TopToolbar>
);

export const CropShow = () => (
  <Show actions={<ShowActions />}>
    <SimpleShowLayout>
      <TextField source="cropName" label="Crop" />
      <TextField source="cropId" label="Listing ID" />
      <TextField source="cropDescription" label="Description" />
      <TextField source="cropCategory" label="Category" />
      <FunctionField label="Price" render={price} />
      <NumberField source="cropQuantity" label="Quantity" />
      <TextField source="grownOrganically" label="Grown organically" />
      <TextField source="cropStatus" label="Status" />
      <FunctionField label="Seller" render={seller} />
      <DateField source="sellingDate" label="Listed" showTime />
      <FunctionField
        label="Images"
        render={(r: Crop) => (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {(r.cropImages ?? []).map((src) => (
              <Box
                key={src}
                component="img"
                src={src}
                alt={r.cropName ?? "Crop"}
                sx={{ width: 140, height: 100, objectFit: "cover", borderRadius: 2 }}
              />
            ))}
          </Box>
        )}
      />
    </SimpleShowLayout>
  </Show>
);
