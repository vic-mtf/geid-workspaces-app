import { Box, Skeleton, Typography } from "@mui/material";
import { useState } from "react";

interface PhotoProps {
  url?: string;
  name?: string;
  [key: string]: any;
}

export default function Photo(props: PhotoProps) {
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
        display={loading ? "none" : "flex"}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
          boxShadow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src={props.url}
          alt={props.name}
          onLoad={() => setLoading(false)}
          sx={{
            width: "100%",
            maxHeight: 140,
            objectFit: "cover",
            borderRadius: 2,
          }}
        />
      </Box>
      {loading && (
        <Skeleton variant="rounded" sx={{ width: "100%", height: 120, borderRadius: 2 }} />
      )}
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
