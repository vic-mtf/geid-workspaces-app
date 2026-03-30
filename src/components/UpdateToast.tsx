import React, { useEffect } from "react";
import { Box, Fade, Typography } from "@mui/material";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { useTranslation } from "react-i18next";

interface UpdateToastProps {
  open: boolean;
  onClose: () => void;
  duration?: number;
}

function UpdateToast({ open, onClose, duration = 2500 }: UpdateToastProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, onClose, duration]);

  return (
    <Fade in={open} timeout={400}>
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1300,
          bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          backdropFilter: "blur(12px)",
          color: "text.secondary",
          borderRadius: 4,
          px: 1.2,
          py: 0.3,
          display: "flex",
          alignItems: "center",
          gap: 0.4,
          pointerEvents: "none",
          opacity: 0.6,
        }}
      >
        <SyncOutlinedIcon sx={{ fontSize: 12 }} />
        <Typography sx={{ fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" }}>
          {t("files.dataUpdated") || "Contenu mis a jour"}
        </Typography>
      </Box>
    </Fade>
  );
}

export default React.memo(UpdateToast);
