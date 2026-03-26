import { useState, useCallback } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

interface DropZoneProps {
  children: React.ReactNode;
}

export default function DropZone({ children }: DropZoneProps) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const theme = useTheme();
  let dragCounter = 0;

  const isExternalDrag = useCallback((e: React.DragEvent) => {
    // External files have "Files" in dataTransfer.types
    // Internal drags have "fileName" set via setData
    return e.dataTransfer.types.includes("Files") && !e.dataTransfer.types.includes("fileName");
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isExternalDrag(e)) return;
    dragCounter++;
    setDragging(true);
  }, [isExternalDrag]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isExternalDrag(e)) return;
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      setDragging(false);
    }
  }, [isExternalDrag]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!isExternalDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
  }, [isExternalDrag]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!isExternalDrag(e)) return;
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
  }, [isExternalDrag]);

  return (
    <Box
      position="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden" }}
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
            {t("files.dropFilesHere")}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
