import React, { useRef, useState } from "react";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import Button from "../../../components/Button";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import getFile from "../../../utils/getFile";

export default function TeleverseButton () {
    const [openMenu, setOpenMenu] = useState(false);
    const anchorEl = useRef();

    return (
        <React.Fragment>
            <Button
                startIcon={<PublishRoundedIcon/>}
                endIcon={<ExpandMoreRoundedIcon/>}
                color="inherit"
                ref={anchorEl}
                onClick={() => setOpenMenu(true)}
            >Téléverser</Button>
            <Menu
                open={openMenu}
                variant="selectedMenu"
                MenuListProps={{
                    dense: true,
                }}
                PaperProps={{
                    sx: {
                        bgcolor: theme => theme.palette.background.paper + 
                        theme.customOptions.opacity,
                        border: theme => `1px solid ${theme.palette.divider}`,
                        backdropFilter: theme => `blur(${theme.customOptions.blur})`,
                    }
                }}
                anchorEl={anchorEl.current}
                onClose={() => setOpenMenu(false)}
            >

                <MenuItem
                    onClick={async () => {
                        const files = await getFile({multiple: true, accept: '*.*'});
                        if(files) {
                            const customEvent = new CustomEvent('_upload_files', {
                                detail: {
                                   files,
                                   name: '_upload_files' ,
                                }
                            });
                            document.getElementById('root')
                            .dispatchEvent(customEvent);
                            setOpenMenu(false);
                        }
                    }}
                >   
                    <ListItemIcon>
                        <InsertDriveFileOutlinedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Fichier" />
                </MenuItem>
                <MenuItem
                    disabled
                >
                    <ListItemIcon>
                        <FolderOutlinedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Dossier" />
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
}