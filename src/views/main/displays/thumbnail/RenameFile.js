import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, 
    TextField, 
    CircularProgress,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Button from '../../../../components/Button';
import InputController from '../../../../components/InputController';
import useAxios from '../../../../utils/useAxios';
import Typography from '../../../../components/Typography';
import getFileExtension, { getName } from '../../../../utils/getFileExtension';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Stack } from '@mui/system';

export default function RenameFile () {
    const [file, setFile] = useState(null);
    const { token, id: userId } = useSelector(store => store.user);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const [ refresh] = useAxios({
        method: 'put',
        url: '/api/stuff/workspace',
        headers: {
            'Authorization': `Bearer ${token}`
          },
    }, {manual: true});
    const inputRef = useRef();
    const valueRef = useRef();

    const handleDeleteFile = () => {
        enqueueSnackbar(
            <Stack direction="row">
             <CircularProgress color="inherit" size={20}/>
             <Typography ml={1}>Attribution d'un nouveau nom</Typography>
            </Stack>,
            {
                autoHideDuration: null,
            }
        )
        refresh({
            data: {
              oldFilename: file?.name,
              filename: valueRef.current + '.' + getFileExtension(file.name),
              path: file?.type + 's',
              userId,
          },
        }).then(() => {
            closeSnackbar()
            enqueueSnackbar(
                <Typography>Le fichier a été renommé </Typography>,
                { variant: 'success'}
            )
        }).catch(() => {
            closeSnackbar()
            enqueueSnackbar(
                <Typography>
                    Impossible de changer le nom du fichier
                </Typography>,
                 { variant: 'error'}
            )
        });
        setFile(null);
    }
 
    useEffect(() => {
        const handleRenameFile = event => {
            setFile(event.detail.file)};
        document.getElementById('root')
        .addEventListener('_open_rename_file_name', handleRenameFile);
        return () => {
            document.getElementById('root')
        .removeEventListener('_open_rename_file_name', handleRenameFile);
        }
    }, [setFile]);

    return (
        <Dialog
            open={!!file}
            onAnimationEnd={() => {
                if(file) {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }
            }}
            BackdropProps={{
                sx: {
                    bgcolor: theme => theme.palette.background.paper + 
                    theme.customOptions.opacity,
                    border: theme => `1px solid ${theme.palette.divider}`,
                    backdropFilter: theme => `blur(${theme.customOptions.blur})`,
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
                defaultValue={file?.name && getName(file?.name).replace(/_/ig, ' ')}
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
                        style: {
                            fontSize: 15,
                            id: 'rename-input'
                        }
                    }}
                />
            </InputController>
          </DialogContent>
          <DialogActions>
            <Button 
                onClick={() => setFile(null)}
            >
              Annuler
            </Button>
            <Button 
                onClick={handleDeleteFile}
                variant="outlined"
                size="small"
                sx={{textTransform: 'none'}}
            >
              Renommer
            </Button>
          </DialogActions>
        </Dialog>
    )
}