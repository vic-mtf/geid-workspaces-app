/**
 * ViewerTopBar — Barre superieure du visualiseur plein ecran.
 *
 * Affiche le nom du fichier, les boutons de telechargement, suppression et fermeture.
 * Apparait au survol sur desktop, toujours visible sur mobile.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, IconButton, Typography, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

interface ViewerTopBarProps {
  filename: string;
  onDownload: () => void;
  onDelete: () => void;
  onClose: () => void;
  hovered: boolean;
}

const ViewerTopBar = React.memo(function ViewerTopBar({
  filename,
  onDownload,
  onDelete,
  onClose,
  hovered,
}: ViewerTopBarProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const visible = isMobile || hovered;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1600,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 1, sm: 2 },
        py: 1,
        bgcolor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Left — actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip title={t("viewer.download")}>
          <IconButton onClick={onDownload} sx={{ color: "common.white" }}>
            <DownloadRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("viewer.delete")}>
          <IconButton onClick={onDelete} sx={{ color: "common.white" }}>
            <DeleteRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Center — filename */}
      <Typography
        variant="body1"
        noWrap
        sx={{
          color: "common.white",
          flex: 1,
          textAlign: "center",
          mx: 2,
          maxWidth: { xs: 200, sm: 400, md: 600 },
          fontSize: { xs: "0.85rem", sm: "1rem" },
        }}
      >
        {filename}
      </Typography>

      {/* Right — close */}
      <Tooltip title={t("common.close")}>
        <IconButton onClick={onClose} sx={{ color: "common.white" }}>
          <CloseRoundedIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
});

export default ViewerTopBar;
