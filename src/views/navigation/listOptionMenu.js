import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

const listOptionMenu = [
    {
        icon: <ArticleOutlinedIcon fontSize="small" />,
        label: 'Documents',
        key: '_documents',
        to: process.env.PUBLIC_URL + '/documents'
    },
    {
        icon: <ImageOutlinedIcon fontSize="small" />,
        label: 'Photos',
        key: '_photos',
        to: process.env.PUBLIC_URL + '/photos'
    },
    {
        icon: <PlayCircleOutlinedIcon fontSize="small" />,
        label: 'Vidéos',
        key: '_videos',
        to: process.env.PUBLIC_URL + '/videos'
    },
    {
        icon: <InsertDriveFileOutlinedIcon fontSize="small" />,
        label: 'Autres',
        key: '_others',
        to: process.env.PUBLIC_URL + '/others',
    },
    
];

export default listOptionMenu;