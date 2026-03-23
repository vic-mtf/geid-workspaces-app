import React, { useMemo, useCallback } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { mainMenu, quickAccess } from "@/views/navigation/listOptionMenu";

const allTabs = [...mainMenu, ...quickAccess];

export default function MobileBottomNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const value = useMemo(
    () => allTabs.find((t) => pathname === t.to || pathname.startsWith(t.to + "?"))?.to ?? "/documents",
    [pathname]
  );

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      navigate(newValue);
    },
    [navigate]
  );

  if (!isMobile) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        {allTabs.map(({ icon, label, to }) => (
          <BottomNavigationAction
            key={to}
            label={label}
            value={to}
            icon={React.createElement(icon, { fontSize: "small" })}
            sx={{
              minWidth: 0,
              "& .MuiBottomNavigationAction-label": {
                fontSize: "10px !important",
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
