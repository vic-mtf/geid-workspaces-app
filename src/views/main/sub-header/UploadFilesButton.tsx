import React, { useEffect, useRef, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import getFileExtension, { getName } from "@/utils/getFileExtension";
import fileExtensionBase from "@/utils/fileExtensionBase";
import DownloadsMenuDrawer from "@/views/main/sub-header/Downloads-menu-drawer/DownloadsMenuDrawer";
import parseFolderUpload from "@/utils/parseFolderUpload";
import useGetData from "@/utils/useGetData";
import { RootState } from "@/types";

export default function UploadFilesButton() {
  const { t } = useTranslation();
  const uploadList = useRef<any[]>([]);
  const [loadNumber, setLoadNumber] = useState(0);
  const [open, setOpen] = useState(false);
  const { token, id: userId } = useSelector((store: RootState) => store.user);
  const [removeList, setRemoveList] = useState<any[]>([]);
  const { pathname, search } = useLocation();

  const [, getFiles] = useGetData({ key: "files" });

  const getCurrentPath = () => new URLSearchParams(search).get("folder") || "";
  const getCurrentFolder = () => new URLSearchParams(search).get("folder") || "";

  useEffect(() => {
    const rootEl = document.getElementById("root");
    const handleReverseFile = async (event: any) => {
      const files = [...event.detail.files];
      const basePath = getCurrentPath();

      // Détecte si c'est un upload de dossier (webkitRelativePath)
      const isFolder = files.some((f: any) => f.webkitRelativePath && f.webkitRelativePath.includes("/"));
      if (isFolder) {
        const parsed = parseFolderUpload(files);
        if (parsed.subFolders.length > 0 || parsed.rootName) {
          const rootFolder = basePath ? `${basePath}/${parsed.rootName}` : parsed.rootName;
          const allFolders = [parsed.rootName, ...parsed.subFolders.map((sf) => `${parsed.rootName}/${sf}`)];
          try {
            await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/stuff/workspace/folder/tree`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ basePath, folders: allFolders }),
            });
          } catch { /* ignore — folders may already exist */ }

          // Upload chaque fichier valide avec son chemin relatif
          for (const { file, relativePath } of parsed.validFiles) {
            const filePath = basePath ? `${basePath}/${parsed.rootName}/${relativePath.split("/").slice(0, -1).join("/")}` : `${parsed.rootName}/${relativePath.split("/").slice(0, -1).join("/")}`;
            const uploadPath = filePath.replace(/\/+$/, "") || basePath;
            uploadSingleFile(file, uploadPath, event.detail.doc);
          }
          return;
        }
      }

      files.forEach((file: File) => {
        uploadSingleFile(file, basePath, event.detail.doc);
      });
    };

    const uploadSingleFile = (file: File, path: string, doc?: any) => {
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

          const filename = getName(file.name);
          const infos: Record<string, any> = {
            userId,
            filename,
            path,
            file,
            ...(doc || {}),
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
            // Rafraîchit le dossier courant
            getFiles({ folder: getCurrentFolder() });
            const root = document.getElementById("root");
            root?.dispatchEvent(new CustomEvent("_reload_current_dir"));
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
    };
    rootEl?.addEventListener("_upload_files", handleReverseFile);
    return () => {
      rootEl?.removeEventListener("_upload_files", handleReverseFile);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId, getFiles, pathname, search]);

  useEffect(() => {
    const root = document.getElementById("root");
    const handleOpenDrawer = () => setOpen(!open);
    root?.addEventListener("_open_download_drawer", handleOpenDrawer);
    return () => root?.removeEventListener("_open_download_drawer", handleOpenDrawer);
  }, [open]);

  return (
    <React.Fragment>
      {!!loadNumber && (
        <Button
          startIcon={<CircularProgress size={15} color="inherit" />}
          color="inherit"
          onClick={() => setOpen((o) => !o)}
        >
          {t("files.loadingElements", { count: loadNumber })}
        </Button>
      )}
      <DownloadsMenuDrawer
        open={open}
        onClose={() => setOpen(false)}
        loadingList={uploadList.current.filter(
          ({ _id }) => !removeList.find((item: any) => item?._id === _id)
        )}
        loadNumber={loadNumber}
      />
    </React.Fragment>
  );
}
