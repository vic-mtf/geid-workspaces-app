import AppsMenuButton from "@/views/header/main-options/AppsMenuButton";
import ProfileMenuButton from "@/views/header/main-options/ProfileMenuButton";
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import React from "react";
import i18n from "@/i18n/i18n";

interface OptionItem {
    label: string;
    pin: boolean;
    icon?: React.ReactNode;
    element?: React.ReactNode | null;
    disabled?: boolean;
    key: string;
    action?: () => void;
}

const options: OptionItem[] = [
    {
        label: i18n.t('header.help'),
        pin: true,
        icon: <ContactSupportOutlinedIcon fontSize="small"/>,
        element: null,
        disabled: true,
        key: '_help',
    },
    {
        label: i18n.t('header.applications'),
        pin: true,
        icon: <AppsRoundedIcon fontSize="small"/>,
        element: <AppsMenuButton/>,
        key: '_apps',
    },
    {
        label: i18n.t('header.profile'),
        pin: true,
        icon: <AccountCircleOutlinedIcon fontSize="small"/>,
        element: <ProfileMenuButton/>,
        key: '_profile'
    },
    {
        label: i18n.t('header.downloads'),
        pin: false,
        icon: <FileDownloadOutlinedIcon fontSize="small"/>,
        element: null,
        key: '_download_file',
        action () {
            const name = '_open_download_drawer';
            const customEvent = new CustomEvent(name, {detail: {name}});
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
    },
    {
        label: i18n.t('header.exitApp'),
        pin: false,
        icon: <ExitToAppRoundedIcon fontSize="small"/>,
        element: null,
        key: '_exit_app',
        action () {
           (window as any).location = '/';
        }
    }
];

export default options;
