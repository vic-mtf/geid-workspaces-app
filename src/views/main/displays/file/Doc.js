import { Box } from "@mui/material";
import Typography from "../../../../components/Typography";
import style from '../../../../styles/paper.module.css';

export default function Doc (props)  {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
        >
            <Box
                height={120}
                width={100}
                mb={1}
                className={style.paper}
                sx={{ 
                    boxShadow: 5, 
                    display: 'flex',
                    justifyContent:"center",
                    alignItems: 'center'
                }}
            >
                <Box
                    component="img"
                    src={props.icon}
                />
            </Box>
            <Typography
                width={120}
                align="center"
                sx={{
                    display: '-webkit-box',
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
};