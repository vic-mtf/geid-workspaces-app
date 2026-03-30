import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, CircularProgress, Box, Typography,
} from "@mui/material";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RootState } from "@/types";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function CreateFolderDialog({ open, onClose, onCreated }: CreateFolderDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = useSelector((store: RootState) => store.user.token);
  const { search } = useLocation();

  const currentPath = new URLSearchParams(search).get("folder") || "";

  useEffect(() => {
    if (open) { setName(""); setError(""); }
  }, [open]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError(t("files.folderNameEmpty")); return; }
    if (/[/\\:*?"<>|]/.test(trimmed)) { setError(t("files.folderNameInvalid")); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stuff/workspace/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ path: currentPath, folderName: trimmed }),
      });
      if (res.status === 409) { setError(t("files.folderNameExists")); return; }
      if (!res.ok) { setError(t("files.folderCreateError")); return; }
      onCreated();
      onClose();
    } catch {
      setError(t("files.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      BackdropProps={{
        sx: {
          bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
          backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
        },
      }}
      PaperProps={{ sx: { border: 1, borderColor: "divider" } }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" fontSize={16}>
            {t("files.newFolder")}
          </Typography>
          {currentPath && (
            <Typography variant="caption" color="text.secondary">
              {t("detail.path")}: {currentPath}
            </Typography>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label={t("files.folderName")}
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          error={!!error}
          helperText={error}
          size="small"
          sx={{ mt: 1, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "divider" } } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={loading || !name.trim()}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <CreateNewFolderOutlinedIcon />}
          sx={{ textTransform: "none" }}
        >
          {t("common.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(CreateFolderDialog);
