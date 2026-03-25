import React from 'react';
import { CircularProgress, Dialog, DialogContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useAxios from '@/utils/useAxios';
import { useSelector } from 'react-redux';
import Content from '@/views/forms/document-covers-pages/Content';
import Header from '@/views/forms/document-covers-pages/Header';
import { RootState } from '@/types';

interface DocumentCoversPagesProps {
    open: boolean;
    onClose: () => void;
    onCover: (cover: any) => void;
}

export default function DocumentCoversPages ({open, onClose, onCover}: DocumentCoversPagesProps) {
    const { t } = useTranslation();
    const { token } = useSelector((store: RootState) => store.user);
    const [{ data, loading}, refresh ] = useAxios({
            url: '/api/stuff/cover',
            headers: {'Authorization': `Bearer ${token}`},
        });

    return (
        <Dialog open={Boolean(open)} fullScreen >
            <Header
                onClose={onClose}
                refresh={refresh}
            />
                <DialogContent
                    sx={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        px: 0,
                        mx: 0,
                    }}
                >
                {Boolean(data?.length) &&
                <Content
                    data={data}
                    onChooseCoverPage={onCover}
                />}
                {!data?.length &&
                <Typography
                    align="center"
                    color="text.secondary"
                    width="100%"
                    height="100%"
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
                    component="div"
                >
                    {loading ?
                        <CircularProgress
                            size={20}
                            color="inherit"
                        /> :
                    t("coverPages.noCoverAvailable")
                }

                </Typography>}
            </DialogContent>
        </Dialog>
    )
}
