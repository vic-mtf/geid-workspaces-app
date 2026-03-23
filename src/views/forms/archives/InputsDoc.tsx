import { TextField } from "@mui/material";
import React from "react";
import Typology from "@/views/forms/archives/Typology";

interface InputsDocProps {
    register: any;
    errors: any;
    control: any;
}

export default function InputsDoc({ register, errors, control }: InputsDocProps) {
  return (
    <React.Fragment>
      <TextField
        label="Titre du document"
        fullWidth
        margin="dense"
        size="small"
        {...register("designation", {
          required: "Veuillez donner un titre à votre document",
          minLength: { value: 2, message: "Le titre doit contenir au moins 2 caractères" },
        })}
        helperText={errors?.designation?.message}
        error={!!errors?.designation}
      />

      <Typology margin="dense" control={control} errors={errors} />

      <TextField
        label="Description"
        fullWidth
        multiline
        margin="dense"
        size="small"
        rows={3}
        placeholder="Décrivez brièvement le contenu du document..."
        {...register("description", {
          required: "Veuillez ajouter une description du document",
          minLength: { value: 5, message: "La description doit contenir au moins 5 caractères" },
        })}
        helperText={errors?.description?.message}
        error={!!errors?.description}
      />

      <TextField
        label="Mots-clés (facultatif)"
        fullWidth
        margin="dense"
        size="small"
        placeholder="Ex : budget 2024, rapport, finance..."
        {...register("tags")}
        helperText="Séparez les mots-clés par des espaces pour faciliter la recherche"
      />
    </React.Fragment>
  );
}
