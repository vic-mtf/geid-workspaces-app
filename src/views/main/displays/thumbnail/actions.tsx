import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import React from 'react';
import removeFile from '@/views/main/displays/thumbnail/removeFile';
import store from '@/redux/store';
import {
    openRenameDialog,
    openDetailDialog,
    openArchivesForm,
    openMediaLibraryForm,
} from '@/redux/ui';
import { ActionOption } from '@/types';

const actions: ActionOption[] = [
    {
        label: 'Ouvrir',
        icon: <LaunchOutlinedIcon/>,
        onClick: (file: any) => {
            const link = document.createElement('a');
            link.href = file?.url;
            link.target = '_blank';
            link.click();
        }
    },
    {
        label: 'Télécharger',
        icon: <FileDownloadOutlinedIcon/>,
        onClick: (file: any) => {
            fetch(file?.url)
            .then(response => response.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = file?.name;
                link.target = '_blank';
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            })
            .catch(() => {
                file?.enqueueSnackbar?.("Le téléchargement a échoué.", { variant: "error" });
            });
        }
    },
    {
        label: 'Supprimer',
        icon: <DeleteOutlinedIcon/>,
        onClick: removeFile as any,
    },
    {
        label: 'Renommer',
        icon: <EditOutlinedIcon/>,
        onClick: (file: any) => {
            store.dispatch(openRenameDialog(file));
        }
    },
    {
        label: 'Envoyer vers',
        icon: <SendOutlinedIcon/>,
        options: [
            {
                label: 'Le service d\'archivage',
                onClick: (file: any) => {
                    store.dispatch(openArchivesForm(file));
                }
            },
            {
                label: 'La mediathèque',
                onClick: (file: any) => {
                    store.dispatch(openMediaLibraryForm(file));
                }
            }
        ]
    },
    {
        label: 'Partager',
        disabled: true,
        icon: <ShareOutlinedIcon/>
    },
    {
        label: 'Detail',
        icon: <InfoOutlinedIcon/>,
        onClick: (file: any) => {
            store.dispatch(openDetailDialog(file));
        }
    },
];

export default actions;
