import React, { useState, useCallback, useMemo, useRef } from "react";
import { Box, Typography, IconButton, Stack, Skeleton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { useTranslation } from "react-i18next";
import { FileItem } from "@/types";
import useAdaptiveThumbnail from "@/hooks/useAdaptiveThumbnail";
import getFileInfos from "@/utils/getFileInfos";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import optionLocalDate from "@/utils/optionLocalDate";
import capStr from "@/utils/capStr";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";
import fileExtensionBase from "@/utils/fileExtensionBase";

interface FileDetailPanelProps {
  file: FileItem | null;
  onClose: () => void;
  onAction: (action: string, file: FileItem) => void;
}

const FileDetailPanel = React.memo(function FileDetailPanel({ file, onClose, onAction }: FileDetailPanelProps) {
  const { t } = useTranslation();

  // Détecter le type de fichier pour savoir si on affiche un thumbnail
  const ext = useMemo(() => getFileExtension(file?.name ?? "")?.toLowerCase() ?? "", [file?.name]);
  const fileType = useMemo(() => {
    if (!ext) return null;
    return fileExtensionBase.find(({ exts }) => exts.includes(ext))?.type ?? null;
  }, [ext]);
  // Tous les types de fichiers peuvent avoir un thumbnail via le microservice
  const showThumb = !file?.isDirectory && !!file?.url;

  // Thumbnail progressif low → medium → high
  const thumbFileUrl = showThumb ? file!.url : null;
  const { src: thumbUrl, loading: thumbLoading, isBlurred } = useAdaptiveThumbnail(thumbFileUrl);

  const info = useMemo(() => file?.name ? getFileInfos({ name: file.name }) : null, [file?.name]);
  const size = useMemo(() => file?.size ? normaliseOctetSize(file.size) : "-", [file?.size]);
  const date = useMemo(() => file?.createdAt ? capStr(new Date(file.createdAt).toLocaleDateString(undefined, optionLocalDate)) : "-", [file?.createdAt]);

  const act = useCallback((a: string) => { if (file) onAction(a, file); }, [file, onAction]);

  // Pan-on-hover cover
  const [panY, setPanY] = useState("center");
  const coverRef = useRef<HTMLDivElement>(null);
  const handleCoverMove = useCallback((e: React.MouseEvent) => {
    const rect = coverRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPanY(`${Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)))}%`);
  }, []);
  const handleCoverLeave = useCallback(() => setPanY("center"), []);

  if (!file) return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Typography variant="body2" color="text.secondary" textAlign="center">{t("detail.noSelection")}</Typography>
    </Box>
  );

  const actions = [
    { key: "open", tip: t("common.open"), icon: <OpenInNewIcon fontSize="small" /> },
    { key: "download", tip: t("common.download"), icon: <DownloadIcon fontSize="small" /> },
    { key: "share", tip: t("common.share"), icon: <ShareIcon fontSize="small" /> },
    { key: "move", tip: t("common.move"), icon: <DriveFileMoveOutlinedIcon fontSize="small" /> },
    { key: "delete", tip: t("common.delete"), icon: <DeleteOutlinedIcon fontSize="small" />, color: "error" as const },
    { key: "archive", tip: t("archives.sendToArchives"), icon: <ArchiveOutlinedIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ height: "100%", overflow: "auto", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="body2" fontWeight="bold" noWrap sx={{ flex: 1 }}>
          {file.name || ""}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Stack>

      {/* Cover thumbnail — pan on hover, chargement progressif */}
      {!file.isDirectory && (
        <Box ref={coverRef} onMouseMove={handleCoverMove} onMouseLeave={handleCoverLeave}
          sx={{ width: "100%", height: 160, position: "relative", overflow: "hidden", bgcolor: "action.hover", flexShrink: 0, cursor: thumbUrl ? "crosshair" : "default" }}>
          {thumbLoading && !thumbUrl ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : thumbUrl ? (
            <>
              <Box component="img" src={thumbUrl} alt={file.name} draggable={false} sx={{
                width: "100%", height: "100%", objectFit: "cover",
                objectPosition: `center ${panY}`,
                transition: panY === "center" ? "object-position 0.4s ease" : "none",
                filter: isBlurred ? "blur(3px)" : "none",
                pointerEvents: "none",
              }} />
              {/* Play overlay pour les vidéos */}
              {fileType === "video" && (
                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <Box sx={{ bgcolor: "rgba(0,0,0,0.45)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
                    <PlayArrowRoundedIcon sx={{ color: "common.white", fontSize: 24 }} />
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileTypeIcon extension={ext || "txt"} size={48} />
            </Box>
          )}
        </Box>
      )}

      {/* Info rows */}
      <Stack spacing={0.5} sx={{ px: 1.5, py: 1 }}>
        <Row label={t("detail.type")} value={info?.docType || file.type || "-"} />
        <Row label={t("detail.size")} value={size} />
        <Row label={t("detail.created")} value={date} />
        {file.currentPath && <Row label={t("detail.path")} value={file.currentPath} />}
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={0.5} sx={{ px: 1.5, py: 1, borderTop: 1, borderColor: "divider", flexWrap: "wrap" }}>
        {actions.map((a) => (
          <Tooltip key={a.key} title={a.tip} arrow>
            <IconButton size="small" color={a.color || "default"} onClick={() => act(a.key)}>
              {a.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50, flexShrink: 0 }}>{label}</Typography>
      <Typography variant="caption" sx={{ wordBreak: "break-all" }}>{value}</Typography>
    </Box>
  );
}

export default FileDetailPanel;
