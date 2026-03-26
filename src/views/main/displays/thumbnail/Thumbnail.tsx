/**
 * Thumbnail — Vue vignette avec grille adaptive (ResizeObserver).
 *
 * Pattern : parent 100% relatif → enfant absolu inset 0 overflow auto.
 * Colonnes recalculées selon largeur réelle via useContainerSize.
 */

import {
  Box,
  Checkbox,
  Skeleton,
  TextField,
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
import useContainerSize from "@/hooks/useContainerSize";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { FileItem, RootState } from "@/types";

interface ThumbnailProps {
  data?: FileItem[];
  loading?: boolean;
  selectedFiles?: Set<string>;
  onToggleSelect?: (name: string) => void;
}

const EMPTY_SET = new Set<string>();

export default function Thumbnail({ data: _data, loading, selectedFiles = EMPTY_SET, onToggleSelect }: ThumbnailProps) {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [findName, setFindName] = useState("");
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const user = useSelector((store: RootState) => store.user);

  const [containerRef, containerSize] = useContainerSize();
  const cols = useMemo(() => Math.max(2, Math.floor(containerSize.width / 140)), [containerSize.width]);

  // Inline rename
  const [renamingFile, setRenamingFile] = useState<string | null>(null);

  const getCurrentPath = useCallback(() => {
    const params = new URLSearchParams(search);
    const folderParam = params.get("folder") || "";
    const cat = ["images", "videos", "others"].find((c) => pathname.includes(c)) ?? "documents";
    return folderParam ? `${cat}/${folderParam}` : cat;
  }, [search, pathname]);

  // Drag & drop
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
    if (!trimmed || trimmed === oldName) return;

    const path = getCurrentPath();
    const ext = getFileExtension(oldName);
    const finalName = ext ? `${trimmed}.${ext}` : trimmed;

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
        inputProps={{ style: { fontSize: 11, textAlign: "center", padding: "2px 4px" } }}
        sx={{ maxWidth: 120 }}
      />
    );
  }, [renamingFile, handleRenameConfirm]);

  if (loading) {
    return (
      <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
        <Box ref={containerRef} sx={{ position: "absolute", inset: 0, overflow: "auto", p: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 0.5 }}>
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
      <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
        <Box ref={containerRef} sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
          <Typography color="text.secondary" fontWeight="bold">{t("files.emptySpace")}</Typography>
          <Typography variant="body2" color="text.disabled">{t("files.emptySpaceHint")}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
        <Box ref={containerRef} sx={{ position: "absolute", inset: 0, overflow: "auto", p: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 0.5 }}>
            {data.map((file, index) => {
              const isSelected = selectedFiles.has(file.name ?? "");

              if (file.isDirectory) {
                return (
                  <Box key={`dir_${index}_${file.name}`} sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        "&:hover .select-checkbox": { opacity: 1 },
                        border: dragOverFolder === file.name ? 2 : 0,
                        borderColor: "primary.main",
                        borderRadius: 2,
                        transition: "border-color 0.15s",
                      }}
                      onDragOver={(e) => handleDragOver(e, file.name ?? "")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, file.name ?? "")}
                    >
                      <Checkbox
                        className="select-checkbox"
                        size="small"
                        checked={isSelected}
                        onClick={(e) => { e.stopPropagation(); onToggleSelect?.(file.name ?? ""); }}
                        sx={{
                          position: "absolute", top: 2, left: 2, zIndex: 2,
                          opacity: isSelected ? 1 : 0,
                          transition: "opacity 0.15s",
                        }}
                      />
                      <WrapperContent {...file} isDirectory onFolderClick={handleFolderClick} onDoubleClickName={() => setRenamingFile(file.name ?? "")}>
                        <FolderItem name={file.name} date={file.createdAt} count={file.count ?? file.children} renderName={makeRenderName(file)} />
                      </WrapperContent>
                    </Box>
                  </Box>
                );
              }

              const infos = fileExtensionBase.find(({ exts }) =>
                exts.includes(getFileExtension(file.name ?? "") ?? "")
              );

              return (
                <Box key={`${index}_${file.name}`} sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      "&:hover .select-checkbox": { opacity: 1 },
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file.name ?? "")}
                  >
                    <Checkbox
                      className="select-checkbox"
                      size="small"
                      checked={isSelected}
                      onClick={(e) => { e.stopPropagation(); onToggleSelect?.(file.name ?? ""); }}
                      sx={{
                        position: "absolute", top: 2, left: 2, zIndex: 2,
                        opacity: isSelected ? 1 : 0,
                        transition: "opacity 0.15s",
                      }}
                    />
                    <WrapperContent {...infos} {...file} onDoubleClickName={() => setRenamingFile(file.name ?? "")}>
                      <File {...infos} name={file.name} date={file.createdAt} url={file.url} renderName={makeRenderName(file)} />
                    </WrapperContent>
                  </Box>
                </Box>
              );
            })}
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
