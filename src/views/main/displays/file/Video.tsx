/**
 * Video — Affichage miniature video en mode vignette.
 *
 * 1. Thumbnail progressive via useAdaptiveThumbnail
 * 2. Bouton play overlay
 * 3. Badge duree en left-bottom (cache global via useVideoInfo)
 */

import { Box, Skeleton, Typography } from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import React, { useMemo } from "react";
import useAdaptiveThumbnail from "@/hooks/useAdaptiveThumbnail";
import useVideoInfo from "@/hooks/useVideoInfo";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";
import timeAgo from "@/utils/timeAgo";

interface VideoProps {
  url?: string;
  name?: string;
  duration?: string;
  videoWidth?: number;
  videoHeight?: number;
  renderName?: React.ReactNode;
  [key: string]: any;
}

function Video(props: VideoProps) {
  const { src, loading, isBlurred } = useAdaptiveThumbnail(props.url);
  const { duration, ratio } = useVideoInfo(props.url, props.duration, props.videoWidth, props.videoHeight);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
      <Box
        sx={{
          width: "100%",
          maxWidth: 160,
          aspectRatio: String(ratio),
          mb: 0.5,
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          boxShadow: 3,
          bgcolor: "action.hover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading && !src && (
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ position: "absolute", inset: 0 }} />
        )}

        {src && (
          <Box
            component="img"
            src={src}
            draggable={false}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
              filter: isBlurred ? "blur(2px)" : "none",
              transition: "filter 0.3s ease",
            }}
          />
        )}

        {!src && !loading && (
          <FileTypeIcon extension={getFileExtension(props.name ?? "") ?? "mp4"} size={48} />
        )}

        {(src || (!loading && !src)) && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                bgcolor: "rgba(0,0,0,0.45)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(2px)",
              }}
            >
              <PlayArrowOutlinedIcon sx={{ color: "common.white", fontSize: 20 }} />
            </Box>
          </Box>
        )}

        {duration && (
          <Box
            sx={{
              position: "absolute",
              bottom: 4,
              left: 4,
              bgcolor: "rgba(0,0,0,0.65)",
              color: "common.white",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 0.5,
              px: 0.6,
              py: 0.1,
              lineHeight: "16px",
              backdropFilter: "blur(4px)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {duration}
          </Box>
        )}
      </Box>

      {props.renderName ?? (
        <Typography
          variant="body2"
          noWrap
          sx={{ maxWidth: 140, textOverflow: "ellipsis", overflow: "hidden", fontSize: 13, lineHeight: 1.3 }}
        >
          {props.name}
        </Typography>
      )}
      {props.date && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, lineHeight: 1.2 }}>
          {timeAgo(props.date)}
        </Typography>
      )}
    </Box>
  );
}

export default React.memo(Video);
