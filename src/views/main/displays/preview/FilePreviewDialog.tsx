import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import { RootState } from "@/types";

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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<PreviewFile | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingBlob, setLoadingBlob] = useState(false);
  const { token } = useSelector((store: RootState) => store.user);

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

  // Fetch file content with auth and create blob URL
  useEffect(() => {
    if (!file?.url || !open) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }
    setLoadingBlob(true);
    fetch(file.url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        setBlobUrl(null);
      })
      .finally(() => setLoadingBlob(false));

    return () => {
      // Cleanup will happen on next effect run
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.url, open, token]);

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
  };

  const handleDownload = () => {
    if (!file?.url) return;
    fetch(file.url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name ?? t("preview.file");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  const ext = getFileExtension(file?.name ?? "");
  const category = getCategory(ext);
  const previewSrc = blobUrl || "";

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
          {file?.name ?? ""}
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
        {loadingBlob && (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
          </Box>
        )}

        {!loadingBlob && category === "image" && (
          <Box
            component="img"
            src={previewSrc}
            alt={file?.name ?? ""}
            sx={{
              maxHeight: "80vh",
              maxWidth: "100%",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        )}

        {!loadingBlob && category === "video" && (
          <Box
            component="video"
            controls
            src={previewSrc}
            sx={{ maxHeight: "80vh", maxWidth: "100%", borderRadius: 1 }}
          />
        )}

        {!loadingBlob && category === "audio" && (
          <Box
            component="audio"
            controls
            src={previewSrc}
            sx={{ width: "100%", maxWidth: 500 }}
          />
        )}

        {!loadingBlob && category === "pdf" && (
          <Box
            component="iframe"
            src={previewSrc}
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
              {file?.name ?? ""}
            </Typography>
            {file?.size != null && (
              <Typography variant="body2" color="text.secondary">
                {t("preview.size", { size: normaliseOctetSize(file.size) })}
              </Typography>
            )}
            {file?.type && (
              <Typography variant="body2" color="text.secondary">
                {t("preview.type", { type: file.type })}
              </Typography>
            )}
            <Typography variant="body2" color="text.disabled">
              {t("preview.noPreview")}
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
          {t("common.download")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
