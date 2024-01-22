import { Box, Skeleton } from "@mui/material";
import { useState } from "react";
import Typography from "../../../../components/Typography";

export default function Photo (props) {
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
                    bgcolor: theme => theme.palette.background.paper
                }}
            >
                <Box
                    component="img"
                    src={props.url}
                    srcSet={props.url}
                    //loading="lazy"
                    onLoad={() => setLoading(false)}
                    sx={{
                        width: "100%",
                        maxHeight: 150,
                        borderRadius: 2,
                        border: theme => `2px solid ${theme.palette.divider}`
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
                    // display: '-webkit-box',
                    // maxWidth: 150,
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