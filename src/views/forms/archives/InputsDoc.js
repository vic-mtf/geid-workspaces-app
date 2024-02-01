import { Box, CardMedia, ListItemButton, Stack, TextField } from "@mui/material";
import React, { useState } from "react";
import InputController from "../../../components/InputController";
import Typography from "../../../components/Typography";
import DocumentCoversPages from "../document-covers-pages/DocumentCoversPages";
import Typology from "./Typology";

export default function InputsDoc ({
    type,
    designation,
    subType,
    description,
    folder,
    findError
}) {

    const message = "Intitulé non valide ou trop court.";

    return (
        <React.Fragment>
            <Stack direction='row' spacing={1}>
                <Box
                    display="flex"
                    width="100%"
                >
                    <InputController  
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={designation}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('title')}
                    >
                        <TextField label="Désignation"/> 
                    </InputController>
                </Box>
            </Stack>
            <Typology
                margin="dense"
                type={type}
                subType={subType}
                externalError={findError('type')}
            />
            <Stack direction='row' spacing={1}>
                <Box display="flex" flex={1}>
                    <InputController  
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={folder}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('folder')}
                    >
                        <TextField label="Activité / Mission / Dossier"/> 
                    </InputController>
                </Box>
            </Stack>
            <InputController
                fullWidth
                multiline
                margin="dense"
                rows={3}
                label="Description"
                valueRef={description}
                regExp={/.{10,}/}
                trim={false}
                invalidateErrorMessage={message}
                externalError={findError('description')}
            > 
                <TextField label="Description"/> 
            </InputController> 
        </React.Fragment>
    )
}