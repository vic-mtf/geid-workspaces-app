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
        >
            <Box
                p={.2}
                mb={1}
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
                        borderRadius: 2,
                        border: theme => `2px solid ${theme.palette.divider}`
                    }}
                />
                
            </Box>
            {loading &&
            <Skeleton
                variant="rectangular"
                sx={{width: '100%', height: 130,}}
            />}
            <Typography
                align="center"
                sx={{
                    display: '-webkit-box',
                    maxWidth: 200,
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: "100%",
                }}
            >
                {props.name?.replace(/_/ig, ' ')}
            </Typography>
        </Box>
    )
}