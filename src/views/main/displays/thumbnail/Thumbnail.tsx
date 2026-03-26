/**
 * Thumbnail — Vue vignette des fichiers workspace.
 *
 * Grille responsive avec items centres et proportionnels.
 * Supporte la multi-selection, le drag & drop vers les dossiers.
 */

import {
  Box,
  Checkbox,
  Grid,
  Skeleton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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

  // --- Drag & Drop ---
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
    // Ignorer si le fichier est droppé sur lui-même ou si pas de nom
    if (fileName && fileName !== folderName) {
      setMoveConfirm({ fileName, folderName });
    }
  }, []);

  const getCurrentPath = useCallback(() => {
    const params = new URLSearchParams(search);
    const folderParam = params.get("folder") || "";
    const cat = ["images", "videos", "others"].find((c) => pathname.includes(c)) ?? "documents";
    return folderParam ? `${cat}/${folderParam}` : cat;
  }, [search, pathname]);

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
      <Grid container spacing={1} p={1}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={i}>
            <Skeleton variant="rounded" height={150} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (data.length === 0) {
    return (
      <Box
        display="flex" flexDirection="column" alignItems="center" justifyContent="center"
        height="100%" gap={1}
      >
        <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
        <Typography color="text.secondary" fontWeight="bold">{t("files.emptySpace")}</Typography>
        <Typography variant="body2" color="text.disabled">{t("files.emptySpaceHint")}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box overflow="auto" p={1} height="100%">
        <Grid container>
          {data.map((file, index) => {
            const isSelected = selectedFiles.has(file.name ?? "");

            if (file.isDirectory) {
              return (
                <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={`dir_${index}_${file.name}`}
                  sx={{ display: "flex", justifyContent: "center" }}>
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
                    <WrapperContent {...file} isDirectory onFolderClick={handleFolderClick}>
                      <FolderItem name={file.name} date={file.createdAt} count={file.count ?? file.children} />
                    </WrapperContent>
                  </Box>
                </Grid>
              );
            }

            const infos = fileExtensionBase.find(({ exts }) =>
              exts.includes(getFileExtension(file.name ?? "") ?? "")
            );

            return (
              <Grid item xs={4} sm={3} md={2.4} lg={2} xl={1.5} key={`${index}_${file.name}`}
                sx={{ display: "flex", justifyContent: "center" }}>
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
                  <WrapperContent {...infos} {...file}>
                    <File {...infos} name={file.name} date={file.createdAt} url={file.url} />
                  </WrapperContent>
                </Box>
              </Grid>
            );
          })}
        </Grid>
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
