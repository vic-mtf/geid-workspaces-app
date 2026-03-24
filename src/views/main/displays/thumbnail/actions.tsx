import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import React from 'react';
import removeFile from '@/views/main/displays/thumbnail/removeFile';
import { ActionOption } from '@/types';

const actions: ActionOption[] = [
    {
        label: 'Ouvrir',
        icon: <LaunchOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_file_preview';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
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

        }
    },
    {
        label: 'Renommer',
        icon: <EditOutlinedIcon/>,
        onClick: (file: any) => {
            const customEvent = new CustomEvent(
                '_open_rename_file_name',
                {
                    detail : {
                        name: '_open_rename_file_name',
                        file,
                    }
                }
            );
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: 'Envoyer vers',
        icon: <SendOutlinedIcon/>,
        options: [
            {
                label: 'Le service d\'archivage',
                onClick: (file: any) => {
                    const name = '_open_archives_form';
                    const customEvent = new CustomEvent(name, { detail : {name,file, } });
                    document.getElementById('root')
                    ?.dispatchEvent(customEvent);
                }
            },
            {
                label: 'La mediathèque',
                onClick: (file: any) => {
                    const name = '_open_media_library_form';
                    const customEvent = new CustomEvent(name, { detail : {name,file, } });
                    document.getElementById('root')
                    ?.dispatchEvent(customEvent);
                }
            }
        ]
    },
    {
        label: 'Ajouter aux favoris',
        icon: <StarBorderOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_toggle_favorite';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: 'Déplacer vers',
        icon: <DriveFileMoveOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_move_dialog';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: 'Copier dans',
        icon: <ContentCopyOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_copy_dialog';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: 'Tags',
        icon: <LocalOfferOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_tags_dialog';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: 'Partager',
        icon: <ShareOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_share_dialog';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: 'Supprimer',
        icon: <DeleteOutlinedIcon/>,
        onClick: removeFile as any,
    },
    {
        label: 'Detail',
        icon: <InfoOutlinedIcon/>,
        onClick: (file: any) => {
            const customEvent = new CustomEvent(
                '_open_detail_file',
                {
                    detail : {
                        name: '_open_detail_file',
                        file,
                    }
                }
            );
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },

];

export default actions;
