import { Toolbar, Box as MuiBox, Divider, useTheme, useMediaQuery, CircularProgress } from "@mui/material";
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
import MainLayout from "@/components/Main";
import { closePreviewDialog, closeShareDialog } from "@/redux/ui";
import { connectWorkspaceSocket, disconnectWorkspaceSocket } from "@/services/socket";
import Thumbnail from "@/views/main/displays/thumbnail/Thumbnail";
import SubHeader from "@/views/main/sub-header/SubHeader";
import FilesForm from "@/views/forms/files/FilesForm";
import FolderBreadcrumb from "@/views/main/FolderBreadcrumb";
import useAxios from "@/utils/useAxios";
import { useGetUrlData } from "@/utils/useGetData";
import { RootState } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  documents: "Documents",
  images: "Images",
  videos: "Vidéos",
  others: "Autres",
};

export default function Main() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const viewMode = useSelector((store: RootState) => store.workspace.viewMode);
  const previewDialog = useSelector((store: RootState) => store.ui.previewDialog);
  const shareDialog = useSelector((store: RootState) => store.ui.shareDialog);
  const { pathname, search } = useLocation();

  // Données locales au lieu de Redux pour éviter les données stale
  const [localData, setLocalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getUrlData = useGetUrlData();
  const [, refetch] = useAxios(null as any, { manual: true });

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

  const reloadTrigger = useSelector((store: RootState) => store.ui.reloadTrigger);

  // Charge les données directement via API — plus de dépendance au Redux data
  const loadData = useCallback(() => {
    const fullPath = folder ? `${key}/${folder}` : key;
    setLoading(true);
    refetch(getUrlData({ path: fullPath }))
      .then(({ data: responseData }: any) => {
        setLocalData(Array.isArray(responseData) ? responseData : []);
      })
      .catch(() => {
        setLocalData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, folder, refetch, getUrlData]);

  useEffect(() => {
    setLocalData([]); // Vider immédiatement
    loadData();
  }, [key, folder, loadData]);

  useEffect(() => {
    if (reloadTrigger > 0) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTrigger]);

  const { sort, order } = queryString.parse(search);

  const _data = useMemo(() => {
    let __data = [...localData];
    if (!sort || sort === "name")
      __data.sort((a: any, b: any) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        const nameA = (a?.name || "").toUpperCase();
        const nameB = (b?.name || "").toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
    if (sort === "date")
      __data.sort(
        (a: any, b: any) =>
          new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime()
      );
    if (order === "descending") __data = __data.reverse();
    return __data;
  }, [localData, sort, order]);

  return (
    <React.Fragment>
      <MainLayout>
        <Toolbar variant="dense" />
        <SubHeader />
        <Divider />
        <FolderBreadcrumb categoryLabel={CATEGORY_LABELS[key] ?? key} />
        <DropZoneUpload>
          <MuiBox
            overflow="auto"
            display="flex"
            flex={1}
            minHeight={0}
            sx={{ pb: isMobile ? "56px" : 0 }}
          >
            {loading ? (
              <MuiBox display="flex" justifyContent="center" alignItems="center" flex={1}>
                <CircularProgress size={28} />
              </MuiBox>
            ) : viewMode === "list" ? (
              <ListView data={_data} />
            ) : (
              <Thumbnail data={_data} />
            )}
          </MuiBox>
        </DropZoneUpload>
      </MainLayout>
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
        open={shareDialog.open}
        fileId={shareDialog.file?.doc?._id || shareDialog.file?._id || null}
        fileName={shareDialog.file?.name ?? null}
        onClose={() => dispatch(closeShareDialog())}
      />
    </React.Fragment>
  );
}
