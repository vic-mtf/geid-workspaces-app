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
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import getFileInfos from "@/utils/getFileInfos";
import getFileExtension from "@/utils/getFileExtension";

interface FormContentProps {
  onClose: () => void;
  onSubmit: (fields: any) => void;
  file?: any;
}

function formatSize(bytes: number): string {
  if (!bytes) return "";
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} Ko`
    : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function FormContent({ onClose, onSubmit, file }: FormContentProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const fileInfo = file ? getFileInfos(file) : null;
  const ext = file ? getFileExtension(file.name)?.toUpperCase() : "";
  const size = file?.size ? formatSize(file.size) : "";

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle component="div">
        <Typography variant="h6" fontWeight="bold" fontSize={18}>
          {t("archives.submitTitle")}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ maxHeight: "75vh" }}>
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
            {fileInfo?.icon && (
              <Box
                component="img"
                src={fileInfo.icon}
                alt=""
                sx={{ width: 36, height: 36, flexShrink: 0 }}
              />
            )}
            <Stack spacing={0} flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[ext, size, fileInfo?.type].filter(Boolean).join(" · ")}
              </Typography>
            </Stack>
          </Box>
        )}

        <InputsDoc errors={errors} register={register} control={control} />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t("common.cancel")}
        </Button>
        <Button type="submit" variant="outlined" color="primary">
          {t("archives.sendArticle")}
        </Button>
      </DialogActions>
    </Box>
  );
}
