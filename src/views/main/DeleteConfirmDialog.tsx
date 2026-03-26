/**
 * DeleteConfirmDialog — Dialogue de confirmation de suppression de fichiers.
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { useTranslation } from "react-i18next";

interface DeleteConfirmDialogProps {
  open: boolean;
  fileNames: string[];
  onConfirm: () => void;
  onClose: () => void;
}

const MAX_SHOWN = 5;

const DeleteConfirmDialog = React.memo(function DeleteConfirmDialog({
  open,
  fileNames,
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();
  const shown = fileNames.slice(0, MAX_SHOWN);
  const remaining = fileNames.length - MAX_SHOWN;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningAmberRoundedIcon color="warning" />
          <Typography variant="h6" fontWeight="bold" fontSize={18}>
            {t("deleteConfirm.title")}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {fileNames.length === 1
            ? t("deleteConfirm.messageSingle")
            : t("deleteConfirm.messageMultiple", { count: fileNames.length })}
        </Typography>
        <List dense disablePadding>
          {shown.map((name) => (
            <ListItem key={name} disableGutters sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <InsertDriveFileOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={name.replace(/_/g, " ")}
                primaryTypographyProps={{ variant: "body2", noWrap: true }}
              />
            </ListItem>
          ))}
        </List>
        {remaining > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
            {t("deleteConfirm.andMore", { count: remaining })}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {t("common.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteConfirmDialog;
