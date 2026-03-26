/**
 * Photo — Affichage d'une image en mode vignette.
 *
 * 1. Skeleton pendant le chargement
 * 2. Miniature en couverture + badge extension en bas gauche
 */

import React, { useEffect, useState } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

interface PhotoProps {
  url?: string;
  name?: string;
  icon?: string;
  [key: string]: any;
}

function Photo(props: PhotoProps) {
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const token = useSelector((store: RootState) => store.user.token);

  useEffect(() => {
    if (!props.url) { setLoading(false); return; }
    let revoked = false;
    const thumbUrl = props.url.replace("/file/", "/thumbnail/");
    fetch(thumbUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 204 || !res.ok) return null;
        return res.blob();
      })
      .then((blob) => {
        if (blob && !revoked) setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => {})
      .finally(() => { if (!revoked) setLoading(false); });
    return () => { revoked = true; };
  }, [props.url, token]);

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  // Extension pour le badge
  const ext = props.name?.split(".").pop()?.toUpperCase() ?? "";

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={1}>
      <Box
        sx={{
          width: 140,
          height: 120,
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
        {/* Skeleton pendant le chargement */}
        {loading && (
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ position: "absolute", inset: 0 }} />
        )}

        {/* Miniature chargée */}
        {blobUrl && !loading && (
          <Box
            component="img"
            src={blobUrl}
            onLoad={() => setLoading(false)}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {/* Pas de miniature → icône */}
        {!blobUrl && !loading && props.icon && (
          <Box component="img" src={props.icon} sx={{ width: 48, height: 48, opacity: 0.6 }} />
        )}

        {/* Badge icône extension en bas gauche */}
        {!loading && props.icon && (
          <Box
            sx={{
              position: "absolute",
              bottom: 4,
              left: 4,
              width: 24,
              height: 24,
              borderRadius: 0.5,
              bgcolor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box component="img" src={props.icon} sx={{ width: 16, height: 16 }} />
          </Box>
        )}
      </Box>

      <Typography
        align="center"
        width={150}
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {props.name?.replace(/_/gi, " ")}
      </Typography>
    </Box>
  );
}

export default React.memo(Photo);
