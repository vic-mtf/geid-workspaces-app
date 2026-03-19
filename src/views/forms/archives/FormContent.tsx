import React from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import InputsDoc from "./InputsDoc";
import { DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { useForm } from "react-hook-form";

interface FormContentProps {
    onClose: () => void;
    onSubmit: (fields: any) => void;
    file?: any;
}

export default function FormContent({ onClose, onSubmit }: FormContentProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  return (
    <Box component='form' onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle component='div'>
        <Typography variant='h6' fontWeight='bold' fontSize={18}>
          Soumettre cet article au service d'archivage
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          maxHeight: "75vh",
        }}>
        <InputsDoc errors={errors} register={register} control={control} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Annuler
        </Button>
        <Button type='submit' variant='outlined' color='primary'>
          Envoyer l'article
        </Button>
      </DialogActions>
    </Box>
  );
}
