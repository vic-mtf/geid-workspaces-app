import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, CircularProgress, Box, Typography, IconButton, Tooltip,
} from "@mui/material";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import CircleIcon from "@mui/icons-material/Circle";
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
  const [color, setColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = useSelector((store: RootState) => store.user.token);
  const { search } = useLocation();

  const currentPath = new URLSearchParams(search).get("folder") || "";

  const COLORS = useMemo(() => [
    { label: t("colors.default"), value: null, hex: "#ed6c02" },
    { label: t("colors.blue"), value: "#1976d2", hex: "#1976d2" },
    { label: t("colors.green"), value: "#2e7d32", hex: "#2e7d32" },
    { label: t("colors.red"), value: "#d32f2f", hex: "#d32f2f" },
    { label: t("colors.purple"), value: "#7b1fa2", hex: "#7b1fa2" },
    { label: t("colors.orange"), value: "#e65100", hex: "#e65100" },
    { label: t("colors.teal"), value: "#00695c", hex: "#00695c" },
    { label: t("colors.pink"), value: "#c2185b", hex: "#c2185b" },
  ], [t]);

  useEffect(() => {
    if (open) { setName(""); setColor(null); setError(""); }
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
        body: JSON.stringify({ path: currentPath, folderName: trimmed, color }),
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

  const activeColor = color || "#ed6c02";

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
        <Box display="flex" alignItems="center" gap={1}>
          <FolderRoundedIcon sx={{ color: activeColor, fontSize: 28 }} />
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
        <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
            {t("colors.title")}
          </Typography>
          {COLORS.map((c) => (
            <Tooltip key={c.hex} title={c.label} arrow>
              <IconButton
                size="small"
                onClick={() => setColor(c.value)}
                sx={{
                  p: 0.3,
                  border: (c.value === color || (!color && !c.value)) ? 2 : 2,
                  borderColor: (c.value === color || (!color && !c.value)) ? c.hex : "transparent",
                  borderRadius: "50%",
                }}
              >
                <CircleIcon sx={{ color: c.hex, fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          ))}
        </Box>
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
