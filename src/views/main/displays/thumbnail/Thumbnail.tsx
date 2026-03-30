/**
 * Thumbnail — Vue vignette virtualisée avec grille adaptive.
 *
 * Utilise VirtuosoGrid pour ne rendre que les items visibles.
 * Pattern : parent relatif → enfant absolu inset 0.
 */

import scrollBarSx from "@/utils/scrollBarSx";
import {
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
import AdaptiveSkeleton from "@/components/AdaptiveSkeleton";
import useDragDropMove from "@/hooks/useDragDropMove";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import SelectAllOutlinedIcon from "@mui/icons-material/SelectAllOutlined";
import DeselectOutlinedIcon from "@mui/icons-material/DeselectOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import getFile from "@/utils/getFile";
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
  const isFilesView = pathname.startsWith("/files");
  const user = useSelector((store: RootState) => store.user);

  // Context menu sur l'espace vide
  const [emptyCtx, setEmptyCtx] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const handleEmptyContextMenu = useCallback((e: React.MouseEvent) => {
    // Ne pas ouvrir si le clic est sur un item (un enfant du grid)
    if ((e.target as HTMLElement).closest("[data-filename]")) return;
    e.preventDefault();
    setEmptyCtx({ mouseX: e.clientX + 2, mouseY: e.clientY - 6 });
  }, []);
  const closeEmptyCtx = useCallback(() => setEmptyCtx(null), []);


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
  const hasSelection = selectedFiles.size > 0;
  const allItemsSelected = data.length > 0 && data.every((f) => selectedFiles.has(f.name ?? ""));

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
        variant="body2"
        sx={{
          maxWidth: 140, width: 140, fontSize: 13, lineHeight: 1.3, fontWeight: 600,
          outline: "none", borderRadius: 0.5, px: 0.5,
          bgcolor: "action.selected", cursor: "text",
          display: "block",
          whiteSpace: "nowrap", overflow: "auto",
          "&::-webkit-scrollbar": { display: "none" },
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
            position: "relative", width: "100%", height: "100%",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
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
          position: "relative", width: "100%", height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
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
          <File {...infos} name={file.name} date={file.createdAt} url={file.url} duration={file.duration} videoWidth={file.videoWidth} videoHeight={file.videoHeight} imageWidth={file.imageWidth} imageHeight={file.imageHeight} renderName={makeRenderName(file)} />
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

  if (loading) return <AdaptiveSkeleton />;

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
        <Box sx={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", p: 1, ...scrollBarSx }} onContextMenu={handleEmptyContextMenu}>
          <Box sx={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 0.5 }}>
            {data.map((_, i) => (
              <Box key={data[i]?._id || `${i}_${data[i]?.name}`} data-filename={data[i]?.name} sx={{ display: "flex", justifyContent: "center", alignItems: "stretch" }}>
                {renderItem(i)}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Menu contextuel espace vide */}
      <Menu
        open={emptyCtx !== null}
        onClose={closeEmptyCtx}
        anchorReference="anchorPosition"
        anchorPosition={emptyCtx ? { top: emptyCtx.mouseY, left: emptyCtx.mouseX } : undefined}
        MenuListProps={{ dense: true, sx: { px: 0.5 } }}
        PaperProps={{
          sx: {
            bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
            border: (theme: any) => `1px solid ${theme.palette.divider}`,
            backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
          },
        }}
      >
        {isFilesView && (
          <MenuItem sx={{ borderRadius: 2 }} onClick={() => { closeEmptyCtx(); document.getElementById("root")?.dispatchEvent(new CustomEvent("_open_create_folder")); }}>
            <ListItemIcon><CreateNewFolderOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t("files.newFolder")} />
          </MenuItem>
        )}
        {isFilesView && (
          <MenuItem sx={{ borderRadius: 2 }} onClick={async () => {
            closeEmptyCtx();
            const files = await getFile({ multiple: true, accept: "*.*" });
            if (files) {
              const fileArray = Array.from(files as FileList);
              if (fileArray.length > 0) {
                document.getElementById("root")?.dispatchEvent(
                  new CustomEvent("_open_files_form", { detail: { files: fileArray, name: "_open_files_form" } })
                );
              }
            }
          }}>
            <ListItemIcon><UploadFileOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t("files.upload")} />
          </MenuItem>
        )}
        {isTrashView && hasSelection && (
          <MenuItem sx={{ borderRadius: 2 }} onClick={() => { closeEmptyCtx(); document.getElementById("root")?.dispatchEvent(new CustomEvent("_restore_selection")); }}>
            <ListItemIcon><RestoreOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t("trash.restore")} />
          </MenuItem>
        )}
        {isTrashView && (
          <MenuItem sx={{ borderRadius: 2 }} onClick={() => { closeEmptyCtx(); document.getElementById("root")?.dispatchEvent(new CustomEvent("_confirm_empty_trash")); }}>
            <ListItemIcon><DeleteForeverOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primary={t("trash.emptyTrash")} primaryTypographyProps={{ color: "error" }} />
          </MenuItem>
        )}
        {data.length > 0 && (
          <MenuItem sx={{ borderRadius: 2 }} onClick={() => { closeEmptyCtx(); document.getElementById("root")?.dispatchEvent(new CustomEvent("_select_all")); }}>
            <ListItemIcon>{allItemsSelected ? <DeselectOutlinedIcon fontSize="small" /> : <SelectAllOutlinedIcon fontSize="small" />}</ListItemIcon>
            <ListItemText primary={allItemsSelected ? t("selection.deselectAll") : t("selection.selectAll")} />
          </MenuItem>
        )}
        <MenuItem sx={{ borderRadius: 2 }} onClick={() => { closeEmptyCtx(); document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir")); }}>
          <ListItemIcon><RefreshOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary={t("common.refresh") || "Actualiser"} />
        </MenuItem>
      </Menu>

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
