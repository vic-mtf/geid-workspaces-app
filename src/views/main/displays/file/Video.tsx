/**
 * Video — Affichage miniature vidéo en mode vignette.
 *
 * 1. Thumbnail progressive via useAdaptiveThumbnail (pas la vidéo entière)
 * 2. Bouton play overlay
 * 3. Badge durée centré en bas
 */

import { Box, Skeleton, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import useAdaptiveThumbnail from "@/hooks/useAdaptiveThumbnail";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";
import { RootState } from "@/types";

interface VideoProps {
  url?: string;
  name?: string;
  duration?: string;
  renderName?: React.ReactNode;
  [key: string]: any;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Video(props: VideoProps) {
  const { src, loading, isBlurred } = useAdaptiveThumbnail(props.url);
  const token = useSelector((store: RootState) => store.user.token);
  const [duration, setDuration] = useState<string | null>(props.duration || null);
  // Ratio stable : initialisé une seule fois depuis les props ou par défaut 16:9
  const ratio = useMemo(() => {
    if (props.videoWidth && props.videoHeight && props.videoHeight > 0) return props.videoWidth / props.videoHeight;
    return 16 / 9;
  }, [props.videoWidth, props.videoHeight]);

  // Fetch durée via /video-info seulement si pas déjà fournie par l'API
  useEffect(() => {
    if (duration || !props.url) return;
    const infoUrl = props.url.replace("/file/", "/video-info/");
    fetch(infoUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        if (d.durationSeconds && !isNaN(d.durationSeconds)) setDuration(formatDuration(d.durationSeconds));
        else if (d.duration) setDuration(d.duration);
      })
      .catch(() => {});
  }, [props.url, token, duration]);

  const ext = getFileExtension(props.name ?? "")?.toUpperCase() ?? "";

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
        {/* Skeleton pendant le premier chargement */}
        {loading && !src && (
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ position: "absolute", inset: 0 }} />
        )}

        {/* Thumbnail avec transition blur → net */}
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

        {/* Pas de thumbnail → icône */}
        {!src && !loading && (
          <FileTypeIcon extension={getFileExtension(props.name ?? "") ?? "mp4"} size={48} />
        )}

        {/* Bouton play overlay */}
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
              <PlayArrowRoundedIcon sx={{ color: "common.white", fontSize: 20 }} />
            </Box>
          </Box>
        )}

        {/* Badge durée centré en bas */}
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
          variant="caption"
          align="center"
          sx={{
            maxWidth: 120,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
            overflow: "hidden",
            fontSize: 11,
            lineHeight: 1.3,
          }}
        >
          {props.name}
        </Typography>
      )}
    </Box>
  );
}

export default React.memo(Video);
