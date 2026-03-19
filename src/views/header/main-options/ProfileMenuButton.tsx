import { ThemeProvider } from "@emotion/react";
import { Avatar, Chip, Tooltip, createTheme, useMediaQuery, useTheme } from "@mui/material";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import ProfileMenu from "@/views/header/ProfileMenu";
import getFullName from "@/utils/getFullName";
import { RootState } from "@/types";

export default function ProfileMenuButton () {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const user = useSelector((store: RootState) => store.user);
    const theme = useTheme();
    const fullName = getFullName(user);
    const shotName = `${user.lastname?.charAt(0)}${user.firstname?.charAt(0)}`;
    const matches = useMediaQuery(theme.breakpoints.only('xs'));

    return (
        <React.Fragment>
            <ThemeProvider theme={createTheme({palette: {mode: 'dark'}})}>
                    <Tooltip title="Profil" arrow>
                        <Chip
                            label={matches ? shotName :fullName}
                            ref={anchorRef}
                            onClick={() => {
                                setAnchorEl(anchorEl ? null : anchorRef.current);
                            }}
                            sx={{ml: 1, borderRadius: 1}}
                            avatar={
                                <Avatar
                                    alt={fullName}
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
