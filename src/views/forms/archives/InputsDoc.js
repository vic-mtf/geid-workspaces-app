import { TextField } from "@mui/material";
import React from "react";
import Typology from "./Typology";

export default function InputsDoc({ register, errors, control }) {
  const message = "Intitulé non valide ou trop court.";

  return (
    <React.Fragment>
      <TextField
        label='Désignation'
        fullWidth
        margin='dense'
        {...register("designation", {
          required: "Veuillez renseigner une désignation",
          minLength: { value: 2, message },
        })}
        helperText={errors?.designation?.message}
        color={errors?.designation ? "error" : "primary"}
        FormHelperTextProps={{
          sx: { color: "error.main" },
        }}
      />

      <Typology margin='dense' control={control} errors={errors} />

      <TextField
        label='Activité / Mission / Dossier'
        fullWidth
        margin='dense'
        {...register("folder", {
          required:
            "Veuillez renseigner une activité, une mission ou un dossier",
          minLength: { value: 2, message },
        })}
        helperText={errors?.folder?.message}
        color={errors?.designation ? "error" : "primary"}
        FormHelperTextProps={{
          sx: { color: "error.main" },
        }}
      />

      <TextField
        label='Déscription'
        fullWidth
        multiline
        margin='dense'
        rows={3}
        {...register("description", {
          required: "Veuillez renseigner la description du document",
          minLength: { value: 5, message },
        })}
        helperText={errors?.description?.message}
        color={errors?.designation ? "error" : "primary"}
        FormHelperTextProps={{
          sx: { color: "error.main" },
        }}
      />
    </React.Fragment>
  );
}
