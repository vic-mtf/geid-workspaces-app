/**
 * ListView — Affichage en liste des fichiers workspace.
 *
 * Table propre avec Virtuoso, checkbox toujours visible,
 * select-all en header, mode compact optionnel, renommage inline.
 *
 * Pattern : parent 100% relatif → enfant absolu inset 0, flex column
 * avec header sticky + Virtuoso flex: 1.
 */

import {
  Avatar,
  Box,
  Checkbox,
  CircularProgress,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { Virtuoso } from "react-virtuoso";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import optionLocalDate from "@/utils/optionLocalDate";
import fileExtensionBase from "@/utils/fileExtensionBase";
import WrapperContent from "@/views/main/displays/thumbnail/WrapperContent";
import MoveConfirmDialog from "@/components/MoveConfirmDialog";
import AdaptiveSkeleton from "@/components/AdaptiveSkeleton";
import useDragDropMove from "@/hooks/useDragDropMove";
import FileTypeIcon from "@/components/FileTypeIcon";
import { FileItem, RootState } from "@/types";

interface ListViewProps {
  data?: FileItem[];
  loading?: boolean;
  selectedFiles: Set<string>;
  onToggleSelect: (name: string) => void;
  allSelected?: boolean;
  onSelectAll?: () => void;
  compact?: boolean;
  busyFiles?: Set<string>;
}

// Miniature en mode liste pour les images
const ListThumbnail = React.memo(function ListThumbnail({ url }: { url?: string }) {
  const token = useSelector((store: RootState) => store.user.token);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let revoked = false;
    const thumbUrl = url.replace("/file/", "/thumbnail/");
    fetch(thumbUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok && r.status !== 204 ? r.blob() : null))
      .then((b) => { if (b && !revoked) setSrc(URL.createObjectURL(b)); })
      .catch(() => {});
    return () => { revoked = true; };
  }, [url, token]);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  if (!src) return null;
  return (
    <Avatar
      variant="rounded"
      src={src}
      imgProps={{ draggable: false }}
      sx={{ width: 28, height: 28, mr: -0.5, pointerEvents: "none" }}
    />
  );
});

export default function ListView({
  data: _data,
  loading,
  selectedFiles,
  onToggleSelect,
  allSelected = false,
  onSelectAll,
  compact = false,
  busyFiles = new Set<string>(),
}: ListViewProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [findName, setFindName] = useState("");
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const user = useSelector((store: RootState) => store.user);

  const rowHeight = compact ? 32 : 42;
  const fontSize = compact ? "0.75rem" : undefined;

  // Inline rename
  const [renamingFile, setRenamingFile] = useState<string | null>(null);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = (e: any) => { if (e.detail?.fileName) setRenamingFile(e.detail.fileName); };
    root?.addEventListener("_trigger_inline_rename", handler);
    return () => root?.removeEventListener("_trigger_inline_rename", handler);
  }, []);

  const getCurrentPath = useCallback(() => {
    const params = new URLSearchParams(search);
    const folderParam = params.get("folder") || "";
    return folderParam;
  }, [search, pathname]);

  // Drag & drop
  const { moveConfirm, dragOverFolder, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleConfirmMove, clearMoveConfirm } = useDragDropMove(getCurrentPath);

  const data = useMemo(
    () =>
      _data?.filter((item) => {
        if (findName?.trim() === "") return true;
        const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const normalizedSearch = norm(findName.trim());
        const normalizedName = norm(item?.name ?? "");
        const normalizedNameSpaced = norm((item?.name ?? "").replace(/_/g, " "));
        const words = normalizedSearch.split(/\s/).filter((w) => w.length > 0);
        return words.some((word) =>
          normalizedName.includes(word) || normalizedNameSpaced.includes(word)
        );
      }),
    [findName, _data]
  );

  useEffect(() => {
    const handleSearch = (event: any) => {
      const { value } = event.detail || { value: "" };
      setFindName(value);
    };
    const root = document.getElementById("root");
    root?.addEventListener("_search_data", handleSearch);
    return () => root?.removeEventListener("_search_data", handleSearch);
  });

  const handleFolderClick = useCallback((folderName: string) => {
    const params = new URLSearchParams(search);
    const currentFolder = params.get("folder") || "";
    const newFolder = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    navigate(`${pathname}?folder=${encodeURIComponent(newFolder)}`);
  }, [search, pathname, navigate]);

  const handleRenameConfirm = useCallback(async (oldName: string, newValue: string) => {
    setRenamingFile(null);
    const trimmed = newValue.trim();
    const hasDot = oldName.includes(".");
    const oldWithoutExt = hasDot ? oldName.substring(0, oldName.lastIndexOf(".")) : oldName;
    if (!trimmed || trimmed === oldWithoutExt) return;

    const path = getCurrentPath();
    const finalName = trimmed;

    try {
      const res = await fetch("/api/stuff/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ oldFilename: oldName, filename: finalName, path, userId: (user as any)?.id }),
      });
      if (!res.ok) throw new Error();
      enqueueSnackbar(t("files.fileRenamed"), { variant: "success" });
      document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
    } catch {
      enqueueSnackbar(t("files.fileRenameError"), { variant: "error" });
    }
  }, [getCurrentPath, user?.token, user, enqueueSnackbar, t]);

  // blankIcon supprimé — utilise FileTypeIcon

  const renderRow = (index: number) => {
    const file = data![index];
    if (!file) return null;
    const date = file.createdAt ? new Date(file.createdAt).toLocaleDateString("fr-FR", optionLocalDate) : "\u2014";
    const sizeStr = file.isDirectory
      ? (file.count != null ? `${file.count} élément${file.count > 1 ? "s" : ""}` : "\u2014")
      : (file.size ? normaliseOctetSize(file.size) : "\u2014");
    const ext = getFileExtension(file.name ?? "")?.toLowerCase() ?? "";
    const infos = file.isDirectory ? undefined : fileExtensionBase.find(({ exts }) => exts.includes(ext));
    const isImage = infos?.type === "image";
    const isSelected = selectedFiles.has(file.name ?? "");
    const isBusy = busyFiles.has(file.name ?? "");
    const isDragOverThis = file.isDirectory && dragOverFolder === file.name;
    const isRenaming = renamingFile === file.name;

    const nameWithoutExt = (() => {
      const n = file.name || "";
      const dot = n.lastIndexOf(".");
      return dot > 0 && !file.isDirectory ? n.substring(0, dot) : n;
    })();

    return (
      <Box
        draggable={!isBusy}
        onDragStart={!isBusy ? (e: React.DragEvent) => handleDragStart(e, file.name ?? "", (file as any)._id) : undefined}
        onDragOver={file.isDirectory && !isBusy ? (e: React.DragEvent) => handleDragOver(e, file.name ?? "") : undefined}
        onDragLeave={file.isDirectory && !isBusy ? handleDragLeave : undefined}
        onDrop={file.isDirectory && !isBusy ? (e: React.DragEvent) => handleDrop(e, file.name ?? "") : undefined}
        sx={{
          position: "relative",
          border: isDragOverThis ? 2 : 0,
          borderColor: "primary.main",
          borderRadius: 1,
          transition: "all 0.15s",
          ...(isSelected && { bgcolor: "action.selected" }),
          ...(isBusy && { opacity: 0.5, pointerEvents: "none" }),
          "&:hover": { bgcolor: isSelected ? "action.selected" : "action.hover" },
        }}
      >
        {isBusy && (
          <Box sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", zIndex: 3 }}>
            <CircularProgress size={16} />
          </Box>
        )}
        <WrapperContent
          {...(infos || {})}
          {...file}
          isDirectory={file.isDirectory}
          onFolderClick={!isBusy ? handleFolderClick : undefined}
          onDoubleClickName={!isBusy ? () => setRenamingFile(file.name ?? "") : undefined}
        >
          <Box
            display="flex"
            alignItems="center"
            width="100%"
            px={1}
            sx={{
              height: rowHeight,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            {/* Checkbox */}
            <Box width={36} flexShrink={0} display="flex" alignItems="center" justifyContent="center">
              <Checkbox
                size="small"
                checked={isSelected}
                onClick={(e) => { e.stopPropagation(); onToggleSelect(file.name ?? ""); }}
                sx={{ p: 0 }}
              />
            </Box>
            {/* Icon */}
            <Box width={36} height={28} flexShrink={0} display="flex" alignItems="center" justifyContent="center">
              {file.isDirectory ? (
                <FolderRoundedIcon sx={{ color: file.color || "warning.main", fontSize: 22 }} />
              ) : isImage ? (
                <ListThumbnail url={file.url} />
              ) : (
                <FileTypeIcon extension={ext || "txt"} size={22} />
              )}
            </Box>
            {/* Favori */}
            {file.isFavorite && (
              <Box sx={{ flexShrink: 0, mr: 0.5 }}>
                <StarRoundedIcon sx={{ fontSize: 14, color: "warning.main" }} />
              </Box>
            )}
            {/* Name */}
            <Box flex={1} minWidth={0} pl={0.5}>
              {isRenaming ? (
                <TextField
                  autoFocus
                  size="small"
                  variant="standard"
                  defaultValue={nameWithoutExt}
                  onBlur={(e) => handleRenameConfirm(file.name || "", (e.target as HTMLInputElement).value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameConfirm(file.name || "", (e.currentTarget as HTMLInputElement).value);
                    if (e.key === "Escape") setRenamingFile(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  InputProps={{ disableUnderline: false }}
                  inputProps={{ style: { fontSize: 13, padding: "2px 4px" } }}
                  sx={{ maxWidth: 300 }}
                />
              ) : (
                <Typography variant="body2" noWrap sx={{ fontSize, maxWidth: { xs: 150, sm: 250, md: 400, lg: 500 } }}>
                  {file.name ?? ""}
                </Typography>
              )}
            </Box>
            {/* Date */}
            <Box width={160} flexShrink={0} display={{ xs: "none", sm: "block" }}>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize }}>{date}</Typography>
            </Box>
            {/* Size */}
            {!isSmall && (
              <Box width={90} flexShrink={0}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize }}>{sizeStr}</Typography>
              </Box>
            )}
          </Box>
        </WrapperContent>
      </Box>
    );
  };

  if (loading) return <AdaptiveSkeleton />;

  if (!data || data.length === 0) {
    return (
      <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
          <Typography color="text.secondary" fontWeight="bold">{t("files.emptySpace")}</Typography>
          <Typography variant="body2" color="text.disabled">{t("files.emptySpaceHint")}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", px: 0.5 }}>
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            px={1}
            sx={{
              height: rowHeight,
              bgcolor: "background.paper",
              borderBottom: 1,
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Box width={36} flexShrink={0} display="flex" alignItems="center" justifyContent="center">
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={selectedFiles.size > 0 && !allSelected}
                onChange={onSelectAll}
                sx={{ p: 0 }}
              />
            </Box>
            <Box width={36} flexShrink={0} />
            <Box flex={1} minWidth={0} pl={0.5}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">{t("list.name")}</Typography>
            </Box>
            <Box width={160} flexShrink={0} display={{ xs: "none", sm: "block" }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">{t("list.modifiedDate")}</Typography>
            </Box>
            {!isSmall && (
              <Box width={90} flexShrink={0}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">{t("list.size")}</Typography>
              </Box>
            )}
          </Box>

          {/* Virtualized rows */}
          <Virtuoso
            totalCount={data!.length}
            itemContent={renderRow}
            overscan={300}
            style={{ flex: 1 }}
          />
        </Box>
      </Box>

      <MoveConfirmDialog
        open={!!moveConfirm}
        fileName={moveConfirm?.fileName ?? ""}
        folderName={moveConfirm?.folderName ?? ""}
        onConfirm={handleConfirmMove}
        onClose={clearMoveConfirm}
      />
    </>
  );
}
