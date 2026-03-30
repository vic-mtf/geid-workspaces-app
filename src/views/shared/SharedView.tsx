import { Box, Typography } from "@mui/material";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import { useTranslation } from "react-i18next";

export default function SharedView() {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, height: "100%", gap: 1.5, p: 3 }}>
      <BuildOutlinedIcon sx={{ fontSize: 56, opacity: 0.3 }} />
      <Typography color="text.secondary" fontWeight="bold" textAlign="center">
        {t("shared.maintenance") || "Cette fonctionnalite est en cours de maintenance"}
      </Typography>
      <Typography variant="body2" color="text.disabled" textAlign="center">
        {t("shared.maintenanceHint") || "L'espace partage sera bientot disponible avec une nouvelle experience amelioree."}
      </Typography>
    </Box>
  );
}
