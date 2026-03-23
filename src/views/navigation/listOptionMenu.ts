import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { NavOption } from '@/types';

export const mainMenu: NavOption[] = [
    {
        icon: ArticleOutlinedIcon,
        label: 'Documents',
        to: '/documents'
    },
    {
        icon: ImageOutlinedIcon,
        label: 'Images',
        to: '/images'
    },
    {
        icon: PlayCircleOutlinedIcon,
        label: 'Vidéos',
        to: '/videos'
    },
    {
        icon: InsertDriveFileOutlinedIcon,
        label: 'Autres',
        to: '/others',
    },
];

export const quickAccess: NavOption[] = [
    {
        icon: AccessTimeOutlinedIcon,
        label: 'Récents',
        to: '/recent',
    },
    {
        icon: StarOutlinedIcon,
        label: 'Favoris',
        to: '/favorites',
    },
    {
        icon: DeleteOutlinedIcon,
        label: 'Corbeille',
        to: '/trash',
    },
];

// For backward compat (MobileBottomNav uses this)
const listOptionMenu = mainMenu;
export default listOptionMenu;
