import React, { useEffect, useState } from 'react';
import {
    Box as MuiBox,
    Card,
    CardContent,
    CardMedia,
    Divider,
    LinearProgress,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar
} from '@mui/material';
import { Stack } from '@mui/system';
import Typography from '../../../../components/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import IconButton from '../../../../components/IconButton';
import Button from '../../../../components/Button';
import FileDownloadDoneRoundedIcon from '@mui/icons-material/FileDownloadDoneRounded';
import normaliseOctetSize from '../../../../utils/normaliseOctetSize';
import { useDispatch } from 'react-redux';
import { addData } from '../../../../redux/data';
import { useSnackbar } from 'notistack';
import textStyle from '../../../../styles/text.module.css';

export default function DownloadItem (props) {
    const { 
        file, xhr, icon, end, aborted, loading, cancel, total, loaded, resend, remove, upload: _upload, type
    } = props;
    const [upload, setUpload] = useState({total, loaded});
    const name = file?.name?.replace(/_/ig, ' ');
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleGetLoadData = ({loaded, total}) => {
            setUpload({loaded, total})
        };
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                closeSnackbar()
                enqueueSnackbar(
                    <Typography>
                        <Typography 
                        title={name} 
                        maxWidth={300} 
                        fontSize={15} 
                        fontWeight="bold" 
                        className={textStyle.monoCrop}
                        padding
                        >{name}</Typography>
                        Téléchargement du fichier términé
                    </Typography>,
                    {
                        variant: 'success',
                        action: () => (
                            <Button
                                children="Afficher"
                                color="inherit"
                                onClick={() => {
                                    const customEvent = new CustomEvent(
                                        '_open_download_drawer', 
                                        { detail: {name: '_open_download_drawer'}}
                                    );
                                    document.getElementById('root')
                                    .dispatchEvent(customEvent);
                                }}
                            />
                        )
                    }
                );
            const data = xhr.response;
            if(Array.isArray(data))
                dispatch(addData({
                    key: type === 'video' ? 'documents' : type + 's', 
                    data
                }))
            }
        }
        _upload?.addEventListener('progress', handleGetLoadData);
        return () => {
            _upload?.removeEventListener('progress', handleGetLoadData);
        }
    }, [setUpload, _upload, type, xhr, closeSnackbar, dispatch, enqueueSnackbar, name]);
    
    return ( 
        <MuiBox>
            <Card
                sx={{
                    bgcolor: theme => theme.palette.background.paper + 
                    theme.customOptions.opacity,
                    border: theme => `1px solid ${theme.palette.divider}`,
                    backdropFilter: theme => `blur(${theme.customOptions.blur})`,
                    px:1,
                }}
                
            >
                <CardContent>
                    <Stack divider={<Divider variant="inset"/>} >
                        <Toolbar variant="dense" disableGutters sx={{m: 0, position: 'relative'}} >
                            <CardMedia component="img" src={icon} sx={{height: 50, width: 50, mr: 1}} />
                            <Stack flexGrow={1}>
                                <Typography
                                    color="primary"
                                    fontWeight="bold"
                                    sx={{
                                        display: '-webkit-box',
                                        maxWidth: 200,
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                    title={file?.name}
                                >{file?.name}</Typography>
                                <Typography color="text.secondary" variant="caption" >
                                    {
                                        typeof upload.loaded === 'number' ?
                                        (<>
                                            {
                                            Math.floor(upload.loaded * 100 / upload.total)
                                            }%, {
                                                upload.loaded === upload.total ?
                                                normaliseOctetSize(upload.total) :
                                                `${normaliseOctetSize(upload.upload)} sur ${normaliseOctetSize(upload.total)}`
                                           } 
                                        </>) : 'Préparation de chargement...'
                                        
                                    }
                                </Typography>
                            </Stack>
                            {(end || aborted) &&
                            <IconButton 
                                title="Fermer"
                                sx={{position: 'absolute', top: '-5px', right: '-10px'}}
                                onClick={() => {
                                    remove();
                                }}
                            >
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>}
                        </Toolbar>
                        <MuiBox
                            justifyContent="end"
                            alignItems="end"
                            display="flex"
                            minHeight={30}
                        >
                            <ListItem sx={{ flexGrow: 1, mt: 1, p:0 }}>
                                {loading ?
                                (<React.Fragment>
                                    <LinearProgress 
                                        value={(upload.loaded * 100 / upload.total) || 0} 
                                        variant={end === null ? 'determinate' : 'determinate'}
                                        sx={{
                                            flexGrow: 1,
                                            mr: 1,
                                        }}
                                    />
                                    <Button
                                        children="annuler"
                                        onClick={cancel}
                                    />
                                </React.Fragment>):
                                (<React.Fragment>
                                    <ListItemIcon>
                                        {end && <FileDownloadDoneRoundedIcon color="success" fontSize="small"/>}
                                        {aborted && <CancelOutlinedIcon color="error" fontSize="small"/>}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <React.Fragment>
                                                {end && 'Téléchargement términé'}
                                                {aborted && 'Echec  de téléchargement'}
                                            </React.Fragment>
                                        }
                                        primaryTypographyProps={{
                                            variant: 'caption',
                                            color: ({palette}) => aborted ? palette.error.main : palette.success.main
                                        }}
                                    />
                                    {aborted && <Button color="error" children="réessayer" onClick={resend}/>}
                                </React.Fragment>)}
                            </ListItem>
                        </MuiBox>
                    </Stack>
                </CardContent>
            </Card>
        </MuiBox>
    )
}