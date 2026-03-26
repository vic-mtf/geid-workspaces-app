import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { NavOption } from '@/types';
import i18n from '@/i18n/i18n';

const listOptionMenu: NavOption[] = [
    { icon: DescriptionOutlinedIcon, label: i18n.t('nav.documents'), to: '/documents', showInBottomNav: true },
    { icon: PhotoLibraryOutlinedIcon, label: i18n.t('nav.images'), to: '/images', showInBottomNav: true },
    { icon: VideoLibraryOutlinedIcon, label: i18n.t('nav.videos'), to: '/videos', showInBottomNav: true },
    { icon: FolderZipOutlinedIcon, label: i18n.t('nav.others'), to: '/others', showInBottomNav: true },
    { icon: StarOutlineRoundedIcon, label: i18n.t('nav.favorites'), to: '/favorites', divider: true, showInBottomNav: true },
    { icon: HistoryRoundedIcon, label: i18n.t('nav.recent'), to: '/recent' },
    { icon: DeleteOutlineRoundedIcon, label: i18n.t('nav.trash'), to: '/trash', showInBottomNav: true },
];

export default listOptionMenu;
