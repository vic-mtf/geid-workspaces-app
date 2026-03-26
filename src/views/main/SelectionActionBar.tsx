/**
 * SelectionActionBar — Barre d'actions affichee quand des fichiers sont selectionnes.
 */

import React, { useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import { useTranslation } from "react-i18next";

interface SelectionActionBarProps {
  selectedFiles: Set<string>;
  onClearSelection: () => void;
  onDelete: () => void;
  onMove: () => void;
}

const SelectionActionBar = React.memo(function SelectionActionBar({
  selectedFiles,
  onClearSelection,
  onDelete,
  onMove,
}: SelectionActionBarProps) {
  const { t } = useTranslation();

  if (selectedFiles.size === 0) return null;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={2}
      py={0.75}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        borderRadius: 1,
        mx: 0.5,
        mt: 0.5,
      }}
    >
      <Tooltip title={t("selection.deselectAll")}>
        <IconButton size="small" color="inherit" onClick={onClearSelection}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Typography variant="body2" fontWeight={600} sx={{ mr: "auto" }}>
        {t("selection.count", { count: selectedFiles.size })}
      </Typography>
      <Button
        size="small"
        color="inherit"
        startIcon={<DriveFileMoveOutlinedIcon />}
        onClick={onMove}
        sx={{ textTransform: "none" }}
      >
        {t("common.move")}
      </Button>
      <Button
        size="small"
        color="inherit"
        startIcon={<DeleteOutlinedIcon />}
        onClick={onDelete}
        sx={{ textTransform: "none" }}
      >
        {t("common.delete")}
      </Button>
    </Box>
  );
});

export default SelectionActionBar;
