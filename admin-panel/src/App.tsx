import { lazy } from "react";
import { Admin, CustomRoutes, Resource } from "react-admin";
import { Route } from "react-router-dom";
import dataProvider from "./dataProvider";
import authProvider from "./authProvider";
import { Layout } from "./layout/Layout";
import { darkTheme, lightTheme } from "./theme";
import LoginPage from "./pages/LoginPage";
import { ContactList, ContactShow } from "./resources/contacts";
import { CropList, CropShow } from "./resources/crops";
import { OrderList, OrderShow } from "./resources/orders";
import { ResourceCreate, ResourceEdit, ResourceList } from "./resources/resourcesRes";
import { SchemeCreate, SchemeEdit, SchemeList } from "./resources/schemes";
import { UserEdit, UserList, UserShow } from "./resources/users";
import { AuditLogList, AuditLogShow } from "./resources/auditLogs";
import SchemeIcon from "@mui/icons-material/AccountBalanceOutlined";
import ResourceIcon from "@mui/icons-material/Inventory2Outlined";
import MailIcon from "@mui/icons-material/MailOutline";
import GrassIcon from "@mui/icons-material/GrassOutlined";
import OrdersIcon from "@mui/icons-material/ShoppingBagOutlined";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import AuditIcon from "@mui/icons-material/HistoryOutlined";

// Charts (recharts) live in the dashboard chunk only.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));

/**
 * Resources are mounted per role (the `permissions` value comes from
 * authProvider.getPermissions), so a moderator never gets admin-only routes.
 */
const App = () => (
  <Admin
    title="AgroSense Admin"
    dataProvider={dataProvider}
    authProvider={authProvider}
    dashboard={Dashboard}
    layout={Layout}
    loginPage={LoginPage}
    theme={lightTheme}
    darkTheme={darkTheme}
    defaultTheme="light"
    requireAuth
    disableTelemetry
  >
    {(role: string | null) => [
      <Resource key="schemes" name="schemes" list={SchemeList} create={SchemeCreate} edit={SchemeEdit} icon={SchemeIcon} />,
      <Resource key="resources" name="resources" list={ResourceList} create={ResourceCreate} edit={ResourceEdit} icon={ResourceIcon} />,
      <Resource key="contacts" name="contacts" list={ContactList} show={ContactShow} icon={MailIcon} />,
      <Resource key="crops" name="crops" list={CropList} show={CropShow} icon={GrassIcon} />,
      <Resource key="orders" name="orders" list={OrderList} show={OrderShow} icon={OrdersIcon} />,
      <Resource
        key="users"
        name="users"
        list={UserList}
        show={UserShow}
        edit={role === "admin" ? UserEdit : undefined}
        icon={PeopleIcon}
      />,
      role === "admin" ? (
        <Resource key="audit-logs" name="audit-logs" list={AuditLogList} show={AuditLogShow} icon={AuditIcon} options={{ label: "Audit logs" }} />
      ) : null,
      <CustomRoutes key="custom">
        <Route path="/profile" element={<Profile />} />
      </CustomRoutes>,
    ]}
  </Admin>
);

export default App;
