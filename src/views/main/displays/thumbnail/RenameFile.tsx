import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useRef } from 'react';
import InputController from '@/components/InputController';
import useAxios from '@/utils/useAxios';
import { getName } from '@/utils/getFileExtension';
import getFileExtension from '@/utils/getFileExtension';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Stack } from '@mui/system';
import { RootState } from '@/types';
import { closeRenameDialog, triggerReload } from '@/redux/ui';

export default function RenameFile () {
    const dispatch = useDispatch();
    const { open, file } = useSelector((store: RootState) => store.ui.renameDialog);
    const { token, id: userId } = useSelector((store: RootState) => store.user);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [, refresh] = useAxios({
        method: 'put',
        url: '/api/stuff/workspace',
    }, {manual: true});
    const inputRef = useRef<HTMLInputElement>(null);
    const valueRef = useRef<string | null>(null);

    const handleRename = () => {
        enqueueSnackbar(
            <Stack direction="row">
             <CircularProgress color="inherit" size={20}/>
             <Typography ml={1}>Attribution d'un nouveau nom</Typography>
            </Stack>,
            {
                autoHideDuration: null,
            }
        );
        refresh({
            data: {
              oldFilename: file?.name,
              filename: valueRef.current + '.' + getFileExtension(file?.name ?? ''),
              path: file?._currentPath || (file?.type + 's'),
              userId,
          },
        }).then(() => {
            closeSnackbar();
            enqueueSnackbar(
                <Typography>Le fichier a été renommé</Typography>,
                { variant: 'success'}
            );
            dispatch(triggerReload());
        }).catch(() => {
            closeSnackbar();
            enqueueSnackbar(
                <Typography>
                    Impossible de changer le nom du fichier
                </Typography>,
                 { variant: 'error'}
            );
        });
        dispatch(closeRenameDialog());
    };

    return (
        <Dialog
            open={open}
            onAnimationEnd={() => {
                if(file) {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }
            }}
            BackdropProps={{
                sx: {
                    bgcolor: (theme: any) => theme.palette.background.paper +
                    theme.customOptions.opacity,
                    border: (theme: any) => `1px solid ${theme.palette.divider}`,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                }
            }}
        >
          <DialogTitle >
            <Typography
                variant="h6"
                fontSize={18}
            >Renommer</Typography>
          </DialogTitle>
          <DialogContent
            sx={{
                height: 100,
                width: 400,
                justifyContent: 'center',
                display: 'flex'
            }}
          >
            <InputController
                defaultValue={file?.name && getName(file?.name)?.replace(/_/ig, ' ')}
                inputRef={inputRef}
                autoFocus
                externalError
                regExp={/.+/}
                fullWidth
                trim={false}
                margin="dense"
                valueRef={valueRef}
            >
                <TextField
                    inputProps={{
                        id: 'rename-input',
                        style: {
                            fontSize: 15,
                        }
                    }}
                />
            </InputController>
          </DialogContent>
          <DialogActions>
            <Button
                onClick={() => dispatch(closeRenameDialog())}
            >
              Annuler
            </Button>
            <Button
                onClick={handleRename}
                variant="outlined"
                size="small"
                sx={{textTransform: 'none'}}
            >
              Renommer
            </Button>
          </DialogActions>
        </Dialog>
    );
}
