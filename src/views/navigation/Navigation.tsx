import { Toolbar, Box as MuiBox } from "@mui/material";
import { useState } from "react";
import CustomDrawer from "@/views/navigation/CustomDrawer";
import ListOptions from "@/views/navigation/ListOptions";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CustomDrawer
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      alwaysOpenOnDesktop
    >
      <Toolbar variant="dense" />
      <MuiBox sx={{ overflow: "auto", flex: 1 }}>
        <ListOptions />
      </MuiBox>
    </CustomDrawer>
  );
}
