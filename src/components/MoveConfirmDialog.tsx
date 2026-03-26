import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  fileName: string;
  folderName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const MoveConfirmDialog = React.memo(function MoveConfirmDialog({
  open,
  fileName,
  folderName,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" fontSize={18}>
          {t("dragDrop.moveConfirmTitle")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {t("dragDrop.moveConfirmMessage", {
            fileName: fileName.replace(/_/g, " "),
            folderName: folderName.replace(/_/g, " "),
          })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="contained" onClick={onConfirm}>{t("common.confirm")}</Button>
      </DialogActions>
    </Dialog>
  );
});

export default MoveConfirmDialog;
