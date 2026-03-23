import React, { useEffect, useRef, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import getFileExtension, { getName } from "@/utils/getFileExtension";
import fileExtensionBase from "@/utils/fileExtensionBase";
import pluralize from "pluralize";
import DownloadsMenuDrawer from "@/views/main/sub-header/Downloads-menu-drawer/DownloadsMenuDrawer";
import useGetData from "@/utils/useGetData";
import { RootState } from "@/types";
import { clearUploadFiles } from "@/redux/ui";

export default function UploadFilesButton() {
  const uploadList = useRef<any[]>([]);
  const [loadNumber, setLoadNumber] = useState(0);
  const dispatch = useDispatch();
  const open = useSelector((store: RootState) => store.ui.downloadDrawerOpen);
  const uploadPayload = useSelector((store: RootState) => store.ui.uploadFiles);
  const { token, id: userId } = useSelector((store: RootState) => store.user);
  const [removeList, setRemoveList] = useState<any[]>([]);
  const { pathname, search } = useLocation();

  const [, getDocs] = useGetData({
    key: "documents",
    onBeforeUpdate(data: any) {
      return { ...data, others: [] };
    },
  });
  const [, getImages] = useGetData({ key: "images" });
  const [, getVideos] = useGetData({
    key: "videos",
    onBeforeUpdate(data: any) {
      return { ...data, audios: [] };
    },
  });

  // Détermine le chemin complet courant (catégorie + sous-dossier)
  const getCurrentPath = () => {
    const params = new URLSearchParams(search);
    const folder = params.get("folder") || "";
    const cat = ["images", "videos", "others"].find((c) => pathname.includes(c)) ?? "documents";
    return folder ? `${cat}/${folder}` : cat;
  };

  const getCurrentCategory = () => {
    if (pathname.includes("images")) return "images";
    if (pathname.includes("videos")) return "videos";
    if (pathname.includes("others")) return "others";
    return "documents";
  };

  const getCurrentFolder = () => {
    return new URLSearchParams(search).get("folder") || "";
  };

  // Écoute les uploads déclenchés par Redux
  useEffect(() => {
    if (!uploadPayload) return;
    const { files, doc } = uploadPayload;
    dispatch(clearUploadFiles());

    files.forEach((file: File) => {
      let handleSend: ((id?: any, xhr?: XMLHttpRequest) => void) | null = null;
      (handleSend = (__id?: any, _xhr?: XMLHttpRequest) => {
        const _id = typeof __id === "number" ? __id : uploadList.current.length;
        const xhr = _xhr || new XMLHttpRequest();
        xhr.open("post", `${import.meta.env.VITE_SERVER_BASE_URL}/api/stuff/workspace`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        const upload = xhr.upload;
        const { type, icon } = fileExtensionBase.find(({ exts }) =>
          ~exts.indexOf(getFileExtension(file.name) ?? "")
        ) || {};

        // Utilise le chemin courant (catégorie + dossier) comme destination
        const path = getCurrentPath();
        const category = getCurrentCategory();
        const folder = getCurrentFolder();

        const filename = getName(file.name);
        const infos: Record<string, any> = {
          userId,
          filename,
          path,
          file,
          ...doc,
        };
        const data = new FormData();
        Object.keys(infos).forEach((key) => {
          data.append(key, infos[key]);
        });

        xhr.onload = () => {
          uploadList.current[_id] = {
            ...uploadList.current[_id],
            end: true,
            loading: false,
          };
          setLoadNumber((nbr) => nbr - 1);
          // Rafraîchit la catégorie courante au bon niveau de dossier
          if (category === "images") getImages({ folder });
          else if (category === "videos") getVideos({ folder });
          else getDocs({ folder });
        };
        xhr.onabort = () => {
          uploadList.current[_id] = {
            ...uploadList.current[_id],
            aborted: true,
            loading: false,
          };
          setLoadNumber((nbr) => nbr - 1);
        };
        xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
          uploadList.current[_id] = {
            ...uploadList.current[_id],
            total: event.total,
            loaded: event.loaded,
          };
        });
        xhr.onloadstart = () => {
          uploadList.current[_id] = {
            ...uploadList.current[_id],
            end: false,
            loading: true,
          };
          setLoadNumber((nbr) => nbr + 1);
        };

        uploadList.current[_id] = {
          xhr,
          upload,
          data,
          icon,
          type,
          end: null,
          file,
          aborted: false,
          loading: false,
          _id: `${type}_${file?.name}_${_id}`,
          resend() {
            delete uploadList.current[_id];
            handleSend!(_id, new XMLHttpRequest());
          },
          cancel() {
            xhr.abort();
            uploadList.current[_id] = {
              ...uploadList.current[_id],
              aborted: true,
              end: null,
            };
          },
          remove() {
            const item = uploadList.current[_id];
            delete uploadList.current[_id];
            setRemoveList((_data: any[]) => [..._data, item]);
          },
        };
        xhr.send(data);
      })();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadPayload]);

  return (
    <React.Fragment>
      {!!loadNumber && (
        <Button
          startIcon={<CircularProgress size={15} color="inherit" />}
          color="inherit"
          onClick={() => dispatch({ type: "ui/toggleDownloadDrawer" })}
        >
          Chargement de {pluralize("élement", loadNumber, true)}
        </Button>
      )}
      <DownloadsMenuDrawer
        open={open}
        onClose={() => dispatch({ type: "ui/toggleDownloadDrawer" })}
        loadingList={uploadList.current.filter(
          ({ _id }) => !removeList.find((item: any) => item?._id === _id)
        )}
        loadNumber={loadNumber}
      />
    </React.Fragment>
  );
}
