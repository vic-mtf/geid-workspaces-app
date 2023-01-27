import { Box, CardMedia, ListItemButton, Stack, TextField } from "@mui/material";
import React, { useState } from "react";
import InputControler from "../../../components/InputControler";
import Typography from "../../../components/Typography";
import Covers from "../covers/Covers";
import BookTypology from "./BookTypology";

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
                    <InputControler  
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={title}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('title')}
                    >
                        <TextField label="Titre"/> 
                    </InputControler>

                    <BookTypology
                        margin="dense"
                        valueRef={type}
                        externalError={findError('type')}
                   />

                    <InputControler  
                        fullWidth
                        margin="dense"
                        trim={false}
                        regExp={/.{2,}/}
                        valueRef={author}
                        invalidateErrorMessage={message}
                        externalError={findError('author')}
                    >
                        <TextField label="Auteur"/> 
                    </InputControler>
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
            <InputControler
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
            </InputControler> 
            <Covers
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