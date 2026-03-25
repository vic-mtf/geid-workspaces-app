import { Box, Stack, TextField } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
    const message = t("filesForm.invalidTitle");

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
                        <TextField label={t("filesForm.designation")}/>
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
                <TextField label={t("filesForm.keyword")}/>
            </InputController>
            <InputController
                fullWidth
                multiline
                margin="dense"
                rows={3}
                label={t("filesForm.description")}
                valueRef={description}
                regExp={/.{10,}/}
                trim={false}
                invalidateErrorMessage={message}
                externalError={findError('description')}
            >
                <TextField label={t("filesForm.description")}/>
            </InputController>
        </React.Fragment>
    )
}
