/**
 * ListView — Affichage en liste des fichiers workspace.
 *
 * Table propre avec Virtuoso, checkbox toujours visible,
 * select-all en header, mode compact optionnel.
 */

import {
  Avatar,
  Box,
  Checkbox,
  Skeleton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import optionLocalDate from "@/utils/optionLocalDate";
import fileExtensionBase from "@/utils/fileExtensionBase";
import WrapperContent from "@/views/main/displays/thumbnail/WrapperContent";
import { FileItem, RootState } from "@/types";

interface ListViewProps {
  data?: FileItem[];
  loading?: boolean;
  selectedFiles: Set<string>;
  onToggleSelect: (name: string) => void;
  allSelected?: boolean;
  onSelectAll?: () => void;
  compact?: boolean;
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
      sx={{ width: 28, height: 28, mr: -0.5 }}
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

  // Drag & drop move confirmation
  const [moveConfirm, setMoveConfirm] = useState<{ fileName: string; folderName: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const data = useMemo(
    () =>
      _data?.filter((item) => {
        if (findName?.trim() === "") return true;
        const words = findName.split(/\s/).filter((w: string) => w?.trim());
        return words.some((word: string) => {
          const _word = word.toLowerCase().trim();
          return (
            (_word.length > 2 && (item?.name?.toLowerCase() ?? "").includes(_word)) ||
            (item?.name?.replace(/_/gi, " ").toLowerCase() ?? "").includes(findName?.toLowerCase()?.trim() ?? "")
          );
        });
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

  // --- Drag & Drop ---
  const getCurrentPath = useCallback(() => {
    const params = new URLSearchParams(search);
    const folderParam = params.get("folder") || "";
    const cat = ["images", "videos", "others"].find((c) => pathname.includes(c)) ?? "documents";
    return folderParam ? `${cat}/${folderParam}` : cat;
  }, [search, pathname]);

  const handleDragStart = useCallback((e: React.DragEvent, fileName: string) => {
    e.dataTransfer.setData("fileName", fileName);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    setDragOverFolder(folderName);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverFolder(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    setDragOverFolder(null);
    const fileName = e.dataTransfer.getData("fileName");
    if (fileName && fileName !== folderName) {
      setMoveConfirm({ fileName, folderName });
    }
  }, []);

  const handleConfirmMove = useCallback(async () => {
    if (!moveConfirm) return;
    const { fileName, folderName } = moveConfirm;
    const path = getCurrentPath();
    setMoveConfirm(null);
    try {
      const res = await fetch("/api/stuff/workspace/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ source: `${path}/${fileName}`, destination: `${path}/${folderName}/${fileName}` }),
      });
      if (!res.ok) throw new Error();
      enqueueSnackbar(t("dragDrop.moveSuccess"), { variant: "success" });
      document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
    } catch {
      enqueueSnackbar(t("dragDrop.moveError"), { variant: "error" });
    }
  }, [moveConfirm, getCurrentPath, user?.token, enqueueSnackbar, t]);

  if (loading) {
    return (
      <Box sx={{ height: "100%", overflow: "auto", px: 2, pt: 1 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rounded" height={rowHeight} sx={{ borderRadius: 1, mb: 0.5 }} />
        ))}
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} height="100%" py={6} gap={1}>
        <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
        <Typography color="text.secondary" fontWeight="bold">{t("files.emptySpace")}</Typography>
        <Typography variant="body2" color="text.disabled">{t("files.emptySpaceHint")}</Typography>
      </Box>
    );
  }

  const blankIcon = new URL("../../../../../node_modules/file-icon-vectors/dist/icons/vivid/blank.svg", import.meta.url).href;

  const renderRow = (index: number) => {
    const file = data![index];
    if (!file) return null;
    const date = file.createdAt ? new Date(file.createdAt).toLocaleDateString("fr-FR", optionLocalDate) : "\u2014";
    const sizeStr = file.isDirectory || !file.size ? "\u2014" : normaliseOctetSize(file.size);
    const ext = getFileExtension(file.name ?? "")?.toLowerCase() ?? "";
    const infos = file.isDirectory ? undefined : fileExtensionBase.find(({ exts }) => exts.includes(ext));
    const isImage = infos?.type === "image";
    const isSelected = selectedFiles.has(file.name ?? "");
    const isDragOverThis = file.isDirectory && dragOverFolder === file.name;

    return (
      <Box
        draggable={!file.isDirectory}
        onDragStart={!file.isDirectory ? (e: React.DragEvent) => handleDragStart(e, file.name ?? "") : undefined}
        onDragOver={file.isDirectory ? (e: React.DragEvent) => handleDragOver(e, file.name ?? "") : undefined}
        onDragLeave={file.isDirectory ? handleDragLeave : undefined}
        onDrop={file.isDirectory ? (e: React.DragEvent) => handleDrop(e, file.name ?? "") : undefined}
        sx={{
          border: isDragOverThis ? 2 : 0,
          borderColor: "primary.main",
          borderRadius: 1,
          transition: "border-color 0.15s",
        }}
      >
        <WrapperContent
          {...(infos || {})}
          {...file}
          isDirectory={file.isDirectory}
          onFolderClick={handleFolderClick}
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
              "&:hover": { bgcolor: "action.hover" },
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
                <FolderRoundedIcon color="warning" fontSize="small" />
              ) : isImage ? (
                <ListThumbnail url={file.url} />
              ) : infos?.icon ? (
                <Box component="img" src={infos.icon} sx={{ width: 22, height: 22 }} />
              ) : (
                <Box component="img" src={blankIcon} sx={{ width: 22, height: 22, opacity: 0.6 }} />
              )}
            </Box>
            {/* Name */}
            <Box flex={1} minWidth={0} pl={0.5}>
              <Typography variant="body2" noWrap sx={{ fontSize, maxWidth: { xs: 150, sm: 250, md: 400, lg: 500 } }}>
                {(file.name ?? "").replace(/_/g, " ")}
              </Typography>
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

  return (
    <>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", px: 0.5 }}>
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

      {/* Drag & drop move confirmation dialog */}
      <Dialog open={!!moveConfirm} onClose={() => setMoveConfirm(null)} fullWidth maxWidth="xs">
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" fontSize={18}>
            {t("dragDrop.moveConfirmTitle")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t("dragDrop.moveConfirmMessage", {
              fileName: (moveConfirm?.fileName ?? "").replace(/_/g, " "),
              folderName: (moveConfirm?.folderName ?? "").replace(/_/g, " "),
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveConfirm(null)}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleConfirmMove}>{t("common.confirm")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
