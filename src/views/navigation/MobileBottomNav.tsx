import React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import listOptionMenu from "@/views/navigation/listOptionMenu";

export default function MobileBottomNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  if (!isMobile) return null;

  const currentIndex = listOptionMenu.findIndex((opt) =>
    pathname.includes(opt.to)
  );

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
      <BottomNavigation
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={(_e, newValue) => {
          const option = listOptionMenu[newValue];
          if (option) navigate(option.to + search);
        }}
        showLabels
      >
        {listOptionMenu.map((option) => (
          <BottomNavigationAction
            key={option.to}
            label={option.label}
            icon={React.createElement(option.icon, { fontSize: "small" })}
            sx={{
              minWidth: 0,
              "& .MuiBottomNavigationAction-label": { fontSize: "10px !important" },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
