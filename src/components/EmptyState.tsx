import { Box, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  message?: string;
}

export default function EmptyState({
  icon = <InboxOutlinedIcon sx={{ fontSize: 56 }} color="disabled" />,
  message = "Aucun élément",
}: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      flex={1}
      minHeight={300}
      gap={1.5}
      sx={{ userSelect: "none" }}
    >
      {icon}
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
}
