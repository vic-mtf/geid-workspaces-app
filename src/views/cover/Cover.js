import Box from "../../components/Box"
import _workspace_logo from '../../assets/5a3636b951df37.87798883151350239.webp';
import { 
    CardMedia, 
    Stack,
    Box as MuiBox,
    CircularProgress
} from "@mui/material";
import Typography from "../../components/Typography";
import 'animate.css/source/attention_seekers/swing.css';

export default function Cover ({loading}) {

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
                <Typography fontWeight="bold" variant="h4" paragraph>
                        Espace personnel
                </Typography>
                {loading &&
                <CircularProgress
                    size={20}
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