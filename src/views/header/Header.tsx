import { AppBar, Box as MuiBox, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import React from 'react';
import SearchInput from '@/components/SearchInput';
import DeconnectDialog from '@/views/header/DeconnectDialog';
import MainOption from '@/views/header/main-options/MainOption';
import appConfig from '@/configs/app-config.json';

export default function Header () {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <React.Fragment>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (t: any) => t.zIndex.drawer + 1,
                    bgcolor: appConfig.colors.main,
                }}>
                <Toolbar variant="dense">
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            sx={{ mr: 1 }}
                            onClick={() => {
                                document.getElementById("root")?.dispatchEvent(
                                    new CustomEvent("_toggle_nav_drawer")
                                );
                            }}
                        >
                            <MenuRoundedIcon />
                        </IconButton>
                    )}
                    <Typography flexGrow={1} fontSize={18} fontWeight="bold" variant="h6" noWrap component="div">
                        Espace personnel
                    </Typography>
                    <SearchInput
                        onChange={(event: any) => {
                            const customEvent = new CustomEvent('_search_data', {
                                detail: {
                                    value: event.target.value,
                                    name: '_search_data',
                                }
                            });
                            document.getElementById('root')?.dispatchEvent(customEvent);
                        }}
                    />
                    <MuiBox component="div" display="flex" justifyContent="right" sx={{ flexGrow: 1}}>
                        <MainOption/>
                    </MuiBox>
                </Toolbar>
            </AppBar>
            <DeconnectDialog/>
        </React.Fragment>
    )
}
