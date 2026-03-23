import {
  Toolbar,
  Box as MuiBox,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useState, useCallback } from "react";
import CustomDrawer from "@/views/navigation/CustomDrawer";
import ListOptions from "@/views/navigation/ListOptions";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <CustomDrawer open={mobileOpen} onClose={handleClose} alwaysOpenOnDesktop>
      <Toolbar variant="dense" />

      <MuiBox
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1.5}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          letterSpacing={1.2}
          textTransform="uppercase"
        >
          Navigation
        </Typography>
        {isMobile && (
          <IconButton onClick={handleClose} size="small" edge="end">
            <CloseOutlinedIcon fontSize="small" />
          </IconButton>
        )}
      </MuiBox>

      <Divider sx={{ mx: 1, mb: 0.5 }} />

      <MuiBox overflow="hidden" display="flex" flex={1} flexDirection="column">
        <ListOptions />
      </MuiBox>
    </CustomDrawer>
  );
}
