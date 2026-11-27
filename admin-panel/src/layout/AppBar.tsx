import { AppBar as RAAppBar, TitlePortal, ToggleThemeButton, UserMenu, MenuItemLink, Logout, useGetIdentity } from "react-admin";
import { Avatar, Box, Chip, Divider, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/PersonOutline";
import { Logo } from "./Logo";

const AccountMenu = () => {
  const { data } = useGetIdentity();
  return (
    <UserMenu
      icon={
        <Avatar src={data?.avatar} sx={{ width: 32, height: 32, bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700, fontSize: 14 }}>
          {(data?.fullName ?? "?").charAt(0).toUpperCase()}
        </Avatar>
      }
    >
      <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
        <Typography variant="subtitle2" noWrap>
          {data?.fullName}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {data?.email}
        </Typography>
        <Chip size="small" label={data?.role ?? ""} color="primary" variant="outlined" sx={{ mt: 0.5, textTransform: "capitalize" }} />
      </Box>
      <Divider />
      <MenuItemLink to="/profile" primaryText="My account" leftIcon={<PersonIcon />} />
      <Logout />
    </UserMenu>
  );
};

export const AppBar = () => (
  <RAAppBar
    userMenu={<AccountMenu />}
    toolbar={<ToggleThemeButton />}
    sx={{ "& .RaAppBar-toolbar": { gap: 1 } }}
  >
    <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", mr: 2 }}>
      <Logo size={30} />
    </Box>
    <TitlePortal />
  </RAAppBar>
);
