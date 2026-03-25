import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RootState } from "@/types";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateFolderDialog({ open, onClose, onCreated }: CreateFolderDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = useSelector((store: RootState) => store.user.token);
  const { pathname, search } = useLocation();

  // Calcul du chemin courant (catégorie + sous-dossier éventuel)
  const currentPath = (() => {
    const params = new URLSearchParams(search);
    const folder = params.get("folder") || "";
    const cat = ["images", "videos", "others"].find((c) => pathname.includes(c)) ?? "documents";
    return folder ? `${cat}/${folder}` : cat;
  })();

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FolderOutlinedIcon color="primary" />
        {t("files.newFolder")}
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
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={loading || !name.trim()}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {t("common.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
