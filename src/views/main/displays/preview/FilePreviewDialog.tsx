import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "avif"];
const VIDEO_EXTS = ["mp4", "webm", "mov"];
const AUDIO_EXTS = ["mp3", "wav", "ogg"];
const PDF_EXTS = ["pdf"];

function getCategory(ext: string | null): "image" | "video" | "audio" | "pdf" | "other" {
  const e = (ext ?? "").toLowerCase();
  if (IMAGE_EXTS.includes(e)) return "image";
  if (VIDEO_EXTS.includes(e)) return "video";
  if (AUDIO_EXTS.includes(e)) return "audio";
  if (PDF_EXTS.includes(e)) return "pdf";
  return "other";
}

interface PreviewFile {
  name?: string;
  url?: string;
  size?: number;
  type?: string;
}

export default function FilePreviewDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<PreviewFile | null>(null);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = (event: any) => {
      const f = event.detail?.file;
      if (f) {
        setFile(f);
        setOpen(true);
      }
    };
    root?.addEventListener("_open_file_preview", handler);
    return () => root?.removeEventListener("_open_file_preview", handler);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setFile(null);
  };

  const handleDownload = () => {
    if (!file?.url) return;
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name ?? "fichier";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const ext = getFileExtension(file?.name ?? "");
  const category = getCategory(ext);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: { minHeight: category === "other" ? "auto" : "60vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
        }}
      >
        <Typography
          variant="h6"
          noWrap
          sx={{ flex: 1, mr: 1, fontSize: { xs: "0.95rem", sm: "1.25rem" } }}
        >
          {(file?.name ?? "").replace(/_/g, " ")}
        </Typography>
        <IconButton onClick={handleClose} edge="end">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          overflow: "auto",
        }}
      >
        {category === "image" && (
          <Box
            component="img"
            src={file?.url}
            alt={file?.name ?? ""}
            sx={{
              maxHeight: "80vh",
              maxWidth: "100%",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        )}

        {category === "video" && (
          <Box
            component="video"
            controls
            src={file?.url}
            sx={{ maxHeight: "80vh", maxWidth: "100%", borderRadius: 1 }}
          />
        )}

        {category === "audio" && (
          <Box
            component="audio"
            controls
            src={file?.url}
            sx={{ width: "100%", maxWidth: 500 }}
          />
        )}

        {category === "pdf" && (
          <Box
            component="iframe"
            src={file?.url}
            title={file?.name ?? ""}
            sx={{
              width: "100%",
              height: "80vh",
              border: "none",
              borderRadius: 1,
            }}
          />
        )}

        {category === "other" && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            py={4}
          >
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 64, opacity: 0.4 }} />
            <Typography variant="h6">
              {(file?.name ?? "").replace(/_/g, " ")}
            </Typography>
            {file?.size != null && (
              <Typography variant="body2" color="text.secondary">
                Taille : {normaliseOctetSize(file.size)}
              </Typography>
            )}
            {file?.type && (
              <Typography variant="body2" color="text.secondary">
                Type : {file.type}
              </Typography>
            )}
            <Typography variant="body2" color="text.disabled">
              L'apercu n'est pas disponible pour ce type de fichier
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadRoundedIcon />}
          onClick={handleDownload}
        >
          Télécharger
        </Button>
      </DialogActions>
    </Dialog>
  );
}
