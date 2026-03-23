import { Box, Skeleton, Typography } from "@mui/material";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import { useState } from "react";

interface VideoProps {
  url?: string;
  name?: string;
  [key: string]: any;
}

export default function Video(props: VideoProps) {
  const [loading, setLoading] = useState(true);

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
        sx={{
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: loading ? 0 : 1,
          bgcolor: "grey.900",
        }}
      >
        <Box
          component="video"
          preload="metadata"
          onLoadedMetadata={() => setLoading(false)}
          sx={{
            width: "100%",
            maxHeight: 140,
            display: loading ? "none" : "block",
          }}
          src={props.url}
        />
        {loading ? (
          <Skeleton variant="rounded" sx={{ width: 160, height: 120, borderRadius: 2 }} />
        ) : (
          <PlayCircleFilledRoundedIcon
            sx={{
              position: "absolute",
              left: 8,
              bottom: 8,
              fontSize: 28,
              color: "common.white",
              opacity: 0.9,
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
            }}
          />
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
