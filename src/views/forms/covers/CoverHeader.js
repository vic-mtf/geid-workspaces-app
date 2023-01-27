import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { AppBar, IconButton, Stack, Toolbar, Tooltip } from "@mui/material";
import React from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import getFile from "../../../utils/getFile";

export default function CoverHeader (props) {
    

    return (
        <React.Fragment>
            {/* <CoverForm
                file={values.file}
                onClose={() => setValues({
                    ...values, 
                    file: null,
                })}
                refetch={props.refetch}
            /> */}
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar
                    variant="dense"
                >
                    <Typography fontSize={18} fontWeight="bold" flexGrow={1} variant="h6" >
                        Couvertures des documents
                    </Typography>
                    <Tooltip arrow title="sortir" enterDelay={700}>
                        <IconButton
                            size="small"
                            color="inherit"
                            onClick={props.onClose}
                        >
                            <CloseRoundedIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Stack direction="row" spacing={1} sx={{bgcolor: 'background.paper', p: 1}}>
                <Button 
                    children="Ajouter une image de couverture depuis votre appareil ..."
                    size="small"
                    onClick={async() => {
                        //const file = await getFile({accept: 'images/*'});

                    }}
                />
            </Stack>
        </React.Fragment>
    )
}