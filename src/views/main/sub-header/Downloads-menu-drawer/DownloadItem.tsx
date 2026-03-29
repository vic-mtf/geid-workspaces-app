import React, { useEffect, useState } from 'react';
import { Box as MuiBox, Button, Card, CardContent, CardMedia, Divider, LinearProgress, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import IconButton from '@/components/IconButton';
import FileDownloadDoneRoundedIcon from '@mui/icons-material/FileDownloadDoneRounded';
import normaliseOctetSize from '@/utils/normaliseOctetSize';
import { useDispatch } from 'react-redux';
import { addData } from '@/redux/data';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import textStyle from '@/styles/text.module.css';

interface DownloadItemProps {
    file?: File;
    xhr?: XMLHttpRequest;
    icon?: string;
    end?: boolean | null;
    aborted?: boolean;
    loading?: boolean;
    cancel?: () => void;
    total?: number;
    loaded?: number;
    resend?: () => void;
    remove?: () => void;
    upload?: XMLHttpRequestUpload;
    type?: string;
}

export default function DownloadItem (props: DownloadItemProps) {
    const {
        file, xhr, icon, end, aborted, loading, cancel, total, loaded, resend, remove, upload: _upload, type
    } = props;
    const [upload, setUpload] = useState({total, loaded});
    const name = file?.name;
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleGetLoadData = ({loaded, total}: {loaded: number; total: number}) => {
            setUpload({loaded, total})
        };
        if (xhr) {
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
                            sx={{ px: 1 }}
                            >{name}</Typography>
                            {t('downloads.uploadComplete')}
                        </Typography>,
                        {
                            variant: 'success',
                            action: () => (
                                <Button
                                    children={t('common.show')}
                                    color="inherit"
                                    onClick={() => {
                                        const customEvent = new CustomEvent(
                                            '_open_download_drawer',
                                            { detail: {name: '_open_download_drawer'}}
                                        );
                                        document.getElementById('root')
                                        ?.dispatchEvent(customEvent);
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
        }
        _upload?.addEventListener('progress', handleGetLoadData as any);
        return () => {
            _upload?.removeEventListener('progress', handleGetLoadData as any);
        }
    }, [setUpload, _upload, type, xhr, closeSnackbar, dispatch, enqueueSnackbar, name]);

    return (
        <MuiBox>
            <Card
                sx={{
                    bgcolor: (theme: any) => theme.palette.background.paper +
                    theme.customOptions.opacity,
                    border: (theme: any) => `1px solid ${theme.palette.divider}`,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
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
                                            Math.floor((upload.loaded ?? 0) * 100 / (upload.total ?? 1))
                                            }%, {
                                                upload.loaded === upload.total ?
                                                normaliseOctetSize(upload.total ?? 0) :
                                                `${normaliseOctetSize((upload as any).upload)} sur ${normaliseOctetSize(upload.total ?? 0)}`
                                           }
                                        </>) : t('downloads.preparingUpload')

                                    }
                                </Typography>
                            </Stack>
                            {(end || aborted) &&
                            <IconButton
                                title={t("common.close")}
                                sx={{position: 'absolute', top: '-5px', right: '-10px'}}
                                onClick={() => {
                                    remove?.();
                                }}
                                value=""
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
                                        value={((upload.loaded ?? 0) * 100 / (upload.total ?? 1)) || 0}
                                        variant={end === null ? 'determinate' : 'determinate'}
                                        sx={{
                                            flexGrow: 1,
                                            mr: 1,
                                        }}
                                    />
                                    <Button
                                        children={t('common.cancel')}
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
                                                {end && t('downloads.uploadDone')}
                                                {aborted && t('downloads.uploadFailed')}
                                            </React.Fragment>
                                        }
                                        primaryTypographyProps={{
                                            variant: 'caption',
                                            color: ({palette}: any) => aborted ? palette.error.main : palette.success.main
                                        }}
                                    />
                                    {aborted && <Button color="error" children={t('common.retry')} onClick={resend}/>}
                                </React.Fragment>)}
                            </ListItem>
                        </MuiBox>
                    </Stack>
                </CardContent>
            </Card>
        </MuiBox>
    )
}
