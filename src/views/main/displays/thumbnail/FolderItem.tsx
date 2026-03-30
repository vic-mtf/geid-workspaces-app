import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import timeAgo from "@/utils/timeAgo";

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

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ userSelect: "none", width: "100%", gap: 0 }}
    >
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

      {renderName ?? (
        <Typography
          variant="body2"
          noWrap
          sx={{
            maxWidth: 140,
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: 13,
            lineHeight: 1.3,
            fontWeight: 600,
            mt: -0.5,
          }}
        >
          {name || ""}
        </Typography>
      )}

      {date && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 10, lineHeight: 1.2 }}
        >
          {timeAgo(date)}
        </Typography>
      )}
    </Box>
  );
}

export default React.memo(FolderItem);
