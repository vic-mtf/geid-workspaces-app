import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import React from 'react';
import removeFile from './removeFile';

const actions = [
    {
        label: 'Ouvrir',
        icon: <LaunchOutlinedIcon/>,
        onClick: file => {
            const link = document.createElement('a');
            link.href = file?.url;
            link.target = '_blank';
            link.click();
        }
    },
    {
        label: 'Télécharger',
        icon: <FileDownloadOutlinedIcon/>,
        onClick: file => {
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
        label: 'Supprimer',
        ///disabled: true,
        icon: <DeleteOutlinedIcon/>,
        onClick: removeFile,
    },
    {
        label: 'Renommer',
        icon: <EditOutlinedIcon/>,
        onClick: file => {
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
            .dispatchEvent(customEvent);
        }
    },
    {
        label: 'Envoyer vers',
        icon: <SendOutlinedIcon/>,
        options: [
            {
                label: 'Le service d\'archivage',
                onClick: file => {
                    const name = '_open_archives_form';
                    const customEvent = new CustomEvent(name, { detail : {name,file, } });
                    document.getElementById('root')
                    .dispatchEvent(customEvent);
                }
            },
            {
                label: 'La mediathèque',
                onClick: file => {
                    const name = '_open_media_library_form';
                    const customEvent = new CustomEvent(name, { detail : {name,file, } });
                    document.getElementById('root')
                    .dispatchEvent(customEvent);
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
        //disabled: true,
        icon: <InfoOutlinedIcon/>,
        onClick: file => {
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
            .dispatchEvent(customEvent);
        }
    },
    
];

export default actions;