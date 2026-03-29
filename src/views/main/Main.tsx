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
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { updateData, dataStore } from "@/redux/data";
import { incrementPendingShare, setPendingShareCount } from "@/redux/app";
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
import SharedView from "@/views/shared/SharedView";
import useSocket from "@/hooks/useSocket";
import UpdateToast from "@/components/UpdateToast";

const SYSTEM_FILES = new Set(["thumbs.db", "Thumbs.db", ".gitkeep", ".DS_Store"]);

// Module-level pour survivre au remontage du composant
let _pendingHighlight: string | null = null;

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
  const dispatch = useDispatch();
  const user = useSelector((store: RootState) => store.user);

  // Charger le badge invitations au montage
  useEffect(() => {
    if (!user?.token) return;
    fetch("/api/stuff/workspace/share/invitations", { headers: { Authorization: `Bearer ${user.token}` } })
      .then((r) => r.json())
      .then((d: any[]) => { const pending = d.filter((i) => i.status === "pending").length; dispatch(setPendingShareCount(pending)); })
      .catch(() => {});
  }, [user?.token, dispatch]);

  // Socket.io — notifications temps réel
  useSocket(useCallback((event: string, socketData: any) => {
    if (event === "workspace:share-invitation") {
      const senderName = socketData.invitation?.fromName || "Un utilisateur";
      const fileName = socketData.invitation?.fileName || "un fichier";
      enqueueSnackbar(`${senderName} souhaite partager « ${fileName} » avec vous. Consultez votre espace partage pour accepter ou refuser.`, { variant: "info" });
      dispatch(incrementPendingShare());
    }
    if (event === "workspace:share-accepted") {
      enqueueSnackbar(`${socketData.accepterName || "L'utilisateur"} a accepte votre partage de « ${socketData.invitation?.fileName || "votre fichier"} ».`, { variant: "success" });
    }
    document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_shared"));
  }, [enqueueSnackbar]));

  const FILES_LABEL = t("nav.files");

  const data = useSelector((store: RootState) => store.data);
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
    const currentPath = new URLSearchParams(search).get("folder") || "";

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
      case "delete": root?.dispatchEvent(new CustomEvent("_confirm_delete", { detail: { fileNames: [file.name], isDirectory: file.isDirectory } })); break;
      case "archive": root?.dispatchEvent(new CustomEvent("_open_archives_form", { detail: { file: { ...file, currentPath } } })); break;
      case "favorite": root?.dispatchEvent(new CustomEvent("_toggle_favorite", { detail: { file } })); break;
      case "goToLocation": root?.dispatchEvent(new CustomEvent("_go_to_location", { detail: { file } })); break;
      case "restore": {
        const id = file._id;
        if (id) fetch(`/api/stuff/workspace/restore/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${user?.token}` } })
          .then((r) => { if (!r.ok) throw new Error(); enqueueSnackbar(t("trash.restoreSuccess"), { variant: "success" }); root?.dispatchEvent(new CustomEvent("_reload_current_dir")); })
          .catch(() => enqueueSnackbar(t("trash.restoreError"), { variant: "error" }));
        break;
      }
      case "permanentDelete": root?.dispatchEvent(new CustomEvent("_confirm_delete", { detail: { fileNames: [file.name], isPermanent: true, fileId: file._id } })); break;
    }
  }, [search, pathname, user?.token, enqueueSnackbar, t]);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = (event: any) => {
      if (event.detail?.file) {
        setFocusedFile(event.detail.file);
        setDetailOpen(true);
        // Marquer comme consulté (fire-and-forget)
        const fileId = event.detail.file._id;
        if (fileId && !event.detail.file.isDirectory) {
          fetch(`/api/stuff/workspace/touch/${fileId}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${user?.token}` },
          }).catch(() => {});
        }
      }
    };
    root?.addEventListener("_open_detail_file", handler);
    return () => root?.removeEventListener("_open_detail_file", handler);
  }, []);

  // Aller à l'emplacement d'un fichier/dossier
  const navigateTo = useNavigate();
  const [highlightFile, setHighlightFile] = useState<string | null>(_pendingHighlight);

  // Consommer le highlight pending au montage
  useEffect(() => {
    if (_pendingHighlight) {
      setHighlightFile(_pendingHighlight);
      const timer = setTimeout(() => { setHighlightFile(null); _pendingHighlight = null; }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = (event: any) => {
      const file = event.detail?.file;
      if (!file) return;
      const parentPath = file.currentPath || file.path || "";
      // Stocker en module-level pour survivre au remontage
      _pendingHighlight = file.name || null;
      setHighlightFile(file.name || null);
      setTimeout(() => { setHighlightFile(null); _pendingHighlight = null; }, 3500);
      if (parentPath) {
        navigateTo(`/files?folder=${encodeURIComponent(parentPath)}`);
      } else {
        navigateTo("/files");
      }
    };
    root?.addEventListener("_go_to_location", handler);
    return () => root?.removeEventListener("_go_to_location", handler);
  }, [navigateTo]);

  useEffect(() => { handleCloseDetail(); clearSelection(); }, [pathname, handleCloseDetail]);

  // ── Multi-selection ────────────────────────────────────────
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const toggleSelect = useCallback((name: string) => {
    setSelectedFiles((prev) => { const next = new Set(prev); next.has(name) ? next.delete(name) : next.add(name); return next; });
  }, []);
  const clearSelection = useCallback(() => setSelectedFiles(new Set()), []);

  // ── Delete ─────────────────────────────────────────────────
  const [deleteConfirmFiles, setDeleteConfirmFiles] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<{ isDirectory?: boolean; isPermanent?: boolean; fileId?: string }>({});
  const [, executeDelete] = useAxios({ headers: { Authorization: `Bearer ${user?.token}` } }, { manual: true });

  // ── Data fetching ──────────────────────────────────────────
  const isSpecialView = useMemo(() => {
    if (pathname.startsWith("/favorites")) return "favorites";
    if (pathname.startsWith("/recent")) return "recent";
    if (pathname.startsWith("/shared")) return "shared";
    if (pathname.startsWith("/trash")) return "trash";
    return null;
  }, [pathname]);

  const key = "files";

  const folder = useMemo(() => new URLSearchParams(search).get("folder") || "", [search]);

  const [, getFiles] = useGetData({ key: "files" });

  const [loading, setLoading] = useState(false);

  const cachePath = folder ? `files/${folder}` : "files";

  // Toast pour signaler les nouvelles données en arrière-plan
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const hideToast = useCallback(() => setShowUpdateToast(false), []);

  useEffect(() => {
    if (isSpecialView) return;
    clearSelection();

    // 1. Check in-memory dataStore (instant, synchrone)
    const memCache = dataStore.folderData[cachePath];
    if (memCache) {
      // Deja visite (meme si vide []) → afficher immediatement
      dispatch(updateData({ data: { [key]: memCache.data } }));
      setLoading(false);
      if (Date.now() - memCache.timestamp > 30000) getFiles({ folder });
      return;
    }

    // 2. Jamais visite ce dossier → skeleton
    setLoading(true);
    getFiles({ folder }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, isSpecialView]);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = () => {
      // Just refetch — do NOT clear the dataStore cache
      getFiles({ folder });
    };
    root?.addEventListener("_reload_current_dir", handler);
    return () => root?.removeEventListener("_reload_current_dir", handler);
  }, [folder, getFiles]);

  const display = useSelector((store: RootState) => (store.app as any).display ?? "thumbnail");
  const sort = useSelector((store: RootState) => (store.app as any).sort ?? "name");
  const order = useSelector((store: RootState) => (store.app as any).order ?? "ascending");

  const _data = useMemo(() => {
    const filtered = [...((data as any)[key] || [])].filter((f: any) => f.name && !f.name.startsWith(".") && !SYSTEM_FILES.has(f.name));
    const dirs = filtered.filter((f: any) => f.isDirectory);
    const files = filtered.filter((f: any) => !f.isDirectory);
    const sortFn = (a: any, b: any) => {
      if (!sort || sort === "name") return (a?.name || "").toUpperCase().localeCompare((b?.name || "").toUpperCase());
      if (sort === "date") return new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime();
      if (sort === "size") return (a?.size || 0) - (b?.size || 0);
      if (sort === "modified") return new Date(a?.lastAccessedAt || a?.createdAt).getTime() - new Date(b?.lastAccessedAt || b?.createdAt).getTime();
      if (sort === "type") return (a?.name || "").split(".").pop()!.localeCompare((b?.name || "").split(".").pop()!);
      return 0;
    };
    dirs.sort(sortFn);
    files.sort(sortFn);
    if (order === "descending") { dirs.reverse(); files.reverse(); }
    return [...dirs, ...files];
  }, [key, data, sort, order]);

  const allSelected = useMemo(() => _data.length > 0 && _data.every((f) => selectedFiles.has(f.name ?? "")), [_data, selectedFiles]);
  const selectAll = useCallback(() => { if (allSelected) clearSelection(); else setSelectedFiles(new Set(_data.map((f) => f.name ?? ""))); }, [allSelected, _data, clearSelection]);
  const getCurrentPath = useCallback(() => folder || "", [folder]);

  const handleDeleteConfirm = useCallback(async (permanent: boolean) => {
    setDeleteConfirmOpen(false);
    const path = getCurrentPath();
    try {
      if (deleteMode.isPermanent && deleteMode.fileId) {
        // Suppression permanente depuis la corbeille
        await executeDelete({ method: "delete", url: `/api/stuff/workspace/trash/${deleteMode.fileId}` });
      } else if (permanent) {
        // Suppression définitive directe (sans passer par la corbeille)
        if (deleteMode.isDirectory) {
          await Promise.all(deleteConfirmFiles.map((fn) =>
            executeDelete({ method: "delete", url: `/api/stuff/workspace/folder/${encodeURIComponent(JSON.stringify({ path, folderName: fn }))}` })
          ));
        } else {
          await Promise.all(deleteConfirmFiles.map((fn) =>
            executeDelete({ method: "delete", url: `/api/stuff/workspace/${JSON.stringify({ userId: user?.id, path, filename: fn })}` })
          ));
        }
      } else {
        // Déplacer vers la corbeille
        const ids = _data.filter((f) => deleteConfirmFiles.includes(f.name ?? "")).map((f) => f._id).filter(Boolean);
        await Promise.all(ids.map((id) =>
          executeDelete({ method: "patch", url: `/api/stuff/workspace/trash/${id}` })
        ));
      }
      if (deleteMode.isPermanent || permanent) enqueueSnackbar(t("trash.permanentSuccess"), { variant: "success" });
      else enqueueSnackbar(t("deleteConfirm.movedToTrash"), { variant: "success" });
    } catch {
      if (deleteMode.isDirectory) enqueueSnackbar(t("files.folderDeleteError"), { variant: "error" });
      else enqueueSnackbar(t("files.fileDeleteError"), { variant: "error" });
    }
    clearSelection(); setDeleteConfirmFiles([]); setDeleteMode({});
    document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
  }, [deleteConfirmFiles, deleteMode, getCurrentPath, user?.id, executeDelete, enqueueSnackbar, t, clearSelection]);

  useEffect(() => {
    const root = document.getElementById("root");
    const handler = (event: any) => {
      const fns: string[] = event.detail?.fileNames || [];
      if (fns.length > 0) {
        setDeleteConfirmFiles(fns);
        setDeleteMode({ isDirectory: event.detail?.isDirectory, isPermanent: event.detail?.isPermanent, fileId: event.detail?.fileId });
        setDeleteConfirmOpen(true);
      }
    };
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
    const viewProps = { data: _data, loading, selectedFiles, onToggleSelect: toggleSelect, allSelected, onSelectAll: selectAll, highlightFile };
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

        {!isSpecialView && <FolderBreadcrumb categoryLabel={FILES_LABEL} />}

        {isSpecialView ? (
          <MuiBox sx={{ display: "grid", flex: 1, minHeight: 0, overflow: "hidden", gridTemplateColumns: showDetail ? `1fr 1px ${detailWidth}px` : "1fr" }}>
            <MuiBox sx={{ minWidth: 0, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {isSpecialView === "favorites" && <FavoritesView selectedFiles={selectedFiles} onToggleSelect={toggleSelect} />}
              {isSpecialView === "recent" && <RecentView selectedFiles={selectedFiles} onToggleSelect={toggleSelect} />}
              {isSpecialView === "shared" && <SharedView />}
              {isSpecialView === "trash" && <TrashView selectedFiles={selectedFiles} onToggleSelect={toggleSelect} />}
            </MuiBox>
            {showDetail && <DetailResizeDivider onResize={setDetailWidth} minWidth={200} maxWidth={450} />}
            {showDetail && (
              <MuiBox sx={{ borderLeft: 1, borderColor: "divider", overflow: "auto" }}>
                <FileDetailPanel file={focusedFile} onClose={handleCloseDetail} onAction={handleDetailAction} />
              </MuiBox>
            )}
          </MuiBox>
        ) : (
          <>

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
      <DeleteConfirmDialog open={deleteConfirmOpen} fileNames={deleteConfirmFiles}
        isDirectory={deleteMode.isDirectory} isPermanent={deleteMode.isPermanent}
        onConfirm={handleDeleteConfirm}
        onClose={() => { setDeleteConfirmOpen(false); setDeleteConfirmFiles([]); setDeleteMode({}); }} />
      <UpdateToast open={showUpdateToast} onClose={hideToast} />
    </>
  );
}
