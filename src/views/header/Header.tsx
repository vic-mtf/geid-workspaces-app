import { AppBar, Box as MuiBox, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import SearchInput from '@/components/SearchInput';
import DeconnectDialog from '@/views/header/DeconnectDialog';
import MainOption from '@/views/header/main-options/MainOption';
import appConfig from '@/configs/app-config.json';
import { setSearchQuery } from '@/redux/ui';

export default function Header () {
    const dispatch = useDispatch();

    return (
        <React.Fragment>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme: any) => theme.zIndex.drawer + 1,
                    bgcolor: appConfig.colors.main,
                }}>
                <Toolbar variant="dense">
                    <Typography flexGrow={1} fontSize={18} fontWeight="bold" variant="h6" noWrap component="div">
                        Espace personnel
                    </Typography>
                    <SearchInput
                        onChange={(event: any) => {
                            dispatch(setSearchQuery(event.target.value));
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
