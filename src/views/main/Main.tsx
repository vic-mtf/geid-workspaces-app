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
  const reloadTrigger = useSelector((store: RootState) => store.ui.reloadTrigger);
  const reduxData = useSelector((store: RootState) => store.data);
  const { pathname, search } = useLocation();

  // Données du sous-dossier (null = on est à la racine, utiliser Redux)
  const [subfolderData, setSubfolderData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

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

  const isSubfolder = folder !== "";

  // Charge le sous-dossier via API (seulement si on est dans un sous-dossier)
  const loadSubfolder = useCallback(() => {
    if (!isSubfolder) return;
    const fullPath = `${key}/${folder}`;
    setLoading(true);
    refetch(getUrlData({ path: fullPath }))
      .then(({ data: responseData }: any) => {
        setSubfolderData(Array.isArray(responseData) ? responseData : []);
      })
      .catch(() => {
        setSubfolderData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, folder, isSubfolder, refetch, getUrlData]);

  // Quand la catégorie ou le dossier change
  useEffect(() => {
    if (isSubfolder) {
      setSubfolderData(null); // Vider pendant le chargement
      loadSubfolder();
    } else {
      // Racine : on utilise les données Redux (chargées par Cover.tsx)
      setSubfolderData(null);
      setLoading(false);
    }
  }, [key, folder, isSubfolder, loadSubfolder]);

  // Reload trigger (après création/suppression/renommage)
  useEffect(() => {
    if (reloadTrigger > 0) {
      if (isSubfolder) {
        loadSubfolder();
      }
      // À la racine, les données Redux sont mises à jour par les hooks existants
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTrigger]);

  const { sort, order } = queryString.parse(search);

  // Source de données : Redux pour la racine, state local pour les sous-dossiers
  const rawData = isSubfolder ? (subfolderData ?? []) : ((reduxData as any)[key] || []);

  const _data = useMemo(() => {
    let __data = [...rawData];
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
  }, [rawData, sort, order]);

  // Loading seulement pour les sous-dossiers
  const showLoading = isSubfolder && loading;

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
            {showLoading ? (
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
