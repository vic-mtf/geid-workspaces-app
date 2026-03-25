import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { NavOption } from '@/types';
import i18n from '@/i18n/i18n';

const listOptionMenu: NavOption[] = [
    { icon: ArticleOutlinedIcon, label: i18n.t('nav.documents'), to: '/documents', showInBottomNav: true },
    { icon: ImageOutlinedIcon, label: i18n.t('nav.images'), to: '/images', showInBottomNav: true },
    { icon: PlayCircleOutlinedIcon, label: i18n.t('nav.videos'), to: '/videos', showInBottomNav: true },
    { icon: InsertDriveFileOutlinedIcon, label: i18n.t('nav.others'), to: '/others', showInBottomNav: true },
    { icon: StarBorderOutlinedIcon, label: i18n.t('nav.favorites'), to: '/favorites', divider: true, showInBottomNav: true },
    { icon: AccessTimeOutlinedIcon, label: i18n.t('nav.recent'), to: '/recent' },
    { icon: DeleteOutlineOutlinedIcon, label: i18n.t('nav.trash'), to: '/trash', showInBottomNav: true },
];

export default listOptionMenu;
