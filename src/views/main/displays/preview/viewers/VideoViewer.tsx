/**
 * VideoViewer — Lecteur video en streaming avec authentification par token.
 *
 * Obtient un token de streaming via POST /api/stuff/workspace/stream-token,
 * puis utilise ce token pour lire la video directement dans un element <video>.
 */

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import { RootState } from "@/types";

interface VideoViewerProps {
  fileUrl: string;
  filename: string;
}

function extractFilePath(fileUrl: string): string {
  // fileUrl = https://geidbudget.com/api/stuff/workspace/file/userId/path/name.ext
  const marker = "/api/stuff/workspace/file/";
  const idx = fileUrl.indexOf(marker);
  if (idx >= 0) return decodeURIComponent(fileUrl.substring(idx + marker.length));
  if (fileUrl.startsWith(marker)) return decodeURIComponent(fileUrl.substring(marker.length));
  return decodeURIComponent(fileUrl);
}

const VideoViewer = React.memo(function VideoViewer({ fileUrl, filename }: VideoViewerProps) {
  const { t } = useTranslation();
  const token = useSelector((store: RootState) => store.user.token);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileUrl || !token) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setStreamUrl(null);

    const filePath = extractFilePath(fileUrl);

    fetch("/api/stuff/workspace/stream-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ filePath }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          const streamToken = data.token || data.streamToken;
          const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
          setStreamUrl(`/api/stuff/workspace/file/${encodedPath}?token=${streamToken}`);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [fileUrl, token]);

  // Autoplay when stream URL is ready
  useEffect(() => {
    if (streamUrl && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [streamUrl]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <CircularProgress sx={{ color: "common.white" }} />
      </Box>
    );
  }

  if (error || !streamUrl) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <Typography sx={{ color: "common.white" }}>{t("viewer.noPreview")}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        controls
        src={streamUrl}
        sx={{
          maxWidth: "100%",
          maxHeight: "100%",
          borderRadius: 1,
          outline: "none",
        }}
      />
    </Box>
  );
});

export default VideoViewer;
