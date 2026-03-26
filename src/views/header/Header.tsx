import { AppBar, Box as MuiBox, CardMedia, Divider, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SearchInput from '@/components/SearchInput';
import DeconnectDialog from '@/views/header/DeconnectDialog';
import MainOption from '@/views/header/main-options/MainOption';
import appConfig from '@/configs/app-config.json';
import geidLogo from '@/assets/geid_logo_white.png';

export default function Header () {
    const { t } = useTranslation();
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
                    <MuiBox display="flex" alignItems="center" gap={{ xs: 0.75, sm: 1 }} flexGrow={1}>
                        <CardMedia
                            component="img"
                            src={geidLogo}
                            draggable={false}
                            sx={{ height: { xs: 24, sm: 28 }, width: "auto" }}
                        />
                        <Divider orientation="vertical" flexItem sx={{ borderColor: "#fff", borderRightWidth: 2, my: 0.5 }} />
                        <Typography
                            noWrap
                            component="div"
                            sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: 700 }}
                        >
                            {t('header.personalSpace')}
                        </Typography>
                    </MuiBox>
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
