import { TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import InputController from "@/components/InputController";

interface InputsMediaProps {
    title?: React.MutableRefObject<string | null>;
    description?: React.MutableRefObject<string | null>;
    findError: (field: string) => boolean;
}

export default function InputsMedia ({title, description, findError}: InputsMediaProps) {
    const { t } = useTranslation();
    const message = t('medialibrary.invalidTitle');
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
                <TextField label={t("medialibrary.title")}/>
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
                <TextField label={t("archives.description")}/>
            </InputController>
        </React.Fragment>
    )
}
