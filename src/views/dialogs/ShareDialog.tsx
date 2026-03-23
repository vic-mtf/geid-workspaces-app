import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, TextField, Stack, IconButton, Chip, Box,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { useState } from "react";
import { useSnackbar } from "notistack";
import workspaceApi from "@/services/workspaceApi";

interface ShareDialogProps {
  open: boolean;
  fileId: string | null;
  fileName: string | null;
  onClose: () => void;
}

export default function ShareDialog({ open, fileId, fileName, onClose }: ShareDialogProps) {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleCreateLink = async () => {
    if (!fileId) return;
    setLoading(true);
    try {
      const res = await workspaceApi.createShareLink(fileId);
      const link = `${window.location.origin}/apps/workspaces/shared?link=${res.data.shareLink}`;
      setShareLink(link);
    } catch {
      enqueueSnackbar(<Typography>Impossible de créer le lien de partage</Typography>, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      enqueueSnackbar(<Typography>Lien copié dans le presse-papiers</Typography>, { variant: "success" });
    });
  };

  const handleClose = () => {
    setShareLink(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: (theme: any) =>
              theme.palette.background.paper + theme.customOptions.opacity,
            backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
          },
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontSize={18}>Partager</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {fileName?.replace(/_/gi, " ")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {!shareLink ? (
            <Button
              variant="outlined"
              startIcon={<LinkRoundedIcon />}
              onClick={handleCreateLink}
              disabled={loading}
            >
              Générer un lien de partage
            </Button>
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Lien de partage
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  value={shareLink}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <IconButton onClick={handleCopyLink} title="Copier le lien">
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Chip
                label="Lecture seule"
                size="small"
                color="info"
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
