import { TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import Typology from "@/views/forms/archives/Typology";

interface InputsDocProps {
    register: any;
    errors: any;
    control: any;
}

export default function InputsDoc({ register, errors, control }: InputsDocProps) {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <TextField
        label={t("archives.docTitle")}
        fullWidth
        margin="dense"
        size="small"
        {...register("designation", {
          required: t("archives.docTitleRequired"),
          minLength: { value: 2, message: t("archives.docTitleMinLength") },
        })}
        helperText={errors?.designation?.message}
        error={!!errors?.designation}
      />

      <TextField
        label={t("archives.refNumber")}
        fullWidth
        margin="dense"
        size="small"
        placeholder={t("archives.refNumberPlaceholder")}
        {...register("refNumber")}
        helperText={t("archives.refNumberHelper")}
      />

      <Typology margin="dense" control={control} errors={errors} />

      <TextField
        label={t("archives.description")}
        fullWidth
        multiline
        margin="dense"
        size="small"
        rows={3}
        placeholder={t("archives.descriptionPlaceholder")}
        {...register("description", {
          required: t("archives.descriptionRequired"),
          minLength: { value: 5, message: t("archives.descriptionMinLength") },
        })}
        helperText={errors?.description?.message}
        error={!!errors?.description}
      />

      <TextField
        label={t("archives.keywords")}
        fullWidth
        margin="dense"
        size="small"
        placeholder={t("archives.keywordsPlaceholder")}
        {...register("tags")}
        helperText={t("archives.keywordsHelper")}
      />
    </React.Fragment>
  );
}
