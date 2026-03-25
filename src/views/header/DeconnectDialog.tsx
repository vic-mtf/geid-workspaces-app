import { Box as MuiBox, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { removeUser } from '@/redux/app';
import { removeData } from '@/redux/data';
import { deconnected } from '@/redux/user';

export default function DeconnectDialog () {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const [checked, setChecked] = useState(false);

    const handleDeconnecte = () => {
        dispatch(deconnected());
        sessionStorage.clear();
        dispatch(removeData());
       if(checked) {
        localStorage.clear()
        dispatch(removeUser());
       }
       setOpen(false);
       (window as any).location = '/';
    };

    useEffect(() => {
        const handleOpen = () => setOpen(true);
        document.getElementById('root')
        ?.addEventListener(
            '_deconnected',
            handleOpen
        );

       return () => {
            document.getElementById('root')
            ?.removeEventListener(
                '_deconnected',
                handleOpen
            );
       }
    }, []);

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            PaperProps={{
                sx:{
                    border: (theme: any) => `1px solid ${theme.palette.divider}`
                }
            }}
            BackdropProps={{
                sx: {
                    bgcolor: (theme: any) => theme.palette.background.paper +
                    theme.customOptions.opacity,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                }
            }}
        >
        <DialogTitle id="alert-dialog-deconnexion">
            {t('profile.disconnectTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            component="div"
          >
            <Typography>
                {t('profile.disconnectBody')}
            </Typography>
            <MuiBox mt={1}>
            <FormControl sx={{display: 'inline-block'}}>
                <FormControlLabel
                    value="left"
                    control={<Checkbox onChange={(_event, value) => setChecked(value)} size="small" />}
                    label={
                        <Typography
                            variant="body2"
                            component="div"
                            color="text.primary"
                        >{t('profile.deleteAllData')}</Typography>
                    }
                    labelPlacement="end"
                />
            </FormControl>
            </MuiBox>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant='outlined'
            onClick={handleDeconnecte} autoFocus>
            {t('profile.disconnectButton')}
          </Button>
        </DialogActions>
        </Dialog>
    )
}
