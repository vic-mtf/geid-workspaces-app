/**
 * Photo — Affichage d'une image en mode vignette.
 *
 * 1. Skeleton pendant le chargement initial
 * 2. Miniature progressive : low (flou) → medium/high (net)
 * 3. Badge extension en bas gauche
 */

import React from "react";
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

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
      <Box
        sx={{
          width: 100,
          height: 120,
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

        {/* Miniature avec transition blur → net */}
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

        {/* Pas de miniature → icône */}
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
