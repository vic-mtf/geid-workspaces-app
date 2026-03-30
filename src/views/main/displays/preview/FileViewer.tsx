/**
 * FileViewer — Visualiseur de fichiers plein ecran.
 *
 * Ecoute l'evenement _open_file_preview et affiche le fichier
 * dans le sous-viewer adapte (image, video, document, audio, inconnu).
 * Navigation par fleches clavier et boutons lateraux.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Box,
  Dialog,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ViewerTopBar from "@/views/main/displays/preview/components/ViewerTopBar";
import ImageViewer from "@/views/main/displays/preview/viewers/ImageViewer";
import VideoViewer from "@/views/main/displays/preview/viewers/VideoViewer";
import DocumentViewer from "@/views/main/displays/preview/viewers/DocumentViewer";
import AudioViewer from "@/views/main/displays/preview/viewers/AudioViewer";
import UnknownViewer from "@/views/main/displays/preview/viewers/UnknownViewer";
import getFileExtension from "@/utils/getFileExtension";
import { dataStore } from "@/redux/data";
import { RootState, FileItem } from "@/types";

// ── Extension categories ────────────────────────────────────────
const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"]);
const VIDEO_EXTS = new Set(["mp4", "webm", "mov", "avi", "mkv"]);
const DOCUMENT_EXTS = new Set(["pdf", "docx", "xlsx", "pptx", "doc", "xls", "ppt", "odt", "ods", "odp"]);
const AUDIO_EXTS = new Set(["mp3", "wav", "ogg", "flac"]);

type FileCategory = "image" | "video" | "document" | "audio" | "other";

function getCategory(ext: string): FileCategory {
  const e = ext.toLowerCase();
  if (IMAGE_EXTS.has(e)) return "image";
  if (VIDEO_EXTS.has(e)) return "video";
  if (DOCUMENT_EXTS.has(e)) return "document";
  if (AUDIO_EXTS.has(e)) return "audio";
  return "other";
}

export default function FileViewer() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { token } = useSelector((store: RootState) => store.user);

  const [open, setOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileItem | null>(null);
  const [filesList, setFilesList] = useState<FileItem[]>([]);
  const [hovered, setHovered] = useState(false);

  // Only non-directory files for navigation
  const navigableFiles = useMemo(
    () => filesList.filter((f) => !f.isDirectory),
    [filesList],
  );

  const currentIndex = useMemo(() => {
    if (!currentFile) return -1;
    return navigableFiles.findIndex(
      (f) => f.name === currentFile.name && f.url === currentFile.url,
    );
  }, [currentFile, navigableFiles]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < navigableFiles.length - 1;

  // ── Event listener ──────────────────────────────────────────
  useEffect(() => {
    const root = document.getElementById("root");
    const handler = (event: any) => {
      const f = event.detail?.file;
      if (!f) return;
      setCurrentFile(f);
      // Use provided files list, or fallback to dataStore.files
      const files = event.detail?.files || dataStore.files || [];
      setFilesList(files);
      setOpen(true);
    };
    root?.addEventListener("_open_file_preview", handler);
    return () => root?.removeEventListener("_open_file_preview", handler);
  }, []);

  // ── Navigation ──────────────────────────────────────────────
  const goTo = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev" && hasPrev) {
        setCurrentFile(navigableFiles[currentIndex - 1]);
      } else if (direction === "next" && hasNext) {
        setCurrentFile(navigableFiles[currentIndex + 1]);
      }
    },
    [currentIndex, hasPrev, hasNext, navigableFiles],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setCurrentFile(null);
    setFilesList([]);
  }, []);

  // ── Keyboard ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowLeft") goTo("prev");
      else if (e.key === "ArrowRight") goTo("next");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleClose, goTo]);

  // ── Download ────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!currentFile?.url) return;
    fetch(currentFile.url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = currentFile.name || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  }, [currentFile, token]);

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!currentFile?.name) return;
    const root = document.getElementById("root");
    root?.dispatchEvent(
      new CustomEvent("_confirm_delete", {
        detail: { fileNames: [currentFile.name], isDirectory: false },
      }),
    );
    handleClose();
  }, [currentFile, handleClose]);

  // ── Render viewer ───────────────────────────────────────────
  const ext = getFileExtension(currentFile?.name || "") || "";
  const category = getCategory(ext);

  const renderViewer = () => {
    if (!currentFile?.url && category !== "other") return null;
    const url = currentFile?.url || "";
    const name = currentFile?.name || "";

    switch (category) {
      case "image":
        return <ImageViewer fileUrl={url} filename={name} />;
      case "video":
        return <VideoViewer fileUrl={url} filename={name} />;
      case "document":
        return <DocumentViewer fileUrl={url} filename={name} extension={ext} />;
      case "audio":
        return <AudioViewer fileUrl={url} filename={name} />;
      default:
        return (
          <UnknownViewer
            filename={name}
            extension={ext}
            size={currentFile?.size}
            onDownload={handleDownload}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
          backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
          backgroundImage: "none",
        },
      }}
    >
      {/* Top bar */}
      <ViewerTopBar
        filename={currentFile?.name || ""}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onClose={handleClose}
        hovered={hovered}
      />

      {/* Main content area with hover detection */}
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          pt: 7, // space for top bar
          pb: 2,
          px: { xs: 1, sm: 2, md: 6 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Previous arrow */}
        {hasPrev && (
          <Tooltip title={t("viewer.previousFile")}>
            <IconButton
              onClick={() => goTo("prev")}
              sx={{
                position: "absolute",
                left: { xs: 4, md: 16 },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                color: "common.white",
                bgcolor: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                opacity: isMobile ? 0.8 : hovered ? 0.9 : 0,
                transition: "opacity 0.3s ease",
                "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
              }}
            >
              <ChevronLeftRoundedIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}

        {/* Viewer */}
        <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {renderViewer()}
        </Box>

        {/* Next arrow */}
        {hasNext && (
          <Tooltip title={t("viewer.nextFile")}>
            <IconButton
              onClick={() => goTo("next")}
              sx={{
                position: "absolute",
                right: { xs: 4, md: 16 },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                color: "common.white",
                bgcolor: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                opacity: isMobile ? 0.8 : hovered ? 0.9 : 0,
                transition: "opacity 0.3s ease",
                "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
              }}
            >
              <ChevronRightRoundedIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Dialog>
  );
}
