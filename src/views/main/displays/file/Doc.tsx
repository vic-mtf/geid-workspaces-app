import { Box, Typography } from "@mui/material";
import style from "@/styles/paper.module.css";

interface DocProps {
  icon?: string;
  name?: string;
  [key: string]: any;
}

export default function Doc(props: DocProps) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap={0.5}
      p={0.5}
    >
      <Box
        height={110}
        width={90}
        className={style.paper}
        sx={{
          boxShadow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 1,
        }}
      >
        {props.icon && (
          <Box component="img" src={props.icon} sx={{ maxWidth: 40, maxHeight: 40 }} />
        )}
      </Box>
      <Typography
        variant="caption"
        align="center"
        color="text.primary"
        sx={{
          maxWidth: 130,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          textOverflow: "ellipsis",
          overflow: "hidden",
          fontSize: 12,
          lineHeight: 1.3,
        }}
      >
        {props.name?.replace(/_/gi, " ")}
      </Typography>
    </Box>
  );
}
