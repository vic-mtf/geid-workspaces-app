import React from 'react';
import { 
    Dialog, 
    DialogContent,
    CircularProgress, 
} from '@mui/material';
import useAxios from '../../../utils/useAxios';
import { useSelector } from 'react-redux';
import Typography from '../../../components/Typography';
import Content from './Content';
import Header from './Header';

export default function DocumentCoversPages ({open, onClose, onCover}) {
    const { token } = useSelector(store => store.user);
    const [{ data, loading}, refresh ] = useAxios({
            url: '/api/stuff/cover',
            headers: {'Authorization': `Bearer ${token}`},
        });
    
    return (
        <Dialog open={Boolean(open)} fullScreen >
            <Header 
                onClose={onClose}
                refresh={refresh}
            />
                <DialogContent
                    component="div"
                    sx={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        px: 0,
                        mx: 0,
                    }}
                >
                {Boolean(data?.length) && 
                <Content 
                    data={data} 
                    onChooseCoverPage={onCover}
                />}
                {!data?.length &&
                <Typography 
                    align="center" 
                    color="text.secondary"
                    width="100%"
                    height="100%"
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
                    component="div"
                >
                    {loading ? 
                        <CircularProgress
                            size={20}
                            color="inherit"
                        /> :
                    'Aucune couverture disponible'
                }
                    
                </Typography>}
            </DialogContent>
        </Dialog>
    )
}

