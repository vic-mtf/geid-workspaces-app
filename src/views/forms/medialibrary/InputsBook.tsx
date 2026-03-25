import { Box, CardMedia, ListItemButton, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InputController from "@/components/InputController";
import BookTypology from "@/views/forms/medialibrary/BookTypology";
import DocumentCoversPages from "@/views/forms/document-covers-pages/DocumentCoversPages";

interface InputsBookProps {
    author?: React.MutableRefObject<string | null>;
    type?: React.MutableRefObject<string | null>;
    title?: React.MutableRefObject<string | null>;
    description?: React.MutableRefObject<string | null>;
    cover?: React.MutableRefObject<any>;
    findError: (field: string) => boolean;
}

export default function InputsBook ({
    author,
    type,
    title,
    description,
    cover,
    findError
}: InputsBookProps) {
    const { t } = useTranslation();
    const [openCover, setOpenCover] = useState(false);
    const message = t("medialibrary.invalidTitle");
    const errorCover = findError('cover') && !cover?.current;

    return (
        <React.Fragment>
            <Stack direction='row' spacing={1}>
                <Box>
                    <InputController
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={title}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('title')}
                    >
                        <TextField label={t("medialibrary.title")}/>
                    </InputController>

                    <BookTypology
                        margin="dense"
                        valueRef={type}
                        externalError={findError('type')}
                   />

                    <InputController
                        fullWidth
                        margin="dense"
                        trim={false}
                        regExp={/.{2,}/}
                        valueRef={author}
                        invalidateErrorMessage={message}
                        externalError={findError('author')}
                    >
                        <TextField label={t("medialibrary.author")}/>
                    </InputController>
                </Box>

                <Box>
                    <ListItemButton
                        sx={{
                            width: 120,
                            height: '100%',
                            border: (theme: any) => `1px solid ${
                                errorCover ?
                                theme.palette.error.main : theme.palette.divider
                            }`,
                            p: 0,
                            borderRadius: 1,
                            overflow: 'hidden',
                        }}
                        onClick={() => setOpenCover(true)}
                    >
                        {cover?.current ?
                        (<CardMedia
                            sx={{
                                width: '100%',
                                height: '100%'
                            }}
                            component="img"
                            src={cover.current?.contentUrl}
                        />)
                        :
                        (<Typography
                            align="center"
                            color={errorCover ? 'error' : 'text.primary'}
                        >
                            {t("medialibrary.chooseCover")}
                        </Typography>)}
                    </ListItemButton>
                </Box>
            </Stack>
            <InputController
                fullWidth
                multiline
                margin="dense"
                rows={3}
                label={t("archives.description")}
                valueRef={description}
                regExp={/.{10,}/}
                trim={false}
                invalidateErrorMessage={message}
                externalError={findError('type')}
            >
                <TextField label={t("archives.description")}/>
            </InputController>
            <DocumentCoversPages
                open={openCover}
                onClose={() => setOpenCover(false)}
                onCover={(_cover: any) => {
                    if(cover) cover.current = _cover;
                    setOpenCover(false);
                }}
            />
        </React.Fragment>
    )
}
