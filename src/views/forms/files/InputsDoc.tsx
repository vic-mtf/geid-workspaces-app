import { Box, Stack, TextField } from "@mui/material";
import React from "react";
import InputController from "@/components/InputController";

interface InputsDocProps {
    designation?: React.MutableRefObject<string | null>;
    subType?: React.MutableRefObject<string | null>;
    tags?: React.MutableRefObject<string | null>;
    description?: React.MutableRefObject<string | null>;
    findError: (field: string) => boolean;
}

export default function InputsDoc ({
    designation,
    tags,
    description,
    findError
}: InputsDocProps) {

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

            <InputController
                fullWidth
                margin="dense"
                trim={false}
                valueRef={tags}
                regExp={/.{0,}/}
                invalidateErrorMessage={message}
                externalError={findError('tags')}
            >
                <TextField label="Mot clé"/>
            </InputController>
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
