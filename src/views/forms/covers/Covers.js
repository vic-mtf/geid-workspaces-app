import React from 'react';
import { 
    Dialog,
    CardMedia, 
    ImageList,
    ImageListItem,
    ImageListItemBar,
    CardActionArea, 
    DialogContent,
    useMediaQuery,
    useTheme, 
} from '@mui/material';

import useAxios from '../../../utils/useAxios';
import { useSelector } from 'react-redux';
import Typography from '../../../components/Typography';
import CoverHeader from './CoverHeader';

export default function Covers ({open, onClose, onCover}) {
    const { token } = useSelector(store => store.user);
    const [{ data }, /* refresh */] = useAxios({
            url: '/api/stuff/cover',
            headers: {'Authorization': `Bearer ${token}`},
        });
    const theme = useTheme();
    const matchSmall = useMediaQuery(theme.breakpoints.between('xs', 'sm'));
    const matchMedium = useMediaQuery(theme.breakpoints.down('lg'));
  
    return (
        <Dialog open={open} fullScreen >
            <CoverHeader onClose={onClose}/>
                <DialogContent
                    sx={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        px: 0,
                        mx: 0,
                    }}
                >
                {data &&
                <ImageList 
                    cols={matchSmall ?  2 : matchMedium ? 4: 8}
                    sx={{ px:1, width: '100%', }}
                >
                {data?.map((cover) => (
                    <ImageListItem 
                    key={cover._id}>
                        <CardActionArea
                            sx={{width: 130,}}
                            onClick={() => {
                                if(typeof onCover === 'function')
                                    onCover({...cover});
                            }}
                            title={
                                (cover.docTypes[0] || '') + (cover.docTypes[1] ? `/${cover.docTypes[1]}` : '')  
                            }
                        >
                            <CardMedia
                                src={cover.contentUrl}
                                srcSet={cover.contentUrl}
                                alt={cover.name}
                                loading="lazy"
                                component="img"
                                height={160}
                                sx={{
                                    width: 130,
                                }}
                            />
                        </CardActionArea>
                        <ImageListItemBar
                            title={
                                <Typography variant="body2"> 
                                   {cover?.name?.toLowerCase()}
                                </Typography> 
                            }
                            subtitle={
                                <span>
                                    { 
                                    (cover.docTypes[0] || '') + 
                                    (cover.docTypes[1] ? `/${cover.docTypes[1]}` : '') 
                                    }
                                </span>
                            }
                            position="below"
                            sx={{width: 120}}
                        />
                    </ImageListItem>
                ))}
                </ImageList>}
                {data?.length === 0 &&
                <Typography align="center" color="text.secondary">
                    Aucune couverture disponible
                </Typography>}
            </DialogContent>
        </Dialog>
    )
}

