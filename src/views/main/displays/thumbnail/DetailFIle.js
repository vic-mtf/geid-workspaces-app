import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    CardMedia, 
} from '@mui/material';
import { useEffect, useState } from 'react';
import Button from '../../../../components/Button';
//import useAxios from '../../../../utils/useAxios';
import Typography from '../../../../components/Typography';
//import { useSelector } from 'react-redux';
import optionLocalDate from '../../../../utils/optionLocalDate';
import capStr from '../../../../utils/capStr';

export default function DetailFIle () {
    const [file, setFile] = useState(null);

    useEffect(() => {
        const handleRenameFile = event => {
            setFile(event.detail.file)};
        document.getElementById('root')
        .addEventListener('_open_detail_file', handleRenameFile);
        return () => {
            document.getElementById('root')
        .removeEventListener('_open_detail_file', handleRenameFile);
        }
    }, [setFile]);

    return (
        <Dialog
            open={!!file}
            BackdropProps={{
                sx: {
                    bgcolor: theme => theme.palette.background.paper + 
                    theme.customOptions.opacity,
                    border: theme => `1px solid ${theme.palette.divider}`,
                    backdropFilter: theme => `blur(${theme.customOptions.blur})`,
                }
            }}
        >
          <DialogTitle>
            <Typography
                variant="h6"
                fontSize={18}
            >Detail</Typography>
          </DialogTitle>
          <DialogContent
            sx={{
                width: 400,
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column'
            }}
          >
            <Stack 
                spacing={1} 
                direction="row"
                display="flex"
                alignContent="center"
                alignItems="center"
            >
                <CardMedia
                    component="img"
                    src={file?.icon}
                    sx={{height: 50, width: 50}}
                />
                <Typography flexGrow={1}>
                    {file?.name?.replace(/_/ig,' ')}
                </Typography>
            </Stack>
            <Typography align="center" fontWeight="bold" color="text.secondary" >
                {capStr(
                    new Date(file?.createdAt)
                    .toLocaleDateString(undefined, optionLocalDate)
                )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFile(null)}>Fermer</Button>
          </DialogActions>
        </Dialog>
    )
}
