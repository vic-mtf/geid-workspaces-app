import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";

interface FolderItemProps {
  name?: string;
  date?: string;
  count?: number;
  color?: string | null;
  renderName?: React.ReactNode;
}

function FolderItem({ name, date, count, color, renderName }: FolderItemProps) {
  const theme = useTheme();
  const folderColor = color || theme.palette.warning.main;
  const badgeColor = color || theme.palette.warning.dark;
  const formattedDate = date
    ? new Date(date).toLocaleDateString("fr-FR")
    : undefined;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ userSelect: "none", width: "100%", gap: 0 }}
    >
      {/* Icône avec badge — pas de container intermédiaire à hauteur fixe */}
      <Box sx={{ position: "relative", display: "inline-flex", lineHeight: 0 }}>
        <FolderRoundedIcon sx={{ fontSize: 110, color: folderColor }} />
        {count != null && count > 0 && (
          <Typography
            sx={{
              position: "absolute",
              bottom: "30px",
              left: "16px",
              color: badgeColor,
              fontSize: 16,
              fontWeight: 800,
              lineHeight: 1,
              filter: "brightness(0.7)",
              pointerEvents: "none",
              textShadow: "0 0 2px rgba(0,0,0,0.15)",
            }}
          >
            {count}
          </Typography>
        )}
      </Box>

      {/* Nom — directement collé sous l'icône */}
      {renderName ?? (
        <Typography
          variant="caption"
          align="center"
          sx={{
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            fontSize: 11,
            lineHeight: 1.3,
            fontWeight: 600,
            mt: -0.5,
          }}
        >
          {name || ""}
        </Typography>
      )}

      {/* Date — collée sous le nom */}
      {formattedDate && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 10, lineHeight: 1.2 }}
        >
          {formattedDate}
        </Typography>
      )}
    </Box>
  );
}

export default React.memo(FolderItem);
