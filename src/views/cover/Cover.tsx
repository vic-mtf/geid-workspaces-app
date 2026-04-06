import React, { useCallback, useEffect } from 'react';
import _workspace_logo from '@/assets/5a3636b951df37.87798883151350239.webp';
import { Box, CardMedia, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import _logo_geid from '@/assets/geid_logo_blue_without_title.webp';
import BoxGradient from "@/components/BoxGradient";
import SwingAnimation from "@/components/SwingAnimation";
import { useDispatch, useSelector } from 'react-redux';
import openSignIn from "@/views/cover/openSignIn";
import useGetData from '@/utils/useGetData';
import channels from "@/utils/channels";
import { decrypt } from '@/utils/crypt';
import { updateUser } from '@/redux/user';
import { RootState } from '@/types';

interface CoverProps {
    setOpened: (val: boolean) => void;
}

export default function Cover({ setOpened }: CoverProps) {
    const { t } = useTranslation();
    const connected = useSelector((store: RootState) => store.user.connected);
    const dispatch = useDispatch();
    const [loading, getFiles] = useGetData({ key: 'files' });

    const getData = useCallback(async (data?: any) => {
        await getFiles(data);
        setOpened(true);
    }, [getFiles, setOpened]);

    const handleFinish = useCallback(() => {
        if (connected) getData();
        else openSignIn();
    }, [getData, connected]);

    useEffect(() => {
        const handleLogin = (event: any) => {
            if (event.origin === window.location.origin && event.data) {
                const data = {
                    connected: true,
                    ...decrypt(event.data),
                };
                dispatch(updateUser({ data }));
                getData({
                    urlProps: {
                        token: data.token,
                        userId: data.id,
                    }
                });
            }
        };
        SIGN_IN_CHANNEL.addEventListener("message", handleLogin);
        return () => {
            SIGN_IN_CHANNEL.removeEventListener("message", handleLogin);
        };
    }, [dispatch, getData]);

    return (
        <BoxGradient
            sx={{
                position: "fixed",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                overflow: "hidden",
            }}
        >
            {/* Contenu central — logo + titre */}
            <Stack alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
                <SwingAnimation delay={2} onFinish={handleFinish}>
                    <CardMedia
                        component="img"
                        src={_workspace_logo}
                        draggable={false}
                        sx={{
                            height: { xs: 64, sm: 80, md: 100 },
                            width: { xs: 64, sm: 80, md: 100 },
                        }}
                    />
                </SwingAnimation>
                <Stack
                    spacing={{ xs: 0.5, sm: 1 }}
                    direction={{ xs: "column", sm: "row" }}
                    divider={
                        <Divider
                            flexItem
                            orientation="vertical"
                            sx={{
                                bgcolor: "text.primary",
                                borderRightWidth: 2,
                                display: { xs: "none", sm: "block" },
                            }}
                        />
                    }
                    alignItems="center"
                    justifyContent="center"
                >
                    <CardMedia
                        component="img"
                        src={_logo_geid}
                        sx={{ width: { xs: 60, sm: 90, md: 120 } }}
                    />
                    <Typography
                        noWrap
                        color="text.primary"
                        sx={{
                            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" },
                            fontWeight: 400,
                        }}
                    >
                        {t('cover.personalSpace')}
                    </Typography>
                </Stack>
                <Box position="relative" py={2} display="flex" justifyContent="center" alignItems="center">
                    {loading && (
                        <CircularProgress
                            size={15}
                            sx={{
                                color: 'text.primary',
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        />
                    )}
                </Box>
            </Stack>

            {/* Footer — toujours visible en bas */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    py: { xs: 1.5, sm: 2 },
                    px: 2,
                }}
            >
                <Typography variant="caption" color="text.primary">
                    {t('cover.copyright')}
                </Typography>
            </Box>
        </BoxGradient>
    );
}

const SIGN_IN_CHANNEL = new BroadcastChannel(channels.signIn);
