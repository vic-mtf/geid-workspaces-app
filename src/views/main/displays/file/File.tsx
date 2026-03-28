/**
 * File — Dispatcher de rendu par type de fichier.
 * Délègue à Photo, Doc, Video selon le type.
 * Fallback inconnu : react-file-icon moderne.
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import Doc from "@/views/main/displays/file/Doc";
import Photo from "@/views/main/displays/file/Photo";
import Video from "@/views/main/displays/file/Video";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";
import style from "@/styles/paper.module.css";

interface FileProps {
  type?: string;
  name?: string;
  icon?: string;
  renderName?: React.ReactNode;
  [key: string]: any;
}

function File(props: FileProps) {
  if (props.type === "image") return <Photo {...props} />;
  if (props.type === "document") return <Doc {...props} />;
  if (props.type === "video") return <Video {...props} />;

  // Fallback : fichier inconnu
  const ext = getFileExtension(props.name ?? "") ?? "txt";

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
        <FileTypeIcon extension={ext} size={48} />
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

export default React.memo(File);
