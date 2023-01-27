import React, { useMemo, useRef, useState } from "react";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import SegmentRoundedIcon from '@mui/icons-material/SegmentRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Button from "../../../components/Button";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";

const listDisplayMode = [
    {
        label: 'Vignette',
        key: '_saquare',
        icon: <GridViewOutlinedIcon/>,
        search: 'thumbnail'
    }, 
    {
        label: 'Liste',
        key: '_list',
        icon: <SegmentRoundedIcon/>,
        search: 'list',
        disabled: true,
    }
]

export default function DisplayButton () {
    const [openMenu, setOpenMenu] = useState(false);
    const { search } = useLocation();
    const navigateTo = useNavigate();
    const anchorEl = useRef();
    const { display } = queryString.parse(search);
    const btnSelected = useMemo(() => listDisplayMode.find(
        option => option.search === (display || 'thumbnail')
        ), 
    [display]);
        
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
                {
                    listDisplayMode.map(({
                        icon, 
                        label, 
                        key, 
                        search:display,
                        disabled,
                    }) => (
                        <MenuItem 
                            key={key}
                            onClick={() => {
                                navigateTo('?'+ 
                                    queryString.stringify({
                                        ...queryString.parse(search),
                                        display,
                                    })
                                )
                                setOpenMenu(false);
                            }}
                            disabled={disabled}
                            //selected={key === btnSelected.key}
                        >
                            <ListItemIcon
                               children={
                                key === btnSelected.key && <CheckRoundedIcon/>
                                }
                            />
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText
                                primary={label}
                            />
                        </MenuItem>
                    ))
                }
            </Menu>
        </React.Fragment>
    );
}