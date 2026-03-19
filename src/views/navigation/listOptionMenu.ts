import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { NavOption } from '../../types';

const listOptionMenu: NavOption[] = [
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

export default listOptionMenu;
