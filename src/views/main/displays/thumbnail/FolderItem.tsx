import { Box, Typography } from "@mui/material";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";

interface FolderItemProps {
  name?: string;
}

export default function FolderItem({ name }: FolderItemProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={1.5}
      sx={{ userSelect: "none" }}
    >
      <FolderRoundedIcon sx={{ fontSize: 48, color: "primary.main", opacity: 0.85 }} />
      <Typography
        variant="caption"
        align="center"
        color="text.primary"
        sx={{
          mt: 0.5,
          maxWidth: 110,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          wordBreak: "break-word",
          fontSize: 12,
          lineHeight: 1.3,
        }}
      >
        {(name || "").replace(/_/g, " ")}
      </Typography>
    </Box>
  );
}
