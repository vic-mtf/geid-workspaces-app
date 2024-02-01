import { TextField } from "@mui/material";
import React from "react";
import InputController from "../../../components/InputController";

export default function InputsMedia ({title, description, findError}) {
    const message = 'Intitulé non valide ou trop court.';
    return (
        <React.Fragment>
            <InputController  
                fullWidth
                margin="dense"
                valueRef={title}
                externalError={findError('title')}
                regExp={/.{2,}/}
                trim={false}
                invalidateErrorMessage={message}
            >
                <TextField label="Titre"/> 
            </InputController>
            <InputController  
                multiline
                fullWidth
                margin="dense"
                rows={3}
                valueRef={description}
                externalError={findError('description')}
                invalidateErrorMessage={message}
                regExp={/.{10,}/}
                trim={false}
            >
                <TextField label="Description"/> 
            </InputController>
        </React.Fragment>
    )
}