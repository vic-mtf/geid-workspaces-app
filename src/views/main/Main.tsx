import { Toolbar, Box as MuiBox, Divider } from "@mui/material";
import queryString from "query-string";
import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import ListView from "@/views/main/displays/list/ListView";
import ArchivesForm from "@/views/forms/archives/ArchivesForm";
import MediaLibraryForm from "@/views/forms/medialibrary/MediaLibraryForm";
import DetailFile from "@/views/main/displays/thumbnail/DetailFIle";
import RenameFile from "@/views/main/displays/thumbnail/RenameFile";
import FilePreview from "@/views/preview/FilePreview";
import ShareDialog from "@/views/dialogs/ShareDialog";
import DropZoneUpload from "@/components/dnd/DropZoneUpload";
import { closePreviewDialog } from "@/redux/ui";
import { connectWorkspaceSocket, disconnectWorkspaceSocket } from "@/services/socket";
import Thumbnail from "@/views/main/displays/thumbnail/Thumbnail";
import SubHeader from "@/views/main/sub-header/SubHeader";
import FilesForm from "@/views/forms/files/FilesForm";
import FolderBreadcrumb from "@/views/main/FolderBreadcrumb";
import useGetData from "@/utils/useGetData";
import { RootState } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  documents: "Documents",
  images: "Images",
  videos: "Vidéos",
  others: "Autres",
};

export default function Main() {
  const dispatch = useDispatch();
  const data = useSelector((store: RootState) => store.data);
  const reloadTrigger = useSelector((store: RootState) => store.ui.reloadTrigger);
  const viewMode = useSelector((store: RootState) => store.workspace.viewMode);
  const previewDialog = useSelector((store: RootState) => store.ui.previewDialog);
  const [shareFile, setShareFile] = useState<{ id: string; name: string } | null>(null);
  const { pathname, search } = useLocation();

  // Connect socket on mount
  useEffect(() => {
    connectWorkspaceSocket();
    return () => disconnectWorkspaceSocket();
  }, []);

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

  // Recharge le répertoire courant quand on navigue dans les dossiers
  useEffect(() => {
    getByKey(key, folder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, folder]);

  // Recharge quand un composant déclenche triggerReload()
  useEffect(() => {
    if (reloadTrigger > 0) {
      getByKey(key, folder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTrigger]);

  const { sort, order, display } = queryString.parse(search);

  const _data = useMemo(() => {
    let __data = [...((data as any)[key] || [])];
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
        <FolderBreadcrumb categoryLabel={CATEGORY_LABELS[key] ?? key} />
        <DropZoneUpload>
          <MuiBox height="calc(100% - 100px)" overflow="hidden">
            {viewMode === "list" ? (
              <ListView data={_data} />
            ) : (
              <Thumbnail data={_data} />
            )}
          </MuiBox>
        </DropZoneUpload>
      </MuiBox>
      <RenameFile />
      <DetailFile />
      <MediaLibraryForm />
      <ArchivesForm />
      <FilesForm />
      <FilePreview
        open={previewDialog.open}
        file={previewDialog.file}
        onClose={() => dispatch(closePreviewDialog())}
      />
      <ShareDialog
        open={!!shareFile}
        fileId={shareFile?.id ?? null}
        fileName={shareFile?.name ?? null}
        onClose={() => setShareFile(null)}
      />
    </React.Fragment>
  );
}
