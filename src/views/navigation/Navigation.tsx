import { Avatar, Drawer, Toolbar, Box as MuiBox, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ListOptions from "@/views/navigation/ListOptions";
import getFullName from "@/utils/getFullName";
import avatarColor from "@/utils/avatarColor";
import { RootState } from "@/types";

export const drawerWidth = 280;

export default function Navigation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = () => setOpen((prev) => !prev);
    root?.addEventListener("_toggle_nav_drawer", handler);
    return () => root?.removeEventListener("_toggle_nav_drawer", handler);
  }, []);

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={() => setOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: { xs: 0, md: drawerWidth },
        flexShrink: 0,
        transition: "none",
        "& .MuiDrawer-paper": {
          width: isMobile ? "100vw" : drawerWidth,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Toolbar />
      <UserProfile />
      <MuiBox sx={{ overflow: "auto", flex: 1 }}>
        <ListOptions />
      </MuiBox>
    </Drawer>
  );
}

function UserProfile() {
  const user = useSelector((store: RootState) => store.user);
  const fullName = getFullName(user);
  const initials = `${(user.firstname?.[0] || "").toUpperCase()}${(user.lastname?.[0] || "").toUpperCase()}`;
  const colors = avatarColor(user.id);

  return (
    <MuiBox display="flex" alignItems="center" gap={1.5} px={2} py={1.5} borderBottom={1} borderColor="divider">
      <Avatar src={user.image} sx={{ width: 36, height: 36, fontSize: 14, ...colors }}>
        {initials}
      </Avatar>
      <MuiBox minWidth={0}>
        <Typography variant="body2" fontWeight={600} noWrap>{fullName}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
      </MuiBox>
    </MuiBox>
  );
}
