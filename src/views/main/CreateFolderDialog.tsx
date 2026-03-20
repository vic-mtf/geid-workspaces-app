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
import { RootState } from "@/types";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateFolderDialog({ open, onClose, onCreated }: CreateFolderDialogProps) {
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
    if (!trimmed) { setError("Le nom ne peut pas être vide."); return; }
    if (/[/\\:*?"<>|]/.test(trimmed)) { setError("Nom invalide (caractères interdits)."); return; }

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
      if (res.status === 409) { setError("Un dossier avec ce nom existe déjà."); return; }
      if (!res.ok) { setError("Erreur lors de la création du dossier."); return; }
      onCreated();
      onClose();
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FolderOutlinedIcon color="primary" />
        Nouveau dossier
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Nom du dossier"
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
          Annuler
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={loading || !name.trim()}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
