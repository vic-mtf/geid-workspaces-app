import { Drawer, Toolbar, Box as MuiBox, useTheme, useMediaQuery } from "@mui/material";
import { useState, useEffect } from "react";
import ListOptions from "@/views/navigation/ListOptions";

export const drawerWidth = 250;

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
        width: isMobile ? 0 : drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: isMobile ? "80vw" : drawerWidth,
          boxSizing: "border-box",
          background: "none",
        },
      }}
    >
      <Toolbar />
      <MuiBox sx={{ overflow: "auto" }}>
        <ListOptions />
      </MuiBox>
    </Drawer>
  );
}
