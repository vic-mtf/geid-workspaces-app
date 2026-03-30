/**
 * Photo — Affichage d'une image en mode vignette.
 * Le container s'adapte au ratio de l'image (backend ou detecte).
 */

import React, { useState, useCallback, useMemo } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import useAdaptiveThumbnail from "@/hooks/useAdaptiveThumbnail";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";
import timeAgo from "@/utils/timeAgo";

interface PhotoProps {
  url?: string;
  name?: string;
  icon?: string;
  imageWidth?: number;
  imageHeight?: number;
  date?: string;
  renderName?: React.ReactNode;
  [key: string]: any;
}

function Photo(props: PhotoProps) {
  const { src, loading, isBlurred } = useAdaptiveThumbnail(props.url);

  // Ratio depuis le backend ou detecte au chargement
  const propsRatio = props.imageWidth && props.imageHeight && props.imageHeight > 0
    ? props.imageWidth / props.imageHeight : null;
  const [detectedRatio, setDetectedRatio] = useState<number | null>(null);
  const ratio = propsRatio || detectedRatio;

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (propsRatio) return;
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setDetectedRatio(img.naturalWidth / img.naturalHeight);
    }
  }, [propsRatio]);

  // Container adapte au ratio — max 160px large, max 130px haut
  const size = useMemo(() => {
    const maxW = 160;
    const maxH = 130;
    if (!ratio) return { width: 120, height: 100 }; // defaut avant detection
    if (ratio >= 1) {
      // Paysage
      const w = maxW;
      const h = Math.round(w / ratio);
      return { width: w, height: Math.min(h, maxH) };
    }
    // Portrait
    const h = maxH;
    const w = Math.round(h * ratio);
    return { width: Math.min(w, maxW), height: h };
  }, [ratio]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
      <Box
        sx={{
          width: size.width,
          height: size.height,
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
            onLoad={onLoad}
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
          <FileTypeIcon extension={getFileExtension(props.name ?? "") ?? "jpg"} size={48} />
        )}
      </Box>

      {props.renderName ?? (
        <Typography
          variant="body2"
          noWrap
          sx={{
            maxWidth: 160,
            textOverflow: "ellipsis",
            overflow: "hidden",
            fontSize: 13,
            lineHeight: 1.3,
          }}
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

export default React.memo(Photo);
