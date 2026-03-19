import React from "react";
import MoreOptionsButton from "@/views/header/main-options/MoreOptionsButton";
import options from "@/views/header/main-options/options";
import IconButton from "@/components/IconButton";
import { createTheme, ThemeProvider, Tooltip, Box as MuiBox } from "@mui/material";

export default function MainOption () {

    return (
        <React.Fragment>
            {
                options.filter(({pin}) => pin)
                .map(({element, key, label, action, icon, disabled}) => (
                    <React.Fragment key={key}>
                        {element ||
                        <ThemeProvider theme={createTheme({palette: { mode: 'dark'}})}>
                            <Tooltip title={label} arrow>
                                <MuiBox>
                                    <IconButton
                                        onClick={action}
                                        disabled={disabled}
                                        value=""
                                    >{icon}
                                    </IconButton>
                                </MuiBox>
                            </Tooltip>
                        </ThemeProvider>}
                    </React.Fragment>
                ))
            }
            <MoreOptionsButton
                options={options.filter(option => !option.pin)}
            />
        </React.Fragment>
    )
}
