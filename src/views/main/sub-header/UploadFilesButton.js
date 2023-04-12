import React, { useEffect, useRef, useState } from "react";
import Button from "../../../components/Button";
import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import getFileExtension, { getName } from "../../../utils/getFileExtention";
import fileExtensionBase from "../../../utils/fileExtensionBase";
import pluralize from "pluralize";
import DownloadsMenuDrawer from "./Downloads-menu-drawer/DownloadsMenuDrawer";
//import { useData } from "../../../utils/DataProvider";

export default function UploadFilesButton () {
    const uploadList = useRef([]);
    const [loadNumber, setLoadNumber] = useState(0);
    const [open, setOpen] = useState(false);
    const {token, id: userId} =  useSelector(store => store.user);
    const [removeList, setRemoveList] = useState([]);
    //const [,{docRefresh, photoRefresh, videoRefresh}] = useData();

    useEffect(() => {
        const rootEl = document.getElementById('root');
        const handleReveFile = event => {
            const files  = [...event.detail.files];
            files.forEach(file => {
                let handleSend = null;
                (handleSend = (__id, _xhr) => {
                    const _id = typeof __id === 'number' ? __id : uploadList.current.length;
                    const xhr = _xhr || new XMLHttpRequest();
                    xhr.open('post', 'https://geidbudget.com/api/stuff/workspace');
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    const upload = xhr.upload;
                    const { type, icon } = fileExtensionBase.find(({exts}) => 
                        ~exts.indexOf(getFileExtension(file.name))
                    ) || {};
                    let path;
                    console.log(type);
                    if(type === 'video')
                        path = 'videos';
                    else if(type === 'image')
                        path = 'images';
                    else path = 'documents';

                    const filename = getName(file.name)
                    const infos = { userId, filename, path, file };
                    const data = new FormData();
                    Object.keys(infos).forEach(key => {
                        data.append(key, infos[key]);
                    });

                    xhr.onload = event => {
                        uploadList.current[_id] = {
                            ...uploadList.current[_id],
                            end: true,
                            loading: false,
                        };
                        setLoadNumber(nbr => nbr - 1);
                        // if(path === 'images') photoRefresh();
                        // if(path === 'documents') docRefresh();
                        // if(path === 'videos') videoRefresh();
                        const root  = document.getElementById('root');
                        const name = '_load_all_data';
                        const customEvent = new CustomEvent(name);
                        root.dispatchEvent(customEvent);
                    };
                    xhr.onabort = () => {
                        uploadList.current[_id] = {
                            ...uploadList.current[_id],
                            aborted: true,
                            loading: false,
                        };
                        setLoadNumber(nbr => nbr - 1);
                    }
                    xhr.upload.addEventListener('progress', event => {
                        const total =  event.total;
                        const loaded = event.loaded;
                        uploadList.current[_id] = {
                            ...uploadList.current[_id],
                            total,
                            loaded,
                        };
                    })
                    xhr.onloadstart = event => {
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
                            handleSend(_id, new XMLHttpRequest());
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
                            setRemoveList(_data => [..._data, data]);
                        }
                    };
                    xhr.send(data);
                })();
            });
        }
        rootEl.addEventListener('_upload_files', handleReveFile) ;
        return ()  => {
            rootEl.removeEventListener('_upload_files', handleReveFile);
        }              
    }, [token, userId
        //docRefresh, photoRefresh, videoRefresh
    ]);

    useEffect(() => {
        const root = document.getElementById('root');
        const name = '_open_download_drawer';
        const handleOpenDownloadDrawer = () => setOpen(!open);
        root.addEventListener(
            name,
            handleOpenDownloadDrawer
        );
        return () => {
            root.removeEventListener(
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
                    .filter(({_id}) => !removeList.find(item => item?._id === _id ))}
                loadNumber={loadNumber}
            />
        </React.Fragment>
    );
}