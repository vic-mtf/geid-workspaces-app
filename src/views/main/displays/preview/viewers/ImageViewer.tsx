/**
 * ImageViewer — Affichage d'image avec chargement progressif et zoom.
 *
 * Utilise useAdaptiveThumbnail pour un affichage rapide (flou),
 * puis charge l'image complète via blob authentifié.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Box, IconButton, Tooltip, CircularProgress } from "@mui/material";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import FitScreenRoundedIcon from "@mui/icons-material/FitScreenRounded";
import useAdaptiveThumbnail from "@/hooks/useAdaptiveThumbnail";
import { RootState } from "@/types";

interface ImageViewerProps {
  fileUrl: string;
  filename: string;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

const ImageViewer = React.memo(function ImageViewer({ fileUrl, filename }: ImageViewerProps) {
  const { t } = useTranslation();
  const token = useSelector((store: RootState) => store.user.token);

  const { src: thumbSrc, isBlurred } = useAdaptiveThumbnail(fileUrl);
  const [fullSrc, setFullSrc] = useState<string | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Fetch full image
  useEffect(() => {
    if (!fileUrl) return;
    let cancelled = false;
    setLoadingFull(true);
    fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        if (!cancelled) setFullSrc(URL.createObjectURL(blob));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingFull(false); });
    return () => {
      cancelled = true;
    };
  }, [fileUrl, token]);

  // Cleanup blob on unmount
  useEffect(() => {
    return () => {
      if (fullSrc) URL.revokeObjectURL(fullSrc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displaySrc = fullSrc || thumbSrc;
  const showBlur = !fullSrc && isBlurred;

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM)), []);
  const handleFitScreen = useCallback(() => setZoom(1), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
    else setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  }, []);

  // Reset zoom when file changes
  useEffect(() => { setZoom(1); }, [fileUrl]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Zoom controls */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 16, md: 24 },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          gap: 0.5,
          bgcolor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          borderRadius: 2,
          p: 0.5,
        }}
      >
        <Tooltip title={t("viewer.zoomOut")}>
          <IconButton onClick={handleZoomOut} size="small" sx={{ color: "common.white" }}>
            <ZoomOutRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("viewer.fitToScreen")}>
          <IconButton onClick={handleFitScreen} size="small" sx={{ color: "common.white" }}>
            <FitScreenRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("viewer.zoomIn")}>
          <IconButton onClick={handleZoomIn} size="small" sx={{ color: "common.white" }}>
            <ZoomInRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Loading indicator */}
      {loadingFull && !thumbSrc && (
        <CircularProgress sx={{ color: "common.white" }} />
      )}

      {/* Image */}
      {displaySrc && (
        <Box
          onWheel={handleWheel}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            overflow: "auto",
            cursor: zoom > 1 ? "grab" : "default",
          }}
        >
          <Box
            component="img"
            src={displaySrc}
            alt={filename}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              transform: `scale(${zoom})`,
              transition: "transform 0.15s ease, filter 0.4s ease",
              filter: showBlur ? "blur(12px)" : "none",
              transformOrigin: "center center",
            }}
          />
        </Box>
      )}
    </Box>
  );
});

export default ImageViewer;
