import { Box, Skeleton, Typography } from "@mui/material";
import { useState } from "react";

interface PhotoProps {
    url?: string;
    name?: string;
    [key: string]: any;
}

export default function Photo (props: PhotoProps) {
    const [loading, setLoading] = useState(true);

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            position="relative"
            gap={1}
        >
            <Box
                p={.2}
                display={loading ? 'none' : 'flex'}
                sx={{
                    boxShadow: 5,
                    justifyContent:"center",
                    alignItems: 'center',
                    borderRadius: 2,
                    bgcolor: (theme: any) => theme.palette.background.paper
                }}
            >
                <Box
                    component="img"
                    src={props.url}
                    srcSet={props.url}
                    onLoad={() => setLoading(false)}
                    sx={{
                        width: "100%",
                        maxHeight: 150,
                        borderRadius: 2,
                        border: (theme: any) => `2px solid ${theme.palette.divider}`
                    }}
                />

            </Box>
            {loading &&
            <Skeleton
                variant="rectangular"
                sx={{width: '100%', height: 120,}}
            />}
            <Typography
                align="center"
                width={150}
                sx={{
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
