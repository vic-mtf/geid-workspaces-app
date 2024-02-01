import React from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import InputsDoc from "./InputsDoc";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';

export default function FormContent ({
    file,
    findError,
    handleSendFile,
    docFields,
    onClose
}) {
    return (
        <React.Fragment>
        <Dialog 
          open={!!file}
          PaperProps={{
            sx: {overflow: 'hidden'}
          }}
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
                Soumettre cet article au service d'archivage
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSendFile(file)}>
          <DialogContent
            sx={{
              maxHeight: '75vh'
            }}
          >
           <InputsDoc {...docFields} findError={findError} />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={onClose}
              color="primary"
            >Annuler
            </Button>
            <Button
              type="submit"
              variant="outlined"
              color="primary"
            >Envoyer l'article
            </Button>
          </DialogActions>
          </form>
        </Dialog>
      </React.Fragment>
    )
}