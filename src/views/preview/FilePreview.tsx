import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box, Stack } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import getFileExtension from "@/utils/getFileExtension";

interface FilePreviewProps {
  open: boolean;
  file: { name?: string; url?: string; type?: string } | null;
  onClose: () => void;
}

const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
const videoExts = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
const audioExts = ["mp3", "wav", "ogg", "flac", "aac"];
const pdfExts = ["pdf"];

export default function FilePreview({ open, file, onClose }: FilePreviewProps) {
  if (!file) return null;

  const ext = getFileExtension(file.name ?? "")?.toLowerCase() ?? "";
  const isImage = imageExts.includes(ext);
  const isVideo = videoExts.includes(ext);
  const isAudio = audioExts.includes(ext);
  const isPdf = pdfExts.includes(ext);

  const handleDownload = () => {
    if (!file.url) return;
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name ?? "fichier";
    link.target = "_blank";
    link.click();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: "85vh", overflow: "hidden" } }}
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
      <DialogTitle sx={{ display: "flex", alignItems: "center", py: 1 }}>
        <Typography variant="body1" fontWeight="bold" noWrap flex={1}>
          {file.name?.replace(/_/gi, " ")}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={handleDownload} title="Télécharger">
            <FileDownloadOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose} title="Fermer">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 0, overflow: "auto" }}>
        {isImage && (
          <Box
            component="img"
            src={file.url}
            alt={file.name}
            sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        )}
        {isVideo && (
          <Box
            component="video"
            controls
            src={file.url}
            sx={{ width: "100%", maxHeight: "100%" }}
          />
        )}
        {isAudio && (
          <Box p={4}>
            <audio controls src={file.url} style={{ width: "100%", minWidth: 300 }}>
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          </Box>
        )}
        {isPdf && (
          <Box
            component="iframe"
            src={file.url}
            sx={{ width: "100%", height: "100%", border: "none" }}
            title={file.name}
          />
        )}
        {!isImage && !isVideo && !isAudio && !isPdf && (
          <Box textAlign="center" p={4}>
            <Typography color="text.secondary" gutterBottom>
              Aperçu non disponible pour ce type de fichier
            </Typography>
            <Typography
              component="a"
              href={file.url}
              target="_blank"
              color="primary"
              sx={{ textDecoration: "underline", cursor: "pointer" }}
            >
              Ouvrir dans un nouvel onglet
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
