import React, { useCallback, useMemo, useEffect } from 'react';
import Box from "../../components/Box";
import _workspace_logo from '../../assets/5a3636b951df37.87798883151350239.webp';
import { 
    CardMedia, 
    Stack,
    Box as MuiBox,
    CircularProgress,
    Divider
} from "@mui/material";
import Typography from "../../components/Typography";
import 'animate.css/source/attention_seekers/swing.css';
import _logo_geid from '../../assets/geid_logo_blue_without_title.webp';
import SwingAnimation from "../../components/SwingAnimation";
import { useDispatch, useSelector } from 'react-redux';
import openSignIn from "./openSignIn";
import useGetData from '../../utils/useGetData';
import channels from "../../utils/channels";
import { decrypt } from '../../utils/crypt';
import { updateUser } from '../../redux/user';

export default function Cover ({ setOpened }) {
    const connected = useSelector(store => store.user.connected);
    const loaded = useSelector(store => store.data.loaded);
    const dispatch = useDispatch();
    const [loadingDocs, getDocs] = useGetData({ 
        key: 'documents', 
        onBeforeUpdate (data) {
          return {
            ...data,
            others: [],
          }
        }
    });
    const [loadingImages, getImages] = useGetData({ key: 'images' });
    const [loadingVideos, getVideos] = useGetData({ 
        key: 'videos', 
        onBeforeUpdate (data) {
            return {
            ...data,
                audios: [],
            }
        } 
    });
  
    const loading = useMemo(() => 
      [loadingDocs, loadingImages, loadingVideos].some(Boolean),
      [loadingDocs, loadingImages, loadingVideos]
    );
    const getData = useCallback((data) => {
        getDocs(data);
        getImages(data);
        getVideos(data);
    }, [getDocs, getImages, getVideos]);

    const handleFinish = useCallback(() => {
        if(connected) getData()
        else openSignIn();

        if(loaded) setOpened(true);
    },[getData, connected, setOpened, loaded]);


    useEffect(() => {
        const handleLogin = (event) => {
            if(event.origin === window.location.origin && event.data) {
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
        }
    }, [dispatch, getData]);

    return (
        <Box
            sx={{
                justifyContent: 'center',
                alignItems: 'center',
                userSelect: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }}
        >
           <Stack
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
            spacing={1}
           >
            <SwingAnimation
                delay={2}
                onFinish={handleFinish}
            >
                <CardMedia
                        component="img"
                        src={_workspace_logo}
                        draggable={false}
                        sx={{ height: 100, width: 100 }}
                />
            </SwingAnimation>
            <MuiBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                position="relative"
            >
                <Stack 
                    spacing={1} 
                    direction="row" 
                    width={500} 
                    my={1}
                    divider={
                        <Divider 
                            flexItem 
                            orientation="vertical" 
                            sx={{
                                bgcolor: 'text.primary',
                                borderWidth: 1,
                            }}
                        />
                    }
                    display="flex"
                    justifyContent="center"
                >
                    <CardMedia
                        component="img"
                        src={_logo_geid}
                        sx={{width: 120}}
                    />
                    <Typography
                        noWrap
                        variant="h4"
                        color="text.primary"
                    >Espace personnel</Typography>
                </Stack>
                {loading &&
                <CircularProgress
                    size={15}
                    sx={{
                        position: 'absolute', 
                        top: '150%',
                        color: 'text.primary'
                    }}
                />}
            </MuiBox>
           </Stack>
           <Typography variant="caption" paragraph color="text.primary">
                Direction Archives et Nouvelles Technologie de l'Information et de la Communication ©2022
            </Typography>
        </Box>
    )
}

const SIGN_IN_CHANNEL = new BroadcastChannel(channels.signin);