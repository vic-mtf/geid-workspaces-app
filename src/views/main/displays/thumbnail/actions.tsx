import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import React from 'react';
import removeFile from '@/views/main/displays/thumbnail/removeFile';
import {
    openRenameDialog,
    openDetailDialog,
    openArchivesForm,
    openMediaLibraryForm,
    openPreviewDialog,
    openShareDialog,
} from '@/redux/ui';
import { ActionOption } from '@/types';

const actions: ActionOption[] = [
    {
        label: 'Aperçu',
        icon: <LaunchOutlinedIcon/>,
        onClick: (file: any) => {
            file?._dispatch?.(openPreviewDialog(file));
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
        label: 'Ajouter aux favoris',
        icon: <StarOutlinedIcon/>,
        onClick: (file: any) => {
            if (file?._id || file?.doc?._id) {
                const id = file._id || file.doc._id;
                fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/stuff/workspace/favorite/${id}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${file?.user?.token}` },
                })
                .then((res) => {
                    if (res.ok) file?.enqueueSnackbar?.("Favori mis à jour.", { variant: "success" });
                    else file?.enqueueSnackbar?.("Impossible de modifier le favori.", { variant: "error" });
                })
                .catch(() => {
                    file?.enqueueSnackbar?.("Impossible de modifier le favori.", { variant: "error" });
                });
            }
        }
    },
    {
        label: 'Renommer',
        icon: <EditOutlinedIcon/>,
        onClick: (file: any) => {
            file?._dispatch?.(openRenameDialog(file));
        }
    },
    {
        label: 'Envoyer vers',
        icon: <SendOutlinedIcon/>,
        options: [
            {
                label: 'Le service d\'archivage',
                onClick: (file: any) => {
                    file?._dispatch?.(openArchivesForm(file));
                }
            },
            {
                label: 'La mediathèque',
                onClick: (file: any) => {
                    file?._dispatch?.(openMediaLibraryForm(file));
                }
            }
        ]
    },
    {
        label: 'Partager',
        icon: <ShareOutlinedIcon/>,
        onClick: (file: any) => {
            file?._dispatch?.(openShareDialog(file));
        }
    },
    {
        label: 'Supprimer',
        icon: <DeleteOutlinedIcon/>,
        onClick: removeFile as any,
    },
    {
        label: 'Détail',
        icon: <InfoOutlinedIcon/>,
        onClick: (file: any) => {
            file?._dispatch?.(openDetailDialog(file));
        }
    },
];

export default actions;
