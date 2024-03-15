import React, { useMemo } from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import InputsDoc from "./InputsDoc";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box as MuiBox
} from '@mui/material';
import FileItem from "./FileItem";
import getFileInfos from "../../../utils/getFileInfos";
import normaliseOctetSize from "../../../utils/normaliseOctetSize";

export default function FormContent ({
    files,
    findError,
    handleSendFile,
    docFields,
    onClose,
    setFiles
}) {
    const items = useMemo(() => files ? [...files] : [], [files]);
    return (
        <React.Fragment>
        <Dialog 
          open={!!files}
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
            >Téléverser les fichiers
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSendFile(files)}>
          <DialogContent
            sx={{
              maxHeight: '70vh',
              maxWidth: 500,
              minWidth: 300,
            }}
          >
            <MuiBox>
              {items.map((file, index) => (
                <FileItem
                  {...getFileInfos(file)}
                  name={file.name}
                  key={index}
                  title={`${file.name}, ${normaliseOctetSize(file.size)}`}
                  onDelete={() => 
                      setFiles(files => files.length > 1 ?
                          files.filter((_, currentIndex) => index !== currentIndex) :
                          null
                      )
                  }
                />
              ))}
            </MuiBox>
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
            >Téléverser</Button>
          </DialogActions>
          </form>
        </Dialog>
      </React.Fragment>
    )
}