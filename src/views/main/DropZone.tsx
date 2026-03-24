import { useState, useCallback } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

interface DropZoneProps {
  children: React.ReactNode;
}

export default function DropZone({ children }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const theme = useTheme();
  let dragCounter = 0;

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    if (e.dataTransfer.types.includes("Files")) {
      setDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      setDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    document.getElementById("root")?.dispatchEvent(
      new CustomEvent("_open_files_form", {
        detail: { files, name: "_open_files_form" },
      })
    );
  }, []);

  return (
    <Box
      position="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{ flex: 1, minHeight: 0 }}
    >
      {children}
      {dragging && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={1.5}
          zIndex={10}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: `2px dashed ${theme.palette.primary.main}`,
            borderRadius: 2,
            pointerEvents: "none",
          }}
        >
          <CloudUploadOutlinedIcon
            sx={{ fontSize: 56, color: "primary.main", opacity: 0.7 }}
          />
          <Typography variant="h6" color="primary.main" fontWeight={500}>
            Déposez vos fichiers ici
          </Typography>
        </Box>
      )}
    </Box>
  );
}
