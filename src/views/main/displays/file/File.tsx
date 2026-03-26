/**
 * File — Dispatcher de rendu par type de fichier.
 *
 * Délègue à Photo, Doc, Video selon le type.
 * Fallback inconnu : même style paper que Doc avec l'icône blank.svg de file-icon-vectors.
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import Doc from "@/views/main/displays/file/Doc";
import Photo from "@/views/main/displays/file/Photo";
import Video from "@/views/main/displays/file/Video";
import style from "@/styles/paper.module.css";

// Icône fichier générique (blank) de file-icon-vectors
const blankIcon = new URL("../../../../../node_modules/file-icon-vectors/dist/icons/vivid/blank.svg", import.meta.url).href;

interface FileProps {
  type?: string;
  name?: string;
  icon?: string;
  [key: string]: any;
}

function File(props: FileProps) {
  if (props.type === "image") return <Photo {...props} />;
  if (props.type === "document") return <Doc {...props} />;
  if (props.type === "video") return <Video {...props} />;

  // Fallback : fichier inconnu — même style paper que Doc
  const ext = props.name?.split(".").pop()?.toUpperCase() ?? "";

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
        <Box component="img" src={blankIcon} sx={{ width: 40, height: 40, opacity: 0.7 }} />

        {ext && (
          <Box
            sx={{
              position: "absolute",
              bottom: 4,
              left: 4,
              px: 0.5,
              py: 0.15,
              borderRadius: 0.5,
              bgcolor: "rgba(0,0,0,0.6)",
            }}
          >
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              {ext}
            </Typography>
          </Box>
        )}
      </Box>
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
    </Box>
  );
}

export default React.memo(File);
