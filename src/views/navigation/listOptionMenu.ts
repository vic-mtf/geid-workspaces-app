import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { NavOption } from '@/types';

const listOptionMenu: NavOption[] = [
    { icon: ArticleOutlinedIcon, label: 'Documents', to: '/documents', showInBottomNav: true },
    { icon: ImageOutlinedIcon, label: 'Images', to: '/images', showInBottomNav: true },
    { icon: PlayCircleOutlinedIcon, label: 'Vidéos', to: '/videos', showInBottomNav: true },
    { icon: InsertDriveFileOutlinedIcon, label: 'Autres', to: '/others', showInBottomNav: true },
    { icon: StarBorderOutlinedIcon, label: 'Favoris', to: '/favorites', divider: true, showInBottomNav: true },
    { icon: AccessTimeOutlinedIcon, label: 'Récents', to: '/recent' },
    { icon: DeleteOutlineOutlinedIcon, label: 'Corbeille', to: '/trash', showInBottomNav: true },
];

export default listOptionMenu;
