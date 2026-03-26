import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Box, Typography, IconButton, Stack, Skeleton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { FileItem, RootState } from "@/types";
import getFileInfos from "@/utils/getFileInfos";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import optionLocalDate from "@/utils/optionLocalDate";
import capStr from "@/utils/capStr";

interface FileDetailPanelProps {
  file: FileItem | null;
  onClose: () => void;
  onAction: (action: string, file: FileItem) => void;
}

const FileDetailPanel = React.memo(function FileDetailPanel({ file, onClose, onAction }: FileDetailPanelProps) {
  const { t } = useTranslation();
  const token = useSelector((store: RootState) => store.user.token);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [thumbLoading, setThumbLoading] = useState(false);

  useEffect(() => {
    setThumbUrl(null);
    if (!file || file.isDirectory || !file.url) return;
    let cancelled = false;
    setThumbLoading(true);
    fetch(file.url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (!r.ok) throw new Error(); return r.blob(); })
      .then((b) => { if (!cancelled && b.type.startsWith("image/")) setThumbUrl(URL.createObjectURL(b)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setThumbLoading(false); });
    return () => { cancelled = true; setThumbLoading(false); };
  }, [file?.name, file?.url, file?.isDirectory, token]);

  useEffect(() => () => { if (thumbUrl) URL.revokeObjectURL(thumbUrl); }, [thumbUrl]);

  const info = useMemo(() => file?.name ? getFileInfos({ name: file.name }) : null, [file?.name]);
  const size = useMemo(() => file?.size ? normaliseOctetSize(file.size) : "-", [file?.size]);
  const date = useMemo(() => file?.createdAt ? capStr(new Date(file.createdAt).toLocaleDateString(undefined, optionLocalDate)) : "-", [file?.createdAt]);

  const act = useCallback((a: string) => { if (file) onAction(a, file); }, [file, onAction]);

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
          {(file.name || "").replace(/_/g, " ")}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Stack>

      {/* Thumbnail */}
      {!file.isDirectory && (
        <Box sx={{ textAlign: "center", py: 1, px: 1 }}>
          {thumbLoading ? (
            <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 1 }} />
          ) : thumbUrl ? (
            <Box component="img" src={thumbUrl} alt={file.name} sx={{ maxWidth: "100%", maxHeight: 100, borderRadius: 1, objectFit: "contain" }} />
          ) : info?.icon ? (
            <Box component="img" src={info.icon} alt={file.name} sx={{ height: 36, width: 36, mx: "auto" }} />
          ) : null}
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
