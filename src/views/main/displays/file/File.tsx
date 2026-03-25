import React from 'react';
import { Box, Typography } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Doc from '@/views/main/displays/file/Doc';
import Photo from '@/views/main/displays/file/Photo';
import Video from '@/views/main/displays/file/Video';

interface FileProps {
    type?: string;
    name?: string;
    [key: string]: any;
}

function File (props: FileProps) {
    if(props.type === 'image')
        return <Photo {...props} />
    if(props.type === 'document')
        return <Doc {...props} />
    if(props.type === 'video')
        return <Video {...props} />
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            gap={1}
        >
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 64, opacity: 0.5 }} />
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
    );
}

export default React.memo(File);
