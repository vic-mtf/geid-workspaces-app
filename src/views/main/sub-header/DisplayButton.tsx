import React, { useRef, useState } from "react";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import SegmentRoundedIcon from '@mui/icons-material/SegmentRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useSelector, useDispatch } from "react-redux";
import { setViewMode, ViewMode } from "@/redux/workspace";
import { RootState } from "@/types";

const listDisplayMode: { label: string; key: string; icon: React.ReactNode; mode: ViewMode }[] = [
    {
        label: 'Vignette',
        key: '_grid',
        icon: <GridViewOutlinedIcon/>,
        mode: 'grid',
    },
    {
        label: 'Liste',
        key: '_list',
        icon: <SegmentRoundedIcon/>,
        mode: 'list',
    },
];

export default function DisplayButton () {
    const dispatch = useDispatch();
    const [openMenu, setOpenMenu] = useState(false);
    const anchorEl = useRef<HTMLButtonElement>(null);
    const viewMode = useSelector((store: RootState) => store.workspace.viewMode);

    const btnSelected = listDisplayMode.find(opt => opt.mode === viewMode) || listDisplayMode[0];

    return (
        <React.Fragment>
            <Button
                endIcon={<ExpandMoreRoundedIcon/>}
                startIcon={btnSelected?.icon}
                ref={anchorEl}
                color="inherit"
                onClick={() => setOpenMenu(true)}
            >Affichage</Button>
            <Menu
                open={openMenu}
                variant="selectedMenu"
                MenuListProps={{ dense: true }}
                PaperProps={{
                    sx: {
                        bgcolor: (theme: any) => theme.palette.background.paper +
                        theme.customOptions.opacity,
                        border: (theme: any) => `1px solid ${theme.palette.divider}`,
                        backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                    }
                }}
                anchorEl={anchorEl.current}
                onClose={() => setOpenMenu(false)}
            >
                {listDisplayMode.map(({ icon, label, key, mode }) => (
                    <MenuItem
                        key={key}
                        onClick={() => {
                            dispatch(setViewMode(mode));
                            setOpenMenu(false);
                        }}
                    >
                        <ListItemIcon>
                            {mode === viewMode ? <CheckRoundedIcon/> : null}
                        </ListItemIcon>
                        <ListItemIcon>{icon}</ListItemIcon>
                        <ListItemText primary={label} />
                    </MenuItem>
                ))}
            </Menu>
        </React.Fragment>
    );
}
