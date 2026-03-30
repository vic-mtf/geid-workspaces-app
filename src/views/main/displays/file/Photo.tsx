/**
 * Photo — Affichage d'une image en mode vignette.
 *
 * 1. Skeleton pendant le chargement initial
 * 2. Miniature progressive : low (flou) → medium/high (net)
 * 3. Ratio naturel de l'image preserve
 */

import React, { useState, useCallback } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import useAdaptiveThumbnail from "@/hooks/useAdaptiveThumbnail";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";

interface PhotoProps {
  url?: string;
  name?: string;
  icon?: string;
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
    if (propsRatio) return; // deja connu
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setDetectedRatio(img.naturalWidth / img.naturalHeight);
    }
  }, [propsRatio]);

  const maxW = 140;
  const maxH = 120;
  let w = 100;
  let h = 120;
  if (ratio) {
    if (ratio >= 1) { w = Math.min(maxW, maxH * ratio); h = w / ratio; }
    else { h = Math.min(maxH, maxW / ratio); w = h * ratio; }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
      <Box
        sx={{
          width: w,
          height: h,
          mb: 0.5,
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          boxShadow: 3,
          bgcolor: "action.hover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "width 0.2s, height 0.2s",
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

export default React.memo(Photo);
