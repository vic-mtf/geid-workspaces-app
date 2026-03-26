/**
 * Main — Zone de contenu principale de l'espace personnel.
 *
 * Structure identique à archives Content.tsx :
 *   styled("main") flex:1 flex-column overflow:hidden
 *     ├── Toolbar spacer
 *     ├── SubHeader
 *     ├── Divider
 *     ├── Breadcrumb (si pas special view)
 *     └── Box flex:1 overflow:hidden  ← le grid contenu + détail vit ici
 */

import { Toolbar, Box as MuiBox, Divider, Drawer, useMediaQuery, useTheme, styled } from "@mui/material";
import queryString from "query-string";
import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { updateData, setFolderCache, invalidateFolderCache, type FolderCacheEntry } from "@/redux/data";
import ArchivesForm from "@/views/forms/archives/ArchivesForm";
import MediaLibraryForm from "@/views/forms/medialibrary/MediaLibraryForm";
import Thumbnail from "@/views/main/displays/thumbnail/Thumbnail";
import ListView from "@/views/main/displays/list/ListView";
import FilePreviewDialog from "@/views/main/displays/preview/FilePreviewDialog";
import DropZone from "@/views/main/DropZone";
import SubHeader from "@/views/main/sub-header/SubHeader";
import FilesForm from "@/views/forms/files/FilesForm";
import FolderBreadcrumb from "@/views/main/FolderBreadcrumb";
import FavoriteHandler from "@/views/main/displays/thumbnail/FavoriteHandler";
import MoveFileHandler from "@/views/dialogs/MoveFileHandler";
import CopyFileHandler from "@/views/dialogs/CopyFileHandler";
import ShareDialog from "@/views/dialogs/ShareDialog";
import TagsDialog from "@/views/dialogs/TagsDialog";
import DeleteConfirmDialog from "@/views/main/DeleteConfirmDialog";
import FileDetailPanel from "@/views/main/FileDetailPanel";
import DetailResizeDivider from "@/components/DetailResizeDivider";
import usePanelWidth from "@/hooks/usePanelWidth";
import useGetData from "@/utils/useGetData";
import useAxios from "@/utils/useAxios";
import getFileExtension from "@/utils/getFileExtension";
import { RootState, FileItem } from "@/types";
import FavoritesView from "@/views/favorites/FavoritesView";
import RecentView from "@/views/recent/RecentView";
import TrashView from "@/views/trash/TrashView";

// ── Styled main — même pattern que archives ──────────────────
const StyledMain = styled("main")({
  flexGrow: 1,
  flexShrink: 1,
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export default function Main() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = !isDesktop;

  const CATEGORY_LABELS: Record<string, string> = {
    documents: t("nav.documents"),
    images: t("nav.images"),
    videos: t("nav.videos"),
    others: t("nav.others"),
  };

  const data = useSelector((store: RootState) => store.data);
  const user = useSelector((store: RootState) => store.user);
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();

  // ── Detail panel ───────────────────────────────────────────
  const [focusedFile, setFocusedFile] = useState<FileItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailWidth, setDetailWidth] = usePanelWidth("workspace.detail", 280);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setFocusedFile(null);
  }, []);

  const handleDetailAction = useCallback((action: string, file: FileItem) => {
    const root = document.getElementById("root");
    const currentPath = (() => {
      const params = new URLSearchParams(search);
      const folder = params.get("folder") || "";
      const cat = ["images", "videos", "others"].find((c) => pathname.includes(c)) ?? "documents";
      return folder ? `${cat}/${folder}` : cat;
    })();

    switch (action) {
      case "open":
        if (file.url) {
          fetch(file.url, { headers: { Authorization: `Bearer ${user?.token}` } })
            .then((res) => res.blob())
            .then((blob) => window.open(URL.createObjectURL(blob), "_blank"))
            .catch(() => enqueueSnackbar(t("files.openFileError"), { variant: "error" }));
        }
        break;
      case "download":
        if (file.url) {
          fetch(file.url, { headers: { Authorization: `Bearer ${user?.token}` } })
            .then((res) => res.blob())
            .then((blob) => {
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = file.name || "download";
              a.click();
            })
            .catch(() => enqueueSnackbar(t("files.openFileError"), { variant: "error" }));
        }
        break;
      case "rename": {
        const newName = (file as any).newName;
        if (!newName || newName === file.name) break;
        const ext = getFileExtension(file.name || "");
        const finalName = ext ? `${newName}.${ext}` : newName;
        fetch("/api/stuff/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
          body: JSON.stringify({ oldFilename: file.name, filename: finalName, path: currentPath, userId: user?.id }),
        })
          .then((res) => { if (!res.ok) throw new Error(); enqueueSnackbar(t("files.fileRenamed"), { variant: "success" }); root?.dispatchEvent(new CustomEvent("_reload_current_dir")); })
          .catch(() => enqueueSnackbar(t("files.fileRenameError"), { variant: "error" }));
        break;
      }
      case "share": root?.dispatchEvent(new CustomEvent("_open_share_dialog", { detail: { file: { ...file, currentPath } } })); break;
      case "move": root?.dispatchEvent(new CustomEvent("_open_move_dialog", { detail: { file: { ...file, currentPath } } })); break;
      case "copy": root?.dispatchEvent(new CustomEvent("_open_copy_dialog", { detail: { file: { ...file, currentPath } } })); break;
      case "delete": root?.dispatchEvent(new CustomEvent("_confirm_delete", { detail: { fileNames: [file.name] } })); break;
      case "archive": root?.dispatchEvent(new CustomEvent("_open_archives_form", { detail: { file: { ...file, currentPath } } })); break;
    }
  }, [search, pathname, user?.token, enqueueSnackbar, t]);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = (event: any) => { if (event.detail?.file) { setFocusedFile(event.detail.file); setDetailOpen(true); } };
    root?.addEventListener("_open_detail_file", handler);
    return () => root?.removeEventListener("_open_detail_file", handler);
  }, []);

  useEffect(() => { handleCloseDetail(); }, [pathname, search, handleCloseDetail]);

  // ── Multi-selection ────────────────────────────────────────
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const toggleSelect = useCallback((name: string) => {
    setSelectedFiles((prev) => { const next = new Set(prev); next.has(name) ? next.delete(name) : next.add(name); return next; });
  }, []);
  const clearSelection = useCallback(() => setSelectedFiles(new Set()), []);

  // ── Delete ─────────────────────────────────────────────────
  const [deleteConfirmFiles, setDeleteConfirmFiles] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [, executeDelete] = useAxios({ headers: { Authorization: `Bearer ${user?.token}` } }, { manual: true });

  // ── Data fetching ──────────────────────────────────────────
  const isSpecialView = useMemo(() => {
    if (pathname.startsWith("/favorites")) return "favorites";
    if (pathname.startsWith("/recent")) return "recent";
    if (pathname.startsWith("/trash")) return "trash";
    return null;
  }, [pathname]);

  const key = useMemo(() => {
    if (pathname.match(/images/)) return "images";
    if (pathname.match(/videos/)) return "videos";
    if (pathname.match(/others/)) return "others";
    return "documents";
  }, [pathname]);

  const folder = useMemo(() => new URLSearchParams(search).get("folder") || "", [search]);

  const [, getDocs] = useGetData({ key: "documents", onBeforeUpdate(d: any) { return { ...d, others: [] }; } });
  const [, getImages] = useGetData({ key: "images" });
  const [, getVideos] = useGetData({ key: "videos", onBeforeUpdate(d: any) { return { ...d, audios: [] }; } });

  const getByKey = useCallback((k: string, f: string) => {
    if (k === "images") return getImages({ folder: f });
    if (k === "videos") return getVideos({ folder: f });
    return getDocs({ folder: f });
  }, [getDocs, getImages, getVideos]);

  const [loading, setLoading] = useState(false);

  const cachePath = folder ? `${key}/${folder}` : key;
  const folderCache = useSelector((store: RootState) => ((store.data as any).folderCache as Record<string, FolderCacheEntry>)?.[cachePath]);

  useEffect(() => {
    clearSelection();
    if (folderCache?.data) {
      dispatch(updateData({ data: { [key]: folderCache.data } }));
      if (Date.now() - folderCache.timestamp > 30000) getByKey(key, folder);
      return;
    }
    setLoading(true);
    getByKey(key, folder).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, folder]);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = () => { dispatch(invalidateFolderCache(cachePath)); getByKey(key, folder); };
    root?.addEventListener("_reload_current_dir", handler);
    return () => root?.removeEventListener("_reload_current_dir", handler);
  }, [key, folder, getByKey, cachePath, dispatch]);

  const display = useSelector((store: RootState) => (store.app as any).display ?? "thumbnail");
  const sort = useSelector((store: RootState) => (store.app as any).sort ?? "name");
  const order = useSelector((store: RootState) => (store.app as any).order ?? "ascending");
  const SYSTEM_FILES = new Set(["thumbs.db", "Thumbs.db", ".gitkeep", ".DS_Store"]);

  const _data = useMemo(() => {
    let __data = [...((data as any)[key] || [])].filter((f: any) => f.name && !f.name.startsWith(".") && !SYSTEM_FILES.has(f.name));
    if (!sort || sort === "name") __data.sort((a: any, b: any) => { if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1; return (a?.name || "").toUpperCase().localeCompare((b?.name || "").toUpperCase()); });
    if (sort === "date") __data.sort((a: any, b: any) => new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime());
    if (order === "descending") __data = __data.reverse();
    return __data;
  }, [key, data, sort, order]);

  const allSelected = useMemo(() => _data.length > 0 && _data.every((f) => selectedFiles.has(f.name ?? "")), [_data, selectedFiles]);
  const selectAll = useCallback(() => { if (allSelected) clearSelection(); else setSelectedFiles(new Set(_data.map((f) => f.name ?? ""))); }, [allSelected, _data, clearSelection]);
  const getCurrentPath = useCallback(() => folder ? `${key}/${folder}` : key, [key, folder]);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleteConfirmOpen(false);
    const path = getCurrentPath();
    try {
      await Promise.all(deleteConfirmFiles.map((fn) => executeDelete({ method: "delete", url: `/api/stuff/workspace/${JSON.stringify({ userId: user?.id, path, filename: fn })}` })));
      enqueueSnackbar(t("files.fileDeleted"), { variant: "success" });
    } catch { enqueueSnackbar(t("files.fileDeleteError"), { variant: "error" }); }
    clearSelection(); setDeleteConfirmFiles([]);
    document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
  }, [deleteConfirmFiles, getCurrentPath, user?.id, executeDelete, enqueueSnackbar, t, clearSelection]);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = (event: any) => { const fns: string[] = event.detail?.fileNames || []; if (fns.length > 0) { setDeleteConfirmFiles(fns); setDeleteConfirmOpen(true); } };
    root?.addEventListener("_confirm_delete", handler);
    return () => root?.removeEventListener("_confirm_delete", handler);
  }, []);

  const handleSelectionDelete = useCallback(() => { setDeleteConfirmFiles(Array.from(selectedFiles)); setDeleteConfirmOpen(true); }, [selectedFiles]);
  const handleSelectionMove = useCallback(() => {
    const root = document.getElementById("root");
    Array.from(selectedFiles).forEach((name) => root?.dispatchEvent(new CustomEvent("_open_move_dialog", { detail: { file: { name, currentPath: getCurrentPath() } } })));
  }, [selectedFiles, getCurrentPath]);

  const showDetail = detailOpen && focusedFile && isDesktop;

  // ── Render content view ────────────────────────────────────
  const renderContent = () => {
    const viewProps = { data: _data, loading, selectedFiles, onToggleSelect: toggleSelect, allSelected, onSelectAll: selectAll };
    if (!display || display === "thumbnail") return <Thumbnail {...viewProps} />;
    if (display === "compact") return <ListView {...viewProps} compact />;
    return <ListView {...viewProps} />;
  };

  return (
    <>
      {/* ── Main styled comme archives Content ─────────────── */}
      <StyledMain>
        <Toolbar variant="dense" />
        <SubHeader selectedFiles={selectedFiles} onClearSelection={clearSelection} onDelete={handleSelectionDelete} onMove={handleSelectionMove} />
        <Divider />

        {isSpecialView ? (
          <MuiBox flex={1} minHeight={0} overflow="hidden" display="flex" flexDirection="column">
            {isSpecialView === "favorites" && <FavoritesView />}
            {isSpecialView === "recent" && <RecentView />}
            {isSpecialView === "trash" && <TrashView />}
          </MuiBox>
        ) : (
          <>
            <FolderBreadcrumb categoryLabel={CATEGORY_LABELS[key] ?? key} />

            {/* ── Grid contenu + détail — prend tout l'espace restant ── */}
            <MuiBox sx={{
              display: "grid",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              gridTemplateColumns: showDetail ? `1fr 1px ${detailWidth}px` : "1fr",
            }}>
              <MuiBox sx={{ minWidth: 0, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <DropZone>{renderContent()}</DropZone>
              </MuiBox>

              {showDetail && <DetailResizeDivider onResize={setDetailWidth} minWidth={200} maxWidth={450} />}

              {showDetail && (
                <MuiBox sx={{ borderLeft: 1, borderColor: "divider", overflow: "auto" }}>
                  <FileDetailPanel file={focusedFile} onClose={handleCloseDetail} onAction={handleDetailAction} />
                </MuiBox>
              )}
            </MuiBox>
          </>
        )}
      </StyledMain>

      {/* ── Mobile detail drawer — hors du main ────────────── */}
      {isMobile && (
        <Drawer anchor="bottom" open={detailOpen && !!focusedFile} onClose={handleCloseDetail}
          PaperProps={{ sx: { maxHeight: "70vh", borderTopLeftRadius: 16, borderTopRightRadius: 16 } }}>
          <FileDetailPanel file={focusedFile} onClose={handleCloseDetail} onAction={handleDetailAction} />
        </Drawer>
      )}

      {/* ── Dialogs/Forms — hors du main ───────────────────── */}
      <MediaLibraryForm />
      <ArchivesForm />
      <FilesForm />
      <FilePreviewDialog />
      <FavoriteHandler />
      <MoveFileHandler />
      <CopyFileHandler />
      <ShareDialog />
      <TagsDialog />
      <DeleteConfirmDialog open={deleteConfirmOpen} fileNames={deleteConfirmFiles} onConfirm={handleDeleteConfirm}
        onClose={() => { setDeleteConfirmOpen(false); setDeleteConfirmFiles([]); }} />
    </>
  );
}
