import { Menu as RAMenu, useSidebarState } from "react-admin";
import { Divider } from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import GrassIcon from "@mui/icons-material/GrassOutlined";
import OrdersIcon from "@mui/icons-material/ShoppingBagOutlined";
import MailIcon from "@mui/icons-material/MailOutline";
import SchemeIcon from "@mui/icons-material/AccountBalanceOutlined";
import ResourceIcon from "@mui/icons-material/Inventory2Outlined";
import AuditIcon from "@mui/icons-material/HistoryOutlined";
import PersonIcon from "@mui/icons-material/PersonOutline";
import { useCan } from "../permissions";

/** Items are omitted (not disabled) when the role may not use them. */
export const Menu = () => {
  const { isAdmin, isStaff } = useCan();
  const [, setOpen] = useSidebarState();
  const closeOnMobile = () => {
    if (window.innerWidth < 600) setOpen(false);
  };
  return (
    <RAMenu>
      <RAMenu.Item to="/" primaryText="Dashboard" leftIcon={<DashboardIcon />} onClick={closeOnMobile} />
      {isStaff && (
        <>
          <Divider sx={{ my: 1 }} />
          <RAMenu.Item to="/schemes" primaryText="Schemes" leftIcon={<SchemeIcon />} onClick={closeOnMobile} />
          <RAMenu.Item to="/resources" primaryText="Resources" leftIcon={<ResourceIcon />} onClick={closeOnMobile} />
          <RAMenu.Item to="/contacts" primaryText="Contacts" leftIcon={<MailIcon />} onClick={closeOnMobile} />
          <RAMenu.Item to="/crops" primaryText="Crops" leftIcon={<GrassIcon />} onClick={closeOnMobile} />
          <RAMenu.Item to="/orders" primaryText="Orders" leftIcon={<OrdersIcon />} onClick={closeOnMobile} />
          <Divider sx={{ my: 1 }} />
          <RAMenu.Item to="/users" primaryText="Users" leftIcon={<PeopleIcon />} onClick={closeOnMobile} />
        </>
      )}
      {isAdmin && (
        <RAMenu.Item to="/audit-logs" primaryText="Audit logs" leftIcon={<AuditIcon />} onClick={closeOnMobile} />
      )}
      <Divider sx={{ my: 1 }} />
      <RAMenu.Item to="/profile" primaryText="My account" leftIcon={<PersonIcon />} onClick={closeOnMobile} />
    </RAMenu>
  );
};
