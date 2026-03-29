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
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import React from 'react';
import store from '@/redux/store';
import removeFile from '@/views/main/displays/thumbnail/removeFile';
import { ActionOption } from '@/types';
import i18n from '@/i18n/i18n';

const actions: (ActionOption & { views?: string[] })[] = [
    {
        label: i18n.t('common.open'),
        icon: <LaunchOutlinedIcon/>,
        views: ['files', 'recent', 'favorites'],
        onClick: (file: any) => {
            document.getElementById('root')?.dispatchEvent(new CustomEvent('_open_file_preview', { detail: { name: '_open_file_preview', file } }));
        }
    },
    {
        label: i18n.t('common.goToLocation'),
        icon: <FolderOpenOutlinedIcon/>,
        views: ['recent', 'favorites'],
        onClick: (file: any) => {
            document.getElementById('root')?.dispatchEvent(new CustomEvent('_go_to_location', { detail: { file } }));
        }
    },
    {
        label: i18n.t('common.download'),
        icon: <FileDownloadOutlinedIcon/>,
        views: ['files', 'recent', 'favorites'],
        onClick: (file: any) => {
            const token = store.getState().user.token;
            fetch(file?.url, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => response.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = file?.name;
                    link.target = '_blank';
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                });
        }
    },
    {
        label: i18n.t('common.rename'),
        icon: <EditOutlinedIcon/>,
        views: ['files'],
        onClick: (file: any) => {
            document.getElementById('root')?.dispatchEvent(new CustomEvent('_trigger_inline_rename', { detail: { fileName: file?.name } }));
        }
    },
    {
        label: i18n.t('actions.sendTo'),
        icon: <SendOutlinedIcon/>,
        views: ['files'],
        options: [
            {
                label: i18n.t('archives.sendToArchives'),
                onClick: (file: any) => {
                    document.getElementById('root')?.dispatchEvent(new CustomEvent('_open_archives_form', { detail: { name: '_open_archives_form', file } }));
                }
            },
            {
                label: i18n.t('archives.sendToMediaLibrary'),
                onClick: (file: any) => {
                    document.getElementById('root')?.dispatchEvent(new CustomEvent('_open_media_library_form', { detail: { name: '_open_media_library_form', file } }));
                }
            }
        ]
    },
    {
        label: i18n.t('favorites.addToFavorites'),
        icon: <StarBorderOutlinedIcon/>,
        views: ['files', 'recent', 'favorites'],
        onClick: (file: any) => {
            document.getElementById('root')?.dispatchEvent(new CustomEvent('_toggle_favorite', { detail: { name: '_toggle_favorite', file } }));
        }
    },
    {
        label: i18n.t('common.move'),
        icon: <DriveFileMoveOutlinedIcon/>,
        views: ['files'],
        onClick: (file: any) => {
            document.getElementById('root')?.dispatchEvent(new CustomEvent('_open_move_dialog', { detail: { name: '_open_move_dialog', file } }));
        }
    },
    {
        label: i18n.t('common.copy'),
        icon: <ContentCopyOutlinedIcon/>,
        views: ['files'],
        onClick: (file: any) => {
            document.getElementById('root')?.dispatchEvent(new CustomEvent('_open_copy_dialog', { detail: { name: '_open_copy_dialog', file } }));
        }
    },
    {
        label: i18n.t('tags.title'),
        icon: <LocalOfferOutlinedIcon/>,
        views: ['files', 'recent', 'favorites'],
        onClick: (file: any) => {
            document.getElementById('root')?.dispatchEvent(new CustomEvent('_open_tags_dialog', { detail: { name: '_open_tags_dialog', file } }));
        }
    },
    {
        label: i18n.t('common.share'),
        icon: <ShareOutlinedIcon/>,
        views: ['files'],
        onClick: (file: any) => {
            document.getElementById('root')?.dispatchEvent(new CustomEvent('_open_share_dialog', { detail: { name: '_open_share_dialog', file } }));
        }
    },
    {
        label: i18n.t('common.delete'),
        icon: <DeleteOutlinedIcon/>,
        views: ['files'],
        onClick: removeFile as any,
    },
    {
        label: i18n.t('detail.title'),
        icon: <InfoOutlinedIcon/>,
        views: ['files', 'recent', 'favorites'],
        onClick: (file: any) => {
            document.getElementById('root')?.dispatchEvent(new CustomEvent('_open_detail_file', { detail: { name: '_open_detail_file', file } }));
        }
    },
];

export default actions;
