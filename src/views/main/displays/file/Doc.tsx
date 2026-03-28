/**
 * Doc — Affichage d'un document en mode vignette.
 *
 * 1. Affiche l'icône du type au centre pendant le chargement
 * 2. Quand la miniature arrive : photo en couverture + petite icône d'extension en bas gauche
 * 3. Si pas de miniature : reste sur l'icône
 */

import React, { useEffect, useState } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/types";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";
import style from "@/styles/paper.module.css";

interface DocProps {
  icon?: string;
  name?: string;
  url?: string;
  renderName?: React.ReactNode;
  [key: string]: any;
}

function Doc(props: DocProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((store: RootState) => store.user.token);

  // Charger la miniature via l'endpoint thumbnail
  useEffect(() => {
    if (!props.url) { setLoading(false); return; }
    let revoked = false;
    const url = props.url.replace("/file/", "/thumbnail/");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 204 || !res.ok) return null;
        return res.blob();
      })
      .then((blob) => {
        if (blob && !revoked) setThumbUrl(URL.createObjectURL(blob));
      })
      .catch(() => {})
      .finally(() => { if (!revoked) setLoading(false); });
    return () => { revoked = true; };
  }, [props.url, token]);

  useEffect(() => () => { if (thumbUrl) URL.revokeObjectURL(thumbUrl); }, [thumbUrl]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
      <Box
        height={120}
        width={100}
        mb={1}
        className={style.paper}
        sx={{
          boxShadow: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* État : chargement */}
        {loading && (
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ position: "absolute", inset: 0 }} />
        )}

        {/* État : miniature chargée → image en couverture */}
        {thumbUrl && !loading && (
          <Box
            component="img"
            src={thumbUrl}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* État : pas de miniature → icône moderne au centre */}
        {!thumbUrl && !loading && (
          <FileTypeIcon extension={getFileExtension(props.name ?? "") ?? "txt"} size={48} />
        )}

        {/* Badge extension en bas gauche */}
        {thumbUrl && !loading && (
          <Box
            sx={{
              position: "absolute",
              bottom: 4,
              left: 4,
              width: 22,
              height: 22,
              borderRadius: 0.5,
              bgcolor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <FileTypeIcon extension={getFileExtension(props.name ?? "") ?? "txt"} size={14} />
          </Box>
        )}
      </Box>

      {props.renderName ?? (
        <Typography
          width={120}
          align="center"
          sx={{
            display: "-webkit-box",
            maxWidth: 200,
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {props.name?.replace(/_/gi, " ")}
        </Typography>
      )}
    </Box>
  );
}

export default React.memo(Doc);
