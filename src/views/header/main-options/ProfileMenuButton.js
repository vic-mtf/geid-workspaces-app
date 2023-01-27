import { ThemeProvider } from "@emotion/react";
import { Avatar, Chip, createTheme, Tooltip } from "@mui/material";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import ProfileMenu from "../ProfileMenu";

export default function ProfileMenuButton () {
    const [anchorEl, setAnchorEl] = useState(null);
    const anchorRef = useRef();
    const user = useSelector(store => store.user);
    const fullname = `${user.lastname} ${user.firstname}`;

    return (
        <React.Fragment>
            <ThemeProvider theme={createTheme({palette: {mode: 'dark'}})}>
                    <Tooltip title="Profil" arrow>
                        <Chip
                            label={fullname}
                            ref={anchorRef}
                            onClick={() => {
                                setAnchorEl(anchorEl ? null : anchorRef.current);
                            }}
                            color="default"
                            sx={{ml: 1}}
                            avatar={
                                <Avatar
                                    alt={fullname}
                                    src={user.image}
                                />
                            }
                        />
                    </Tooltip>
                </ThemeProvider>
            <ProfileMenu
                onClose={() => setAnchorEl(null)}
                anchorEl={anchorEl}
            />
        </React.Fragment> 
    )
}