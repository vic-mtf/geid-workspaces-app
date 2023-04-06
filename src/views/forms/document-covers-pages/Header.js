import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { AppBar, Stack, Toolbar, Tooltip } from "@mui/material";
import React, { useState } from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import getFile from "../../../utils/getFile";
import IconButton from "../../../components/IconButton";
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CoverForm from "./CoverPageForm";

export default function Header ({refresh, onClose}) {
    const [file, setFile] = useState();
    return (
        <React.Fragment>
            <CoverForm
                file={file}
                setFile={setFile}
                refresh={refresh}
            />
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar
                    variant="dense"
                >
                    <Tooltip arrow title="Fermer" enterDelay={700}>
                        <IconButton
                            size="small"
                            color="inherit"
                            onClick={onClose}
                        >
                            <CloseRoundedIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Typography 
                        ml={1} 
                        fontSize={15} 
                        flexGrow={1} 
                        variant="h6"
                    >
                        Couvertures des documents
                    </Typography>
                    <Button 
                        startIcon={<ClassOutlinedIcon/>}
                        endIcon={<AddOutlinedIcon/>}
                        color="inherit"
                        children="Ajouter une image de couverture depuis votre appareil ..."
                        size="small"
                        onClick={async() => {
                            const [file] = await getFile({accept: 'image/*'});
                            if(file) setFile(file);
                        }}
                    />
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
}