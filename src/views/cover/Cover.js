import Box from "../../components/Box"
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
import { useData } from "../../utils/DataProvider";
import { useEffect, useRef } from "react";
import _logo_geid from '../../assets/geid_logo_blue_without_title.webp';

export default function Cover ({startApp}) {
    const [{loading}] = useData();
    const emited = useRef(true);

    useEffect(() => {
        const root  = document.getElementById('root');
        const name = '_load_all_data';
        if(emited.current && startApp) {
            emited.current = false;
            const customEvent = new CustomEvent(name);
            root.dispatchEvent(customEvent);
        }
    },[startApp]);

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
            <CardMedia
                    component="img"
                    src={_workspace_logo}
                    draggable={false}
                    sx={{
                        height: 100,
                        width: 100,
                        animation: 'swing .5s 1s' ,
                    }}
            />
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
                    >Espace personnel</Typography>
                </Stack>
                {loading &&
                <CircularProgress
                    size={15}
                    color="inherit"
                    sx={{position: 'absolute', top: '150%'}}
                />}
            </MuiBox>
           </Stack>
           <Typography  variant="caption" paragraph>
                Direction Archives et Nouvelles Technologie de l'Information et de la Communication ©2022
            </Typography>
        </Box>
    )
}