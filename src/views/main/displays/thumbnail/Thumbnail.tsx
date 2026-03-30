/**
 * Thumbnail — Vue vignette virtualisée avec grille adaptive.
 *
 * Utilise VirtuosoGrid pour ne rendre que les items visibles.
 * Pattern : parent relatif → enfant absolu inset 0.
 */

import {
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import fileExtensionBase from "@/utils/fileExtensionBase";
import getFileExtension from "@/utils/getFileExtension";
import File from "@/views/main/displays/file/File";
import FolderItem from "@/views/main/displays/thumbnail/FolderItem";
import WrapperContent from "@/views/main/displays/thumbnail/WrapperContent";
import MoveConfirmDialog from "@/components/MoveConfirmDialog";
import useDragDropMove from "@/hooks/useDragDropMove";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import { FileItem, RootState } from "@/types";

interface ThumbnailProps {
  data?: FileItem[];
  loading?: boolean;
  selectedFiles?: Set<string>;
  onToggleSelect?: (name: string) => void;
  highlightFile?: string | null;
  busyFiles?: Set<string>;
}

const EMPTY_SET = new Set<string>();
const GRID_COLS = "repeat(auto-fill, minmax(160px, 1fr))";

export default function Thumbnail({ data: _data, loading, selectedFiles = EMPTY_SET, onToggleSelect, highlightFile, busyFiles = EMPTY_SET }: ThumbnailProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [findName, setFindName] = useState("");
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const isTrashView = pathname.startsWith("/trash");
  const user = useSelector((store: RootState) => store.user);

  // Inline rename
  const [renamingFile, setRenamingFile] = useState<string | null>(null);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = (e: any) => { if (e.detail?.fileName) setRenamingFile(e.detail.fileName); };
    root?.addEventListener("_trigger_inline_rename", handler);
    return () => root?.removeEventListener("_trigger_inline_rename", handler);
  }, []);

  const getCurrentPath = useCallback(() => {
    return new URLSearchParams(search).get("folder") || "";
  }, [search, pathname]);

  const { moveConfirm, dragOverFolder, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleConfirmMove, clearMoveConfirm } = useDragDropMove(getCurrentPath);

  const data = useMemo(
    () =>
      _data?.filter((item) => {
        if (findName?.trim() === "") return true;
        const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const normalizedSearch = norm(findName.trim());
        const normalizedName = norm(item?.name ?? "");
        const normalizedNameSpaced = norm((item?.name ?? "").replace(/_/g, " "));
        // Match partial words
        const words = normalizedSearch.split(/\s/).filter((w) => w.length > 0);
        return words.some((word) =>
          normalizedName.includes(word) || normalizedNameSpaced.includes(word)
        );
      }) ?? [],
    [findName, _data]
  );

  useEffect(() => {
    const handleSearch = (event: any) => setFindName(event.detail?.value ?? "");
    const root = document.getElementById("root");
    root?.addEventListener("_search_data", handleSearch);
    return () => root?.removeEventListener("_search_data", handleSearch);
  });

  const isSpecialView = !pathname.startsWith("/files");

  const handleFolderClick = useCallback((folderName: string, file?: any) => {
    if (isSpecialView && file) {
      // Dans Recents/Favoris → aller à l'emplacement du dossier dans Mes fichiers
      const folderPath = file.currentPath ? `${file.currentPath}/${folderName}` : folderName;
      document.getElementById("root")?.dispatchEvent(
        new CustomEvent("_go_to_location", { detail: { file: { ...file, currentPath: folderPath } } })
      );
    } else {
      const params = new URLSearchParams(search);
      const currentFolder = params.get("folder") || "";
      const newFolder = currentFolder ? `${currentFolder}/${folderName}` : folderName;
      navigate(`${pathname}?folder=${encodeURIComponent(newFolder)}`);
    }
  }, [search, pathname, navigate, isSpecialView]);

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

  const makeRenderName = useCallback((file: FileItem) => {
    if (renamingFile !== file.name) return undefined;
    const nameWithoutExt = (() => {
      const n = file.name || "";
      const dot = n.lastIndexOf(".");
      return dot > 0 && !file.isDirectory ? n.substring(0, dot) : n;
    })();
    return (
      <Typography
        component="span"
        contentEditable
        suppressContentEditableWarning
        ref={(el: HTMLSpanElement | null) => {
          if (el) {
            setTimeout(() => {
              el.focus();
              const range = document.createRange();
              range.selectNodeContents(el);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
            }, 50);
          }
        }}
        onBlur={(e) => handleRenameConfirm(file.name || "", (e.target as HTMLElement).textContent || "")}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); handleRenameConfirm(file.name || "", (e.target as HTMLElement).textContent || ""); }
          if (e.key === "Escape") setRenamingFile(null);
        }}
        onClick={(e) => e.stopPropagation()}
        variant="caption"
        align="center"
        sx={{
          maxWidth: 120, fontSize: 11, lineHeight: 1.3, fontWeight: 600,
          outline: "none", borderRadius: 0.5, px: 0.5,
          bgcolor: "action.selected", cursor: "text",
          display: "inline-block", minWidth: 30, wordBreak: "break-word",
        }}
      >
        {nameWithoutExt}
      </Typography>
    );
  }, [renamingFile, handleRenameConfirm]);

  // Rendu d'un item
  const renderItem = useCallback((index: number) => {
    const file = data[index];
    if (!file) return null;
    const isHighlighted = highlightFile === file.name;
    const isSelected = selectedFiles.has(file.name ?? "");
    const isBusy = busyFiles.has(file.name ?? "");

    if (file.isDirectory) {
      return (
        <Box
          sx={{
            position: "relative", width: "100%",
            "&:hover .select-checkbox": { opacity: 1 },
            "&:hover .fav-btn": { opacity: 1 },
            "&:hover": { bgcolor: "action.hover" },
            border: dragOverFolder === file.name ? 2 : 0,
            borderColor: "primary.main", borderRadius: 2, transition: "all 0.15s",
            ...(isSelected && { bgcolor: "action.selected" }),
            ...(isHighlighted && { bgcolor: "action.selected", animation: "highlightBg 2.5s ease-out forwards", "@keyframes highlightBg": { "0%": { bgcolor: "primary.light" }, "100%": { bgcolor: "transparent" } } }),
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, file.name ?? "", file._id)}
          onDragOver={(e) => handleDragOver(e, file.name ?? "")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, file.name ?? "")}
        >
          <Checkbox className="select-checkbox" size="small" checked={isSelected}
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.(file.name ?? ""); }}
            sx={{
              position: "absolute", top: 2, left: 2, zIndex: 2,
              opacity: isSelected ? 1 : 0, transition: "opacity 0.15s",
              color: "common.white",
              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
              width: 28, height: 28, p: 0,
              "&.Mui-checked": { color: "primary.main", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" },
            }}
          />
          {!isTrashView && (
            <IconButton
              className="fav-btn"
              size="small"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); document.getElementById("root")?.dispatchEvent(new CustomEvent("_toggle_favorite", { detail: { file } })); }}
              sx={{
                position: "absolute", top: 2, right: 2, zIndex: 2,
                opacity: file.isFavorite ? 0.9 : 0, transition: "opacity 0.15s",
                filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
                width: 26, height: 26, p: 0,
              }}
            >
              {file.isFavorite
                ? <StarRoundedIcon sx={{ fontSize: 18, color: "warning.main" }} />
                : <StarBorderRoundedIcon sx={{ fontSize: 18, color: "common.white" }} />}
            </IconButton>
          )}
          {isBusy && <Box sx={{ position: "absolute", inset: 0, zIndex: 5, bgcolor: "rgba(0,0,0,0.25)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><CircularProgress size={20} sx={{ color: "common.white" }} /></Box>}
          <WrapperContent {...file} isDirectory onFolderClick={!isBusy ? handleFolderClick : undefined} onDoubleClickName={!isBusy ? () => setRenamingFile(file.name ?? "") : undefined}>
            <FolderItem name={file.name} date={file.createdAt} count={file.count ?? file.children} color={file.color} renderName={makeRenderName(file)} />
          </WrapperContent>
        </Box>
      );
    }

    const infos = fileExtensionBase.find(({ exts }) => exts.includes(getFileExtension(file.name ?? "") ?? ""));

    return (
      <Box sx={{
          position: "relative", width: "100%",
          "&:hover .select-checkbox": { opacity: 1 },
          "&:hover .fav-btn": { opacity: 1 },
          "&:hover": { bgcolor: "action.hover" },
          borderRadius: 2, transition: "all 0.15s",
          ...(isSelected && { bgcolor: "action.selected" }),
          ...(isHighlighted && {
            bgcolor: "action.selected",
            animation: "highlightBg 2.5s ease-out forwards",
            "@keyframes highlightBg": { "0%": { bgcolor: "primary.light" }, "100%": { bgcolor: "transparent" } },
          }),
        }}
        draggable onDragStart={(e) => handleDragStart(e, file.name ?? "", file._id)}
      >
        <Checkbox className="select-checkbox" size="small" checked={isSelected}
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.(file.name ?? ""); }}
          sx={{
            position: "absolute", top: 2, left: 2, zIndex: 2,
            opacity: isSelected ? 1 : 0, transition: "opacity 0.15s",
            color: "common.white",
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
            width: 28, height: 28, p: 0,
            "&.Mui-checked": { color: "primary.main", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" },
          }}
        />
        {!isTrashView && <IconButton
          className="fav-btn"
          size="small"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); document.getElementById("root")?.dispatchEvent(new CustomEvent("_toggle_favorite", { detail: { file } })); }}
          sx={{
            position: "absolute", top: 2, right: 2, zIndex: 2,
            opacity: file.isFavorite ? 0.9 : 0, transition: "opacity 0.15s",
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
            width: 26, height: 26, p: 0,
          }}
        >
          {file.isFavorite
            ? <StarRoundedIcon sx={{ fontSize: 18, color: "warning.main" }} />
            : <StarBorderRoundedIcon sx={{ fontSize: 18, color: "common.white" }} />}
        </IconButton>}
        {isBusy && <Box sx={{ position: "absolute", inset: 0, zIndex: 5, bgcolor: "rgba(0,0,0,0.25)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><CircularProgress size={20} sx={{ color: "common.white" }} /></Box>}
        <WrapperContent {...infos} {...file} onDoubleClickName={!isBusy ? () => setRenamingFile(file.name ?? "") : undefined}>
          <File {...infos} name={file.name} date={file.createdAt} url={file.url} duration={file.duration} videoWidth={file.videoWidth} videoHeight={file.videoHeight} renderName={makeRenderName(file)} />
        </WrapperContent>
      </Box>
    );
  }, [data, selectedFiles, busyFiles, dragOverFolder, highlightFile, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleFolderClick, onToggleSelect, makeRenderName]);

  // Scroll vers le fichier highlighté quand les données arrivent
  useEffect(() => {
    if (!highlightFile || !data.length) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-filename="${CSS.escape(highlightFile)}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightFile, data]);

  if (loading) {
    return (
      <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Box sx={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", p: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 0.5 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, p: 1 }}>
                <Skeleton variant="rounded" width={100} height={120} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" width={80} height={14} />
                <Skeleton variant="text" width={50} height={10} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (data.length === 0) {
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
        <Box sx={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", p: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 0.5 }}>
            {data.map((_, i) => (
              <Box key={data[i]?._id || `${i}_${data[i]?.name}`} data-filename={data[i]?.name} sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                {renderItem(i)}
              </Box>
            ))}
          </Box>
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
