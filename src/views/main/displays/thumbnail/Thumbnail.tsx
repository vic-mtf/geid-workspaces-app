/**
 * Thumbnail — Vue vignette virtualisée avec grille adaptive.
 *
 * Utilise VirtuosoGrid pour ne rendre que les items visibles.
 * Pattern : parent relatif → enfant absolu inset 0.
 */

import {
  Box,
  Checkbox,
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
import { FileItem, RootState } from "@/types";

interface ThumbnailProps {
  data?: FileItem[];
  loading?: boolean;
  selectedFiles?: Set<string>;
  onToggleSelect?: (name: string) => void;
}

const EMPTY_SET = new Set<string>();
const GRID_COLS = "repeat(auto-fill, minmax(160px, 1fr))";

export default function Thumbnail({ data: _data, loading, selectedFiles = EMPTY_SET, onToggleSelect }: ThumbnailProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [findName, setFindName] = useState("");
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
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
        const words = findName.split(/\s/).filter((w: string) => w?.trim());
        return words.some((word: string) => {
          const _word = word.toLowerCase().trim();
          return (
            (_word.length > 2 && (item?.name?.toLowerCase() ?? "").includes(_word)) ||
            (item?.name?.replace(/_/gi, " ").toLowerCase() ?? "").includes(findName?.toLowerCase()?.trim() ?? "")
          );
        });
      }) ?? [],
    [findName, _data]
  );

  useEffect(() => {
    const handleSearch = (event: any) => setFindName(event.detail?.value ?? "");
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

  // Rendu d'un item — mémoïsé par index
  const renderItem = useCallback((index: number) => {
    const file = data[index];
    if (!file) return null;
    const isSelected = selectedFiles.has(file.name ?? "");

    if (file.isDirectory) {
      return (
        <Box
          sx={{
            position: "relative", width: "100%",
            "&:hover .select-checkbox": { opacity: 1 },
            border: dragOverFolder === file.name ? 2 : 0,
            borderColor: "primary.main", borderRadius: 2, transition: "border-color 0.15s",
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, file.name ?? "", file._id)}
          onDragOver={(e) => handleDragOver(e, file.name ?? "")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, file.name ?? "")}
        >
          <Checkbox className="select-checkbox" size="small" checked={isSelected}
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.(file.name ?? ""); }}
            sx={{ position: "absolute", top: 2, left: 2, zIndex: 2, opacity: isSelected ? 1 : 0, transition: "opacity 0.15s" }}
          />
          <WrapperContent {...file} isDirectory onFolderClick={handleFolderClick} onDoubleClickName={() => setRenamingFile(file.name ?? "")}>
            <FolderItem name={file.name} date={file.createdAt} count={file.count ?? file.children} color={file.color} renderName={makeRenderName(file)} />
          </WrapperContent>
        </Box>
      );
    }

    const infos = fileExtensionBase.find(({ exts }) => exts.includes(getFileExtension(file.name ?? "") ?? ""));

    return (
      <Box sx={{ position: "relative", width: "100%", "&:hover .select-checkbox": { opacity: 1 } }}
        draggable onDragStart={(e) => handleDragStart(e, file.name ?? "", file._id)}
      >
        <Checkbox className="select-checkbox" size="small" checked={isSelected}
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.(file.name ?? ""); }}
          sx={{ position: "absolute", top: 2, left: 2, zIndex: 2, opacity: isSelected ? 1 : 0, transition: "opacity 0.15s" }}
        />
        <WrapperContent {...infos} {...file} onDoubleClickName={() => setRenamingFile(file.name ?? "")}>
          <File {...infos} name={file.name} date={file.createdAt} url={file.url} duration={file.duration} videoWidth={file.videoWidth} videoHeight={file.videoHeight} renderName={makeRenderName(file)} />
        </WrapperContent>
      </Box>
    );
  }, [data, selectedFiles, dragOverFolder, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleFolderClick, onToggleSelect, makeRenderName]);

  if (loading) {
    return (
      <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Box sx={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", p: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 0.5 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={150} sx={{ borderRadius: 2 }} />
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
              <Box key={`${i}_${data[i]?.name}`} sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
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
