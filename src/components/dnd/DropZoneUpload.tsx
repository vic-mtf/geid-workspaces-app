import { Box, Typography } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { useState, useCallback, DragEvent, ReactNode } from "react";
import { useDispatch } from "react-redux";
import { openFilesForm } from "@/redux/ui";

interface DropZoneUploadProps {
  children: ReactNode;
}

export default function DropZoneUpload({ children }: DropZoneUploadProps) {
  const dispatch = useDispatch();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      dispatch(openFilesForm(files));
    }
  }, [dispatch]);

  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      flex={1}
      minHeight={0}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && (
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
          bgcolor="rgba(28, 66, 148, 0.08)"
          border="2px dashed"
          borderColor="primary.main"
          borderRadius={2}
          zIndex={10}
          sx={{ pointerEvents: "none" }}
        >
          <CloudUploadOutlinedIcon sx={{ fontSize: 48 }} color="primary" />
          <Typography color="primary" fontWeight="bold" mt={1}>
            Déposez vos fichiers ici
          </Typography>
        </Box>
      )}
    </Box>
  );
}
