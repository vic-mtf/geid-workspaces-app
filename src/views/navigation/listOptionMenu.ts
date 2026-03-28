import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { GoogleDriveIcon, OneDriveIcon, DropboxIcon, AmazonS3Icon, ICloudIcon, BoxIcon, MegaIcon } from '@/components/CloudIcons';
import { NavOption } from '@/types';
import i18n from '@/i18n/i18n';

const listOptionMenu: NavOption[] = [
    { icon: HistoryRoundedIcon, label: i18n.t('nav.recent'), to: '/recent', showInBottomNav: true },
    { icon: FolderOutlinedIcon, label: i18n.t('nav.files'), to: '/files', showInBottomNav: true },
    { icon: StarOutlineRoundedIcon, label: i18n.t('nav.favorites'), to: '/favorites', showInBottomNav: true },
    { icon: PeopleOutlinedIcon, label: i18n.t('nav.shared') || 'Espace partagé', to: '/shared', showInBottomNav: true },
    {
        icon: CloudOutlinedIcon,
        label: i18n.t('nav.cloud') || 'Espace cloud',
        to: '/cloud',
        divider: true,
        children: [
            { icon: GoogleDriveIcon, label: 'Google Drive', to: '/cloud/google-drive', disabled: true },
            { icon: OneDriveIcon, label: 'OneDrive', to: '/cloud/onedrive', disabled: true },
            { icon: DropboxIcon, label: 'Dropbox', to: '/cloud/dropbox', disabled: true },
            { icon: AmazonS3Icon, label: 'Amazon S3', to: '/cloud/amazon-s3', disabled: true },
            { icon: ICloudIcon, label: 'iCloud', to: '/cloud/icloud', disabled: true },
            { icon: BoxIcon, label: 'Box', to: '/cloud/box', disabled: true },
            { icon: MegaIcon, label: 'Mega', to: '/cloud/mega', disabled: true },
        ],
    },
    { icon: DeleteOutlineRoundedIcon, label: i18n.t('nav.trash'), to: '/trash', showInBottomNav: true },
];

export default listOptionMenu;
