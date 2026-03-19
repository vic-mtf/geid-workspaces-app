import React, { useEffect, useRef, useState } from "react";
import Button from "../../../components/Button";
import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import getFileExtension, { getName } from "../../../utils/getFileExtension";
import fileExtensionBase from "../../../utils/fileExtensionBase";
import pluralize from "pluralize";
import DownloadsMenuDrawer from "./Downloads-menu-drawer/DownloadsMenuDrawer";
import useGetData from "../../../utils/useGetData";
import { RootState } from "../../../types";

export default function UploadFilesButton () {
    const uploadList = useRef<any[]>([]);
    const [loadNumber, setLoadNumber] = useState(0);
    const [open, setOpen] = useState(false);
    const {token, id: userId} =  useSelector((store: RootState) => store.user);
    const [removeList, setRemoveList] = useState<any[]>([]);
    const [, getDocs] = useGetData({
        key: 'documents',
        onBeforeUpdate (data: any) {
          return {
            ...data,
            others: [],
          }
        }
    });
    const [, getImages] = useGetData({ key: 'images' });
    const [, getVideos] = useGetData({
        key: 'videos',
        onBeforeUpdate (data: any) {
            return {
            ...data,
                audios: [],
            }
        }
    });

    useEffect(() => {
        const rootEl = document.getElementById('root');
        const handleReverseFile = (event: any) => {
            const files  = [...event.detail.files];
            files.forEach((file: File) => {
                let handleSend: ((id?: any, xhr?: XMLHttpRequest) => void) | null = null;
                (handleSend = (__id?: any, _xhr?: XMLHttpRequest) => {
                    const _id = typeof __id === 'number' ? __id : uploadList.current.length;
                    const xhr = _xhr || new XMLHttpRequest();
                    xhr.open('post', 'https://geidbudget.com/api/stuff/workspace');
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    const upload = xhr.upload;
                    const { type, icon } = fileExtensionBase.find(({exts}) =>
                        ~exts.indexOf(getFileExtension(file.name) ?? "")
                    ) || {};
                    let path: string;
                    if(type === 'video')
                        path = 'videos';
                    else if(type === 'image')
                        path = 'images';
                    else path = 'documents';

                    const filename = getName(file.name)
                    const infos: Record<string, any> = { userId, filename, path, file, ...event.detail.doc };
                    const data = new FormData();
                    Object.keys(infos).forEach(key => {
                        data.append(key, infos[key]);
                    });

                    xhr.onload = () => {
                        uploadList.current[_id] = {
                            ...uploadList.current[_id],
                            end: true,
                            loading: false,
                        };
                        setLoadNumber(nbr => nbr - 1);
                        if(path === 'images') getImages();
                        if(path === 'documents') getDocs();
                        if(path === 'videos') getVideos();
                        const root  = document.getElementById('root');
                        const name = '_load_all_data';
                        const customEvent = new CustomEvent(name);
                        root?.dispatchEvent(customEvent);
                    };
                    xhr.onabort = () => {
                        uploadList.current[_id] = {
                            ...uploadList.current[_id],
                            aborted: true,
                            loading: false,
                        };
                        setLoadNumber(nbr => nbr - 1);
                    }
                    xhr.upload.addEventListener('progress', (event: ProgressEvent) => {
                        const total =  event.total;
                        const loaded = event.loaded;
                        uploadList.current[_id] = {
                            ...uploadList.current[_id],
                            total,
                            loaded,
                        };
                    })
                    xhr.onloadstart = () => {
                        uploadList.current[_id] = {
                            ...uploadList.current[_id],
                            end: false,
                            loading: true,
                        }
                        setLoadNumber(nbr => nbr + 1);
                    };

                    uploadList.current[_id] = {
                        xhr,
                        upload,
                        data,
                        icon,
                        type,
                        end : null,
                        file,
                        aborted: false,
                        loading: false,
                        _id: `${type}_${file?.name}_${_id}`,
                        resend() {
                            delete uploadList.current[_id];
                            handleSend!(_id, new XMLHttpRequest());
                        },
                        cancel () {
                            xhr.abort();
                            uploadList.current[_id] = {
                                ...uploadList.current[_id],
                                aborted: true,
                                end: null,
                            };
                        },
                        remove() {
                            const data = uploadList.current[_id]
                            delete uploadList.current[_id];
                            setRemoveList((_data: any[]) => [..._data, data]);
                        }
                    };
                    xhr.send(data);
                })();
            });
        }
        rootEl?.addEventListener('_upload_files', handleReverseFile) ;
        return ()  => {
            rootEl?.removeEventListener('_upload_files', handleReverseFile);
        }
    }, [token, userId, getImages, getVideos, getDocs]);

    useEffect(() => {
        const root = document.getElementById('root');
        const name = '_open_download_drawer';
        const handleOpenDownloadDrawer = () => setOpen(!open);
        root?.addEventListener(
            name,
            handleOpenDownloadDrawer
        );
        return () => {
            root?.removeEventListener(
                name,
                handleOpenDownloadDrawer
            );
        }
    }, [open, setOpen]);

    return (
        <React.Fragment>
            {!!loadNumber &&
            <Button
                startIcon={<CircularProgress size={15} color="inherit"/>}
                color="inherit"
                onClick={() => setOpen(open => !open)}
            >
                Chargement de {pluralize('élement', loadNumber, true)}
            </Button>}
            <DownloadsMenuDrawer
                open={open}
                onClose={() => setOpen(false)}
                loadingList={
                    uploadList.current
                    .filter(({_id}) => !removeList.find((item: any) => item?._id === _id ))
                }
                loadNumber={loadNumber}
            />
        </React.Fragment>
    );
}
