import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Chip,
  Button,
  TextField,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ShareIcon from "@mui/icons-material/Share";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { FileItem, RootState } from "@/types";
import getFileInfos from "@/utils/getFileInfos";
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import optionLocalDate from "@/utils/optionLocalDate";
import capStr from "@/utils/capStr";

interface FileDetailPanelProps {
  file: FileItem | null;
  onClose: () => void;
  onAction: (action: string, file: FileItem) => void;
}

const FileDetailPanel = React.memo(function FileDetailPanel({
  file,
  onClose,
  onAction,
}: FileDetailPanelProps) {
  const { t } = useTranslation();
  const user = useSelector((store: RootState) => store.user);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Fetch thumbnail when file changes
  useEffect(() => {
    setThumbnailUrl(null);
    setIsRenaming(false);
    if (!file || file.isDirectory || !file.url) return;

    let cancelled = false;
    setThumbnailLoading(true);

    fetch(file.url, {
      headers: { Authorization: `Bearer ${user?.token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        // Only show preview for images
        if (blob.type.startsWith("image/")) {
          setThumbnailUrl(URL.createObjectURL(blob));
        }
      })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!cancelled) setThumbnailLoading(false); });

    return () => {
      cancelled = true;
      setThumbnailLoading(false);
    };
  }, [file?.name, file?.url, file?.isDirectory, user?.token]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
  }, [thumbnailUrl]);

  const fileInfo = useMemo(() => {
    if (!file?.name) return null;
    return getFileInfos({ name: file.name });
  }, [file?.name]);

  const extension = useMemo(() => {
    if (!file?.name) return "";
    return getFileExtension(file.name) || "";
  }, [file?.name]);

  const formattedSize = useMemo(() => {
    if (!file?.size) return "-";
    return normaliseOctetSize(file.size);
  }, [file?.size]);

  const formattedDate = useMemo(() => {
    if (!file?.createdAt) return "-";
    return capStr(new Date(file.createdAt).toLocaleDateString(undefined, optionLocalDate));
  }, [file?.createdAt]);

  const handleAction = useCallback(
    (action: string) => {
      if (file) onAction(action, file);
    },
    [file, onAction]
  );

  const handleRenameStart = useCallback(() => {
    setRenameValue(file?.name || "");
    setIsRenaming(true);
  }, [file?.name]);

  const handleRenameConfirm = useCallback(() => {
    const newName = renameValue.trim();
    setIsRenaming(false);
    if (!newName || newName === file?.name) return;
    if (file) onAction("rename", { ...file, newName });
  }, [renameValue, file, onAction]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleRenameConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsRenaming(false);
      }
    },
    [handleRenameConfirm]
  );

  if (!file) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t("detail.noSelection")}
        </Typography>
      </Box>
    );
  }

  const actions = [
    { key: "open", label: t("common.open"), icon: <OpenInNewIcon fontSize="small" /> },
    { key: "download", label: t("common.download"), icon: <DownloadIcon fontSize="small" /> },
    { key: "rename", label: t("common.rename"), icon: <EditOutlinedIcon fontSize="small" />, onClick: handleRenameStart },
    { key: "share", label: t("common.share"), icon: <ShareIcon fontSize="small" /> },
    { key: "move", label: t("common.move"), icon: <DriveFileMoveOutlinedIcon fontSize="small" /> },
    { key: "copy", label: t("common.copy"), icon: <ContentCopyIcon fontSize="small" /> },
    { key: "delete", label: t("common.delete"), icon: <DeleteOutlinedIcon fontSize="small" />, color: "error" as const },
    { key: "archive", label: t("archives.sendToArchives"), icon: <ArchiveOutlinedIcon fontSize="small" /> },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ flex: 1 }}>
          {t("detail.title")}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider />

      {/* Thumbnail preview */}
      {!file.isDirectory && (
        <Box sx={{ textAlign: "center" }}>
          {thumbnailLoading ? (
            <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 1 }} />
          ) : thumbnailUrl ? (
            <Box
              component="img"
              src={thumbnailUrl}
              alt={file.name}
              sx={{
                maxWidth: "100%",
                maxHeight: 200,
                borderRadius: 1,
                objectFit: "contain",
              }}
            />
          ) : (
            fileInfo?.icon && (
              <Box
                component="img"
                src={fileInfo.icon}
                alt={file.name}
                sx={{ height: 64, width: 64, mx: "auto" }}
              />
            )
          )}
        </Box>
      )}

      <Divider />

      {/* File info */}
      <Stack spacing={1}>
        {/* Name — editable inline */}
        <InfoRow
          label={t("detail.name")}
          value={
            isRenaming ? (
              <TextField
                autoFocus
                size="small"
                variant="standard"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={handleRenameConfirm}
                InputProps={{ style: { fontSize: 13 } }}
                fullWidth
              />
            ) : (
              <Typography
                variant="body2"
                sx={{
                  cursor: "pointer",
                  wordBreak: "break-all",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={handleRenameStart}
              >
                {(file.name || "").replace(/_/gi, " ")}
              </Typography>
            )
          }
        />
        <InfoRow label={t("detail.type")} value={fileInfo?.docType || file.type || "-"} />
        <InfoRow label={t("detail.extension")} value={extension.toUpperCase() || "-"} />
        <InfoRow label={t("detail.size")} value={formattedSize} />
        <InfoRow label={t("detail.created")} value={formattedDate} />
        <InfoRow label={t("detail.modified")} value={formattedDate} />
        {file.currentPath && (
          <InfoRow label={t("detail.path")} value={file.currentPath} />
        )}
      </Stack>

      <Divider />

      {/* Actions */}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 0.5 }}>
        {t("detail.actions")}
      </Typography>
      <Stack spacing={0.5}>
        {actions.map((action) => (
          <Button
            key={action.key}
            size="small"
            startIcon={action.icon}
            color={action.color || "inherit"}
            sx={{ justifyContent: "flex-start", textTransform: "none", px: 1 }}
            onClick={() => (action.onClick ? action.onClick() : handleAction(action.key))}
          >
            {action.label}
          </Button>
        ))}
      </Stack>

      <Divider />

      {/* Tags */}
      <Typography variant="subtitle2" fontWeight="bold">
        <LabelOutlinedIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
        {t("detail.tags")}
      </Typography>
      {file.tags && file.tags.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {file.tags.map((tag: string, i: number) => (
            <Chip key={i} label={tag} size="small" />
          ))}
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          {t("detail.noTags")}
        </Typography>
      )}
    </Box>
  );
});

/** Small helper — label + value row */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {typeof value === "string" ? (
        <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  );
}

export default FileDetailPanel;
