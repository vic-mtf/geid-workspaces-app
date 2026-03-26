import { Toolbar, Box as MuiBox, Divider } from "@mui/material";
import queryString from "query-string";
import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { updateData, setFolderCache, invalidateFolderCache, type FolderCacheEntry } from "@/redux/data";
import ArchivesForm from "@/views/forms/archives/ArchivesForm";
import MediaLibraryForm from "@/views/forms/medialibrary/MediaLibraryForm";
import DetailFile from "@/views/main/displays/thumbnail/DetailFile";
import RenameFile from "@/views/main/displays/thumbnail/RenameFile";
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
import useGetData from "@/utils/useGetData";
import { RootState } from "@/types";
import FavoritesView from "@/views/favorites/FavoritesView";
import RecentView from "@/views/recent/RecentView";
import TrashView from "@/views/trash/TrashView";

export default function Main() {
  const { t } = useTranslation();
  const CATEGORY_LABELS: Record<string, string> = {
    documents: t("nav.documents"),
    images: t("nav.images"),
    videos: t("nav.videos"),
    others: t("nav.others"),
  };
  const data = useSelector((store: RootState) => store.data);
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();

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

  const folder = useMemo(
    () => new URLSearchParams(search).get("folder") || "",
    [search]
  );

  const [, getDocs] = useGetData({
    key: "documents",
    onBeforeUpdate(d: any) { return { ...d, others: [] }; },
  });
  const [, getImages] = useGetData({ key: "images" });
  const [, getVideos] = useGetData({
    key: "videos",
    onBeforeUpdate(d: any) { return { ...d, audios: [] }; },
  });

  const getByKey = useCallback(
    (k: string, f: string) => {
      if (k === "images") return getImages({ folder: f });
      if (k === "videos") return getVideos({ folder: f });
      return getDocs({ folder: f });
    },
    [getDocs, getImages, getVideos]
  );

  const [loading, setLoading] = useState(false);
  const STALE_TIME = 30_000; // 30 secondes — au-delà, on revalide en arrière-plan

  // Cache par chemin (catégorie + sous-dossier)
  const cachePath = folder ? `${key}/${folder}` : key;
  const folderCache = useSelector((store: RootState) =>
    ((store.data as any).folderCache as Record<string, FolderCacheEntry>)?.[cachePath]
  );

  useEffect(() => {
    // Si en cache et frais → afficher directement, pas de loading
    if (folderCache?.data) {
      dispatch(updateData({ data: { [key]: folderCache.data } }));

      // Revalider en arrière-plan si stale
      if (Date.now() - folderCache.timestamp > STALE_TIME) {
        getByKey(key, folder).then(() => {
          // Le getByKey dispatch updateData, on met aussi à jour le cache
          // Sera fait dans le _reload handler
        });
      }
      return;
    }

    // Pas de cache → fetch avec loading
    setLoading(true);
    getByKey(key, folder).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, folder]);

  // Écoute l'événement _reload_current_dir (après création/suppression/renommage)
  // Invalide le cache du dossier courant et refetch
  useEffect(() => {
    const root = document.getElementById("root");
    const handler = () => {
      dispatch(invalidateFolderCache(cachePath));
      getByKey(key, folder);
    };
    root?.addEventListener("_reload_current_dir", handler);
    return () => root?.removeEventListener("_reload_current_dir", handler);
  }, [key, folder, getByKey, cachePath, dispatch]);

  const { sort, order, display } = queryString.parse(search);

  const SYSTEM_FILES = new Set(["thumbs.db", "Thumbs.db", ".gitkeep", ".DS_Store"]);

  const _data = useMemo(() => {
    let __data = [...((data as any)[key] || [])]
      .filter((f: any) => f.name && !f.name.startsWith(".") && !SYSTEM_FILES.has(f.name));
    if (!sort || sort === "name")
      __data?.sort((a: any, b: any) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        const nameA = (a?.name || "").toUpperCase();
        const nameB = (b?.name || "").toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
    if (sort === "date")
      __data?.sort(
        (a: any, b: any) =>
          new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime()
      );
    if (!order || order === "ascending") { /* ascending is default */ }
    if (order === "descending") __data = __data?.reverse();
    return __data;
  }, [key, data, sort, order]);

  return (
    <React.Fragment>
      <MuiBox component="main" sx={{ flexGrow: 1, px: 0.5, width: "100%" }}>
        <Toolbar variant="dense" />
        <SubHeader />
        <Divider />
        {isSpecialView ? (
          <MuiBox height="calc(100% - 100px)" overflow="hidden" display="flex" flexDirection="column">
            {isSpecialView === "favorites" && <FavoritesView />}
            {isSpecialView === "recent" && <RecentView />}
            {isSpecialView === "trash" && <TrashView />}
          </MuiBox>
        ) : (
          <>
            <FolderBreadcrumb categoryLabel={CATEGORY_LABELS[key] ?? key} />
            <DropZone>
              <MuiBox height="calc(100% - 100px)" overflow="hidden">
                {(!display || display === "thumbnail") && <Thumbnail data={_data} loading={loading} />}
                {display === "list" && <ListView data={_data} loading={loading} />}
              </MuiBox>
            </DropZone>
          </>
        )}
      </MuiBox>
      <RenameFile />
      <DetailFile />
      <MediaLibraryForm />
      <ArchivesForm />
      <FilesForm />
      <FilePreviewDialog />
      <FavoriteHandler />
      <MoveFileHandler />
      <CopyFileHandler />
      <ShareDialog />
      <TagsDialog />
    </React.Fragment>
  );
}
