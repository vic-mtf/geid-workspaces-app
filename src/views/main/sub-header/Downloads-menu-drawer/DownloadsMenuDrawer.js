import { Toolbar, Drawer, Box as MuiBox, Stack } from '@mui/material';
import IconButton from '../../../../components/IconButton';
import Typography from '../../../../components/Typography';
import DownloadItem from './DownloadItem';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function DownloadsMenuDrawer ({open, onClose, loadingList}) {
    return (
        <Drawer
          variant="persistent"
          anchor="right"
          open={open}
          PaperProps={{
            sx: {
                width: {
                    xs: '100vw',
                    md: 250,
                    lg: 400,
                },
                bgcolor: theme => theme.palette.background.paper + 
                theme.customOptions.opacity,
                border: theme => `1px solid ${theme.palette.divider}`,
                backdropFilter: theme => `blur(${theme.customOptions.blur})`,
                px:1,
                overflow: 'hidden',
                display: "flex"
            }
          }}
        >
        <Toolbar variant="dense" />
        <Toolbar  disableGutters>
            <MuiBox>
                <IconButton title="fermer" onClick={onClose}>
                    <CloseRoundedIcon fontSize="small"/>
                </IconButton>
            </MuiBox>
            <Typography
                variant="h6"
                fontSize={15}
                fontWeight="bold"
                ml={1}
            >
                Téléchargements
            </Typography>
        </Toolbar>
            <Stack 
                spacing={2}
                display="flex"
                flex={1}
                mb={1}
                overflow="auto"
            >
                {loadingList?.reverse()?.map((item, index) => (
                    <DownloadItem
                        key={item?._id}
                        {...item}
                    />
                ))}
                {loadingList?.length === 0 &&
                <Typography 
                    align="center" 
                    color="text.secondary" 
                    display="flex" 
                    flex={1} 
                    justifyContent="center"
                    alignItems="center"
                >Aucun élement téléchargé</Typography>}
            </Stack>
        </Drawer>
    )
}