import React from "react";
import MoreOptionsButton from "./MoreOptionsButton";
import options from "./options";
import IconButton from "../../../components/IconButton";
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
                                        color="inherit" 
                                        disabled={disabled}
                                    >
                                        {icon}
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
