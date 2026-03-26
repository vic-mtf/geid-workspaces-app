import { Box, Typography } from "@mui/material";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";

interface FolderItemProps {
  name?: string;
  date?: string;
  count?: number;
}

export default function FolderItem({ name, date, count }: FolderItemProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("fr-FR")
    : undefined;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ userSelect: "none", width: "100%" }}
    >
      {/* Icon container */}
      <Box
        sx={{
          position: "relative",
          width: 100,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 0.5,
        }}
      >
        <FolderRoundedIcon sx={{ fontSize: 64, color: "warning.main" }} />
        {count != null && count > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 18,
              left: 14,
              bgcolor: "warning.dark",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 0.5,
              minWidth: 16,
              textAlign: "center",
              lineHeight: "16px",
              px: 0.3,
            }}
          >
            {count}
          </Box>
        )}
      </Box>
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
        }}
      >
        {(name || "").replace(/_/g, " ")}
      </Typography>
      {formattedDate && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 10, lineHeight: 1.2, mt: 0.25 }}
        >
          {formattedDate}
        </Typography>
      )}
    </Box>
  );
}
