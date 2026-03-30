/**
 * DeleteConfirmDialog — Dialogue de confirmation de suppression.
 * Adapté : fichier vs dossier, corbeille vs définitif.
 */

import React, { useState } from "react";
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import { useTranslation } from "react-i18next";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";

interface DeleteConfirmDialogProps {
  open: boolean;
  fileNames: string[];
  isDirectory?: boolean;
  isPermanent?: boolean;
  onConfirm: (permanent: boolean) => void;
  onClose: () => void;
}

const MAX_SHOWN = 5;

function DeleteConfirmDialog({
  open,
  fileNames,
  isDirectory = false,
  isPermanent = false,
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();
  const [permanent, setPermanent] = useState(isPermanent);
  const shown = fileNames.slice(0, MAX_SHOWN);
  const remaining = fileNames.length - MAX_SHOWN;

  const itemLabel = fileNames.length === 1
    ? (isDirectory ? t("deleteConfirm.folderSingle") : t("deleteConfirm.messageSingle"))
    : t("deleteConfirm.messageMultiple", { count: fileNames.length });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      BackdropProps={{
        sx: {
          bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
          backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
        },
      }}
      PaperProps={{ sx: { border: 1, borderColor: "divider" } }}
    >
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
          {itemLabel}
        </Typography>
        <List dense disablePadding>
          {shown.map((name) => {
            const hasExt = name.includes(".");
            return (
              <ListItem key={name} disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {isDirectory || !hasExt
                    ? <FolderRoundedIcon fontSize="small" color="warning" />
                    : <FileTypeIcon extension={getFileExtension(name) ?? "txt"} size={20} />}
                </ListItemIcon>
                <ListItemText primary={name} primaryTypographyProps={{ variant: "body2", noWrap: true }} />
              </ListItem>
            );
          })}
        </List>
        {remaining > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
            {t("deleteConfirm.andMore", { count: remaining })}
          </Typography>
        )}

        {/* Option corbeille vs définitif — sauf si déjà forcé permanent */}
        {!isPermanent && (
          <FormControlLabel
            sx={{ mt: 1.5, ml: 0 }}
            control={
              <Checkbox
                checked={permanent}
                onChange={(e) => setPermanent(e.target.checked)}
                size="small"
                color="error"
              />
            }
            label={
              <Typography variant="body2" color={permanent ? "error.main" : "text.secondary"} fontSize={13}>
                {t("deleteConfirm.permanentOption")}
              </Typography>
            }
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">{t("common.cancel")}</Button>
        <Button
          variant="contained"
          color="error"
          startIcon={permanent || isPermanent ? <DeleteForeverOutlinedIcon /> : <DeleteOutlinedIcon />}
          onClick={() => onConfirm(permanent || isPermanent)}
        >
          {permanent || isPermanent ? t("deleteConfirm.deletePermanent") : t("deleteConfirm.moveToTrash")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(DeleteConfirmDialog);
