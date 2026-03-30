import { Box, Button, Chip, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import Typology from "@/views/forms/archives/Typology";

interface InputsDocProps {
    register: any;
    errors: any;
    control: any;
}

export default function InputsDoc({ register, errors, control }: InputsDocProps) {
  const { t } = useTranslation();
  const [tagInput, setTagInput] = useState("");

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

      {/* Mots-cles avec chips */}
      <Controller
        name="tags"
        control={control}
        defaultValue=""
        render={({ field: { value, onChange } }) => {
          const tags = value ? value.split(/\s+/).filter(Boolean) : [];
          const handleAdd = () => {
            const tag = tagInput.trim();
            if (!tag) return;
            const updated = value ? `${value} ${tag}` : tag;
            onChange(updated);
            setTagInput("");
          };
          const handleRemove = (tagToRemove: string) => {
            const updated = tags.filter((t: string) => t !== tagToRemove).join(" ");
            onChange(updated);
          };
          return (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                {t("archives.keywords")}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
                <TextField
                  size="small"
                  placeholder={t("archives.keywordsPlaceholder")}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                  sx={{ flex: 1 }}
                  InputProps={{ sx: { fontSize: 13 } }}
                />
                <Button size="small" variant="outlined" onClick={handleAdd} disabled={!tagInput.trim()}>+</Button>
              </Box>
              {tags.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {tags.map((tag: string, i: number) => (
                    <Chip key={i} label={tag} size="small" variant="outlined" sx={{ fontSize: 11 }} onDelete={() => handleRemove(tag)} />
                  ))}
                </Box>
              )}
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                {t("archives.keywordsHelper")}
              </Typography>
            </Box>
          );
        }}
      />
    </React.Fragment>
  );
}
