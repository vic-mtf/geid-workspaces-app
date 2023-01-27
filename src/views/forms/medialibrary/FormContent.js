import React from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import InputsBook from "./InputsBook";
import InputsMedia from "./InputsMedia";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';

export default function FormContent ({
    file,
    mediaFields,
    findError,
    handleSendFile,
    typeInfos,
    bookFields,
    onClose
}) {
    return (
        <React.Fragment>
        <Dialog 
          open={!!file}
          BackdropProps={{
            sx: {
              bgcolor: theme => theme.palette.background.paper + 
              theme.customOptions.opacity,
              border: theme => `1px solid ${theme.palette.divider}`,
              backdropFilter: theme => `blur(${theme.customOptions.blur})`,
            }
          }}
        >
          <DialogTitle component="div">
            <Typography
                variant="h6"
                fontWeight="bold"
                fontSize={18}
            >
                Soumettre cet article à la médiathèque
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSendFile(file)}>
          <DialogContent sx={{width: 500}}>
            {
              typeInfos?.type === 'media' ? 
              (<InputsMedia {...mediaFields} findError={findError} />) : 
              (<InputsBook {...bookFields} findError={findError} />)
            }
            <DialogContentText component="div">
                <Typography my={1}>
                  En raison de ce type de fichier, 
                  cet élément sera soumis à la section {typeInfos?.label}.
                </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={onClose}
              color="primary"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Envoyer l'article
            </Button>
          </DialogActions>
          </form>
        </Dialog>
      </React.Fragment>
    )
}