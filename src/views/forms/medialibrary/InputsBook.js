import { Box, CardMedia, ListItemButton, Stack, TextField } from "@mui/material";
import React, { useState } from "react";
import InputController from "../../../components/InputController";
import Typography from "../../../components/Typography";
import BookTypology from "./BookTypology";
import DocumentCoversPages from "../document-covers-pages/DocumentCoversPages";

export default function InputsBook ({
    author,
    type,
    title,
    description,
    cover,
    findError
}) {
    const [openCover, setOpenCover] = useState(false);
    const message = "Intitulé non valide ou trop court.";
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
                        <TextField label="Titre"/> 
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
                        <TextField label="Auteur"/> 
                    </InputController>
                </Box>
                
                <Box>
                    <ListItemButton
                        sx={{
                            width: 120,
                            height: '100%',
                            border: theme => `1px solid ${
                                errorCover ? 
                                theme.palette.error.main : theme.palette.divider
                            }`,
                            p: 0,
                            borderRadius: 1,
                            overflow: 'hidden',
                        }}
                        onClick={() => setOpenCover(true)}
                    >
                        {cover.current ?
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
                            Choisir la couverture
                        </Typography>)}
                    </ListItemButton>
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
                externalError={findError('type')}
            > 
                <TextField label="Description"/> 
            </InputController> 
            <DocumentCoversPages
                open={openCover}
                onClose={() => setOpenCover(false)}
                onCover={_cover => {
                    cover.current = _cover;
                    setOpenCover(false);
                }}
            />
        </React.Fragment>
    )
}