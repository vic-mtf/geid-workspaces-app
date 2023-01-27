import { Box, CardMedia, ListItemButton, Stack, TextField } from "@mui/material";
import React, { useState } from "react";
import InputControler from "../../../components/InputControler";
import Typography from "../../../components/Typography";
import Covers from "../covers/Covers";
import Typology from "./Typology";

export default function InputsBook ({
    origin,
    type,
    activity,
    object,
    mission,
    designation,
    emergency,
    confidentiality,
    destination,
    description,
    folder,
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
                        valueRef={designation}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('title')}
                    >
                        <TextField label="Désignation"/> 
                    </InputControler>

                    <InputControler  
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={object}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('object')}
                    >
                        <TextField label="Objet"/> 
                    </InputControler>
                    <InputControler  
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={emergency}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('emergency')}
                    >
                        <TextField label="Urgence"/> 
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
            <Typology
                margin="dense"
                valueRef={type}
                externalError={findError('type')}
            />
            <Stack direction='row' spacing={1} display="flex">
                <Box flex={1}>
                    <InputControler  
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={origin}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('origin')}
                    >
                        <TextField label="Provenance"/> 
                    </InputControler>
                </Box>
                <Box flex={1}>
                    <InputControler  
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={destination}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('origin')}
                    >
                        <TextField label="Destination"/> 
                    </InputControler>
                </Box>
            </Stack>
            <Stack direction='row' spacing={1}>
                <Box display="flex" flex={1}>
                    <InputControler  
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={activity}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('activity')}
                    >
                        <TextField label="Activité / Mission / Dossier"/> 
                    </InputControler>
                </Box>
                
                <Box display="flex" flex={1}>
                    <InputControler  
                        fullWidth
                        margin="dense"
                        trim={false}
                        valueRef={confidentiality}
                        regExp={/.{2,}/}
                        invalidateErrorMessage={message}
                        externalError={findError('confidentiality')}
                    >
                        <TextField label="Confidentialité"/> 
                    </InputControler>
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