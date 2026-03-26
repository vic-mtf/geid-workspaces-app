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
import store from '@/redux/store';
import removeFile from '@/views/main/displays/thumbnail/removeFile';
import { ActionOption } from '@/types';
import i18n from '@/i18n/i18n';

const actions: ActionOption[] = [
    {
        label: i18n.t('common.open'),
        icon: <LaunchOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_file_preview';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: i18n.t('common.download'),
        icon: <FileDownloadOutlinedIcon/>,
        onClick: (file: any) => {
            const token = store.getState().user.token;
            fetch(file?.url, {
                headers: { Authorization: `Bearer ${token}` },
            })
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
        label: i18n.t('common.rename'),
        icon: <EditOutlinedIcon/>,
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
    {
        label: i18n.t('actions.sendTo'),
        icon: <SendOutlinedIcon/>,
        options: [
            {
                label: i18n.t('archives.sendToArchives'),
                onClick: (file: any) => {
                    const name = '_open_archives_form';
                    const customEvent = new CustomEvent(name, { detail : {name,file, } });
                    document.getElementById('root')
                    ?.dispatchEvent(customEvent);
                }
            },
            {
                label: i18n.t('archives.sendToMediaLibrary'),
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
        label: i18n.t('favorites.addToFavorites'),
        icon: <StarBorderOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_toggle_favorite';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: i18n.t('common.move'),
        icon: <DriveFileMoveOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_move_dialog';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: i18n.t('common.copy'),
        icon: <ContentCopyOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_copy_dialog';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: i18n.t('tags.title'),
        icon: <LocalOfferOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_tags_dialog';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: i18n.t('common.share'),
        icon: <ShareOutlinedIcon/>,
        onClick: (file: any) => {
            const name = '_open_share_dialog';
            const customEvent = new CustomEvent(name, { detail: { name, file } });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: i18n.t('common.delete'),
        icon: <DeleteOutlinedIcon/>,
        onClick: removeFile as any,
    },
    {
        label: i18n.t('detail.title'),
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
