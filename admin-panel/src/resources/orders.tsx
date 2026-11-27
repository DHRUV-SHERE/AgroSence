import { Datagrid, DateField, FunctionField, List, SearchInput, SelectInput, Show, SimpleShowLayout, TextField, TopToolbar } from "react-admin";
import { Chip } from "@mui/material";
import { EmptyState, ListActions, NoResults } from "./shared";
import { fmtMoney, personName } from "../format";

interface Order {
  id: string;
  status?: string;
  totalPrice?: number;
  quantity?: number;
  buyer?: unknown;
  buyerId?: unknown;
  seller?: unknown;
  sellerId?: unknown;
  crop?: unknown;
  cropId?: unknown;
}

const cropName = (r: Order) => {
  const c = (r.crop ?? r.cropId) as { cropName?: string } | string | undefined;
  return typeof c === "object" && c ? (c.cropName ?? personName(c)) : (c ?? "-");
};

const StatusChip = ({ status }: { status?: string }) => {
  const color = status === "Accepted" ? "success" : status === "Pending" ? "warning" : status === "Rejected" ? "error" : "default";
  return <Chip size="small" label={status ?? "-"} color={color} variant="outlined" />;
};

const filters = [
  <SearchInput key="q" source="q" alwaysOn placeholder="Search orders" />,
  <SelectInput
    key="status"
    source="status"
    choices={["Pending", "Accepted", "Rejected", "Cancelled"].map((s) => ({ id: s, name: s }))}
  />,
];

export const OrderList = () => (
  <List
    filters={filters}
    sort={{ field: "createdAt", order: "DESC" }}
    perPage={20}
    actions={<ListActions />}
    empty={<EmptyState noun="orders" />}
  >
    <Datagrid rowClick="show" bulkActionButtons={false} empty={<NoResults noun="orders" />}>
      <FunctionField label="Crop" sortable={false} render={cropName} />
      <FunctionField label="Buyer" sortable={false} render={(r: Order) => personName(r.buyer ?? r.buyerId)} />
      <FunctionField label="Seller" sortable={false} render={(r: Order) => personName(r.seller ?? r.sellerId)} />
      <TextField source="quantity" label="Qty" />
      <FunctionField label="Total" source="totalPrice" render={(r: Order) => fmtMoney(r.totalPrice)} />
      <FunctionField label="Status" source="status" render={(r: Order) => <StatusChip status={r.status} />} />
      <DateField source="createdAt" label="Placed" showTime />
    </Datagrid>
  </List>
);

export const OrderShow = () => (
  <Show actions={<TopToolbar />}>
    <SimpleShowLayout>
      <TextField source="id" label="Order ID" />
      <FunctionField label="Crop" render={cropName} />
      <FunctionField label="Buyer" render={(r: Order) => personName(r.buyer ?? r.buyerId)} />
      <FunctionField label="Seller" render={(r: Order) => personName(r.seller ?? r.sellerId)} />
      <TextField source="quantity" />
      <FunctionField label="Total" render={(r: Order) => fmtMoney(r.totalPrice)} />
      <FunctionField label="Status" render={(r: Order) => <StatusChip status={r.status} />} />
      <DateField source="createdAt" label="Placed" showTime />
    </SimpleShowLayout>
  </Show>
);
