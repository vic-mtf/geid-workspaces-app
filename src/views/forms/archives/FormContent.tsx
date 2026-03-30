import React from "react";
import InputsDoc from "@/views/forms/archives/InputsDoc";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";

interface FormContentProps {
  onClose: () => void;
  onSubmit: (fields: any) => void;
  file?: any;
}

export default function FormContent({ onClose, onSubmit, file }: FormContentProps) {
  const { t } = useTranslation();
  const ext = getFileExtension(file?.name ?? "") ?? "";
  const size = file?.size ? normaliseOctetSize(file.size) : "";

  // Auto-compléter la designation avec le nom du fichier sans extension
  const nameWithoutExt = file?.name
    ? (file.name.includes(".") ? file.name.substring(0, file.name.lastIndexOf(".")) : file.name).replace(/_/g, " ")
    : "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      designation: nameWithoutExt,
      description: "",
      refNumber: "",
      tags: (file?.tags || []).join(" "),
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography variant="h6" fontWeight="bold" fontSize={16}>
          {t("archives.submitTitle")}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ maxHeight: "75vh" }}>
        {/* Aperçu fichier */}
        {file && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <FileTypeIcon extension={ext || "txt"} size={32} />
            <Stack spacing={0} flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[ext.toUpperCase(), size, file.currentPath || ""].filter(Boolean).join(" · ")}
              </Typography>
            </Stack>
          </Box>
        )}

        <InputsDoc errors={errors} register={register} control={control} />
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel")}
        </Button>
        <Button type="submit" variant="contained" startIcon={<SendRoundedIcon />} sx={{ textTransform: "none" }}>
          {t("archives.sendArticle")}
        </Button>
      </DialogActions>
    </Box>
  );
}
