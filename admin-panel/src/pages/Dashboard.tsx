import { useCallback, useEffect, useState } from "react";
import { Link, useDataProvider, useGetIdentity, Title } from "react-admin";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import GrassIcon from "@mui/icons-material/GrassOutlined";
import OrdersIcon from "@mui/icons-material/ShoppingBagOutlined";
import MailIcon from "@mui/icons-material/MailOutline";
import SchemeIcon from "@mui/icons-material/AccountBalanceOutlined";
import ResourceIcon from "@mui/icons-material/Inventory2Outlined";
import type { ReactNode } from "react";
import type { AgroDataProvider } from "../dataProvider";
import type { Stats } from "../api/types";
import { chartPalette } from "../theme";
import { fmtDate, fmtMoney, personName } from "../format";

type Row = Record<string, unknown> & { id: string };

interface DashData {
  stats: Stats;
  contacts: Row[];
  orders: Row[];
}

const statusColor = (status: string, i: number, colors: string[], neutral: string) => {
  const map: Record<string, string> = {
    Pending: colors[1],
    Accepted: colors[0],
    Rejected: colors[3],
    Cancelled: neutral,
  };
  return map[status] ?? colors[i % colors.length];
};

const Kpi = ({ label, value, icon, to }: { label: string; value: ReactNode; icon: ReactNode; to?: string }) => (
  <Card
    variant="outlined"
    component={to ? Link : "div"}
    {...(to ? { to } : {})}
    sx={{ textDecoration: "none", color: "inherit", "&:hover": to ? { borderColor: "primary.main" } : undefined }}
  >
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, "&:last-child": { pb: 2 } }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "action.hover",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Panel = ({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) => (
  <Card variant="outlined" sx={{ height: "100%" }}>
    <CardHeader title={title} action={action} titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }} />
    <CardContent sx={{ pt: 0 }}>{children}</CardContent>
  </Card>
);

const Dashboard = () => {
  const dp = useDataProvider<AgroDataProvider>();
  const theme = useTheme();
  const { data: me } = useGetIdentity();
  const [data, setData] = useState<DashData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setData(null);
    try {
      const page = { pagination: { page: 1, perPage: 5 }, sort: { field: "createdAt", order: "DESC" as const }, filter: {} };
      const [stats, contacts, orders] = await Promise.all([
        dp.getStats(),
        dp.getList("contacts", page).catch(() => ({ data: [] })),
        dp.getList("orders", page).catch(() => ({ data: [] })),
      ]);
      setData({ stats, contacts: contacts.data as Row[], orders: orders.data as Row[] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load dashboard data.");
    }
  }, [dp]);

  useEffect(() => {
    void load();
  }, [load]);

  const colors = chartPalette(theme.palette.mode);
  const axis = theme.palette.text.secondary;
  const grid = theme.palette.divider;
  const tooltipStyle = {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 10,
    color: theme.palette.text.primary,
  };

  const s = data?.stats;
  const overview = s
    ? [
        { name: "Users", value: s.users },
        { name: "Contacts", value: s.contacts },
        { name: "Schemes", value: s.schemes },
        { name: "Resources", value: s.resources },
      ]
    : [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: "100%", minWidth: 0 }}>
      <Title title="Dashboard" />
      <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
        Welcome back{me?.fullName ? `, ${String(me.fullName).split(" ")[0]}` : ""}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Here is how AgroSense is doing today.
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => void load()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
          mb: 2,
        }}
      >
        {!s && !error
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" height={78} />)
          : s && (
              <>
                <Kpi label="Users" value={s.users.toLocaleString()} icon={<PeopleIcon />} to="/users" />
                <Kpi label="Crop listings" value={s.crops.toLocaleString()} icon={<GrassIcon />} to="/crops" />
                <Kpi label="Orders" value={s.orders.toLocaleString()} icon={<OrdersIcon />} to="/orders" />
                <Kpi label="Contacts" value={s.contacts.toLocaleString()} icon={<MailIcon />} to="/contacts" />
                <Kpi label="Schemes" value={s.schemes.toLocaleString()} icon={<SchemeIcon />} to="/schemes" />
                <Kpi label="Resources" value={s.resources.toLocaleString()} icon={<ResourceIcon />} to="/resources" />
              </>
            )}
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, mb: 2 }}>
        <Panel title="Signups, last 30 days">
          {!s ? (
            <Skeleton variant="rounded" height={260} />
          ) : s.signupsByDay.length === 0 ? (
            <Empty text="No signups in this period." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={s.signupsByDay} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: axis, fontSize: 12 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(d) => fmtDate(String(d))} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Signups"
                  stroke={colors[0]}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Revenue">
          {!s ? (
            <Skeleton variant="rounded" height={260} />
          ) : (
            <Box sx={{ height: 260, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="h4" color="primary.main">
                {fmtMoney(s.revenue)}
              </Typography>
              <Typography color="text.secondary">from accepted orders</Typography>
            </Box>
          )}
        </Panel>
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, mb: 2 }}>
        <Panel title="Platform overview">
          {!s ? (
            <Skeleton variant="rounded" height={300} />
          ) : overview.every((o) => o.value === 0) ? (
            <Empty text="Nothing to chart yet." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overview.filter((o) => o.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke={theme.palette.background.paper}
                  strokeWidth={2}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {overview.filter((o) => o.value > 0).map((o) => (
                    <Cell key={o.name} fill={[colors[0], colors[1], colors[2], colors[4]][overview.findIndex((x) => x.name === o.name)]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: axis, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>
        <Panel title="Orders by status">
          {!s ? (
            <Skeleton variant="rounded" height={220} />
          ) : s.ordersByStatus.length === 0 ? (
            <Empty text="No orders yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={s.ordersByStatus} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" tick={{ fill: axis, fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: axis, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme.palette.action.hover }} />
                <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                  {s.ordersByStatus.map((o, i) => (
                    <Cell key={o.status} fill={statusColor(o.status, i, colors, theme.palette.text.disabled)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Panel
          title="Recent contacts"
          action={
            <Button component={Link} to="/contacts" size="small">
              View all
            </Button>
          }
        >
          {!data ? (
            <Skeleton variant="rounded" height={220} />
          ) : data.contacts.length === 0 ? (
            <Empty text="No messages yet." />
          ) : (
            <List dense disablePadding>
              {data.contacts.map((c) => (
                <ListItem key={c.id} disableGutters component={Link} to={`/contacts/${c.id}/show`} sx={{ color: "inherit" }}>
                  <ListItemText
                    primary={String(c.name ?? "Unknown")}
                    secondary={`${String(c.message ?? "").slice(0, 60)}${fmtDate(String(c.createdAt ?? c.dateSubmitted ?? "")) ? " · " + fmtDate(String(c.createdAt ?? c.dateSubmitted)) : ""}`}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Panel>

        <Panel
          title="Recent orders"
          action={
            <Button component={Link} to="/orders" size="small">
              View all
            </Button>
          }
        >
          {!data ? (
            <Skeleton variant="rounded" height={220} />
          ) : data.orders.length === 0 ? (
            <Empty text="No orders yet." />
          ) : (
            <List dense disablePadding>
              {data.orders.map((o) => (
                <ListItem key={o.id} disableGutters component={Link} to={`/orders/${o.id}/show`} sx={{ color: "inherit" }}>
                  <ListItemText
                    primary={`${fmtMoney(Number(o.totalPrice ?? 0))} · ${String(o.status ?? "")}`}
                    secondary={`${personName(o.buyer ?? o.buyerId)} · ${fmtDate(String(o.createdAt ?? ""))}`}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Panel>
      </Box>
    </Box>
  );
};

const Empty = ({ text }: { text: string }) => (
  <Box sx={{ height: 160, display: "grid", placeItems: "center", color: "text.secondary" }}>
    <Typography variant="body2">{text}</Typography>
  </Box>
);

export default Dashboard;
