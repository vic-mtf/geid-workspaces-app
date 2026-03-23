import { Drawer, useMediaQuery, useTheme } from "@mui/material";
import { ReactNode } from "react";

export const DRAWER_WIDTH = 280;

interface CustomDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  alwaysOpenOnDesktop?: boolean;
}

export default function CustomDrawer({
  open,
  onClose,
  children,
  alwaysOpenOnDesktop = true,
}: CustomDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: "100vw",
            boxSizing: "border-box",
            background: "none",
            bgcolor: "background.default",
          },
        }}
      >
        {children}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant={alwaysOpenOnDesktop ? "persistent" : "temporary"}
      open={alwaysOpenOnDesktop || open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          background: "none",
        },
      }}
    >
      {children}
    </Drawer>
  );
}
