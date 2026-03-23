import {
  ListItemButton, ListItemIcon, ListItemText,
  Divider, Typography, Box, LinearProgress,
  alpha, useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { mainMenu, quickAccess } from "@/views/navigation/listOptionMenu";
import { useEffect, useState } from "react";
import workspaceApi from "@/services/workspaceApi";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import BoxScrollShadow from "@/components/BoxScrollShadow";
import React from "react";

export default function ListOptions() {
  const { pathname } = useLocation();
  const navigateTo = useNavigate();
  const theme = useTheme();
  const [quota, setQuota] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    workspaceApi.getQuota()
      .then((res) => setQuota(res.data))
      .catch(() => {});
  }, []);

  const renderItem = (option: typeof mainMenu[number]) => {
    const isActive = pathname === option.to || pathname.startsWith(option.to + "?");
    return (
      <ListItemButton
        key={option.label}
        onClick={() => navigateTo(option.to)}
        selected={isActive}
        sx={{
          borderRadius: 2,
          mb: 0.5,
          py: 1,
          "&.Mui-selected": {
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.18),
            },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 36,
            color: isActive ? "primary.main" : "text.secondary",
          }}
        >
          {React.createElement(option.icon, { fontSize: "small" })}
        </ListItemIcon>
        <ListItemText
          primary={option.label}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "primary.main" : "text.primary",
          }}
        />
      </ListItemButton>
    );
  };

  const quotaPercent = quota ? (quota.used / quota.total) * 100 : 0;
  const quotaColor = quotaPercent > 90 ? "error" : quotaPercent > 70 ? "warning" : "primary";

  return (
    <Box display="flex" flexDirection="column" flex={1} overflow="hidden">
      <BoxScrollShadow sx={{ px: 1, py: 0.5, flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ px: 1, py: 0.5, display: "block" }}
        >
          Mon espace
        </Typography>
        {mainMenu.map(renderItem)}

        <Divider sx={{ my: 1 }} />

        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ px: 1, py: 0.5, display: "block" }}
        >
          Accès rapide
        </Typography>
        {quickAccess.map(renderItem)}
      </BoxScrollShadow>

      {quota && (
        <Box px={2} pb={2} pt={1} flexShrink={0}>
          <Divider sx={{ mb: 1.5 }} />
          <LinearProgress
            variant="determinate"
            value={Math.min(quotaPercent, 100)}
            color={quotaColor as any}
            sx={{ borderRadius: 1, height: 6, mb: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary">
            {normaliseOctetSize(quota.used)} sur {normaliseOctetSize(quota.total)} utilisés
          </Typography>
        </Box>
      )}
    </Box>
  );
}
