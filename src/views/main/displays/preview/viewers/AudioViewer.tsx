/**
 * AudioViewer — Lecteur audio simple avec controles natifs.
 */

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import MusicNoteRoundedIcon from "@mui/icons-material/MusicNoteRounded";
import { RootState } from "@/types";

interface AudioViewerProps {
  fileUrl: string;
  filename: string;
}

const AudioViewer = React.memo(function AudioViewer({ fileUrl, filename }: AudioViewerProps) {
  const { t } = useTranslation();
  const token = useSelector((store: RootState) => store.user.token);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileUrl || !token) return;
    let cancelled = false;
    setLoading(true);

    fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        if (!cancelled) setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [fileUrl, token]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        gap: 3,
      }}
    >
      <MusicNoteRoundedIcon sx={{ fontSize: 80, color: "common.white", opacity: 0.5 }} />

      <Typography variant="h6" sx={{ color: "common.white", textAlign: "center", px: 2 }} noWrap>
        {filename}
      </Typography>

      <Typography variant="body2" sx={{ color: "common.white", opacity: 0.7 }}>
        {t("viewer.audioPlaying")}
      </Typography>

      {loading ? (
        <CircularProgress sx={{ color: "common.white" }} />
      ) : blobUrl ? (
        <Box
          component="audio"
          controls
          autoPlay
          src={blobUrl}
          sx={{ width: "100%", maxWidth: 500 }}
        />
      ) : null}
    </Box>
  );
});

export default AudioViewer;
