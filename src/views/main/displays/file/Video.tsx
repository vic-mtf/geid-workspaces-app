import { Box, Skeleton, Typography } from "@mui/material"
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import React, { useState } from "react";

interface VideoProps {
    url?: string;
    name?: string;
    [key: string]: any;
}

export default function Video (props: VideoProps) {
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
                        border: (theme: any) => `1px solid ${theme.palette.background.paper}`,
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
