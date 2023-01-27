import { Box, Skeleton } from "@mui/material"
import Typography from "../../../../components/Typography"
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import React, { useState } from "react";

export default function Video (props) {
    const [loading, setLoading] = useState(true);

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
        >
            <Box
                mb={1}
                sx={{ 
                    boxShadow: loading ? 'none' : 5, 
                    display: 'flex',
                    justifyContent:"center",
                    alignItems: 'center',
                    position: 'relative'
                }}
            >
                <Box
                    component="video"
                    preload='metadata'
                    onLoadedMetadata={() => setLoading(false)}
                    sx={{
                        width: "100%",
                        border: theme => `1px solid ${theme.palette.background.paper}`,
                        ...loading && {
                            border: 'none',
                            background: 'transparent',
                        }
                    }}
                    src={props.url}
                />
                {loading ?
                (<Skeleton
                    variant="rectangular"
                    sx={{
                        display: 'flex',
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                    }}
                />):
                (<PlayArrowRoundedIcon
                    sx={{
                        color: "white",
                        position: 'absolute',
                        left: '10px',
                        bottom: '10px'
                    }}
                    fontSize="large"
                />)
                }
            </Box>
            <Typography
                align="center"
                sx={{
                    display: '-webkit-box',
                    width: "100%",
                    maxWidth: 200,
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                }}
            >
                {props.name?.replace(/_/ig, ' ')}
            </Typography>
        </Box>
    )
}
