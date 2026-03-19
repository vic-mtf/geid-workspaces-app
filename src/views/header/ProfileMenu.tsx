import {
    Avatar,
    Badge,
    Box as MuiBox,
    CardContent,
    Divider,
    IconButton,
    Menu,
    Stack
} from '@mui/material';
import Box from '../../components/Box';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import Typography from '../../components/Typography';
import { useSelector } from 'react-redux';
import Button from '../../components/Button';
import { RootState } from '../../types';

interface ProfileMenuProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

export default function ProfileMenu ({anchorEl, onClose}: ProfileMenuProps) {
    const user = useSelector((store: RootState) => store.user);
    const fullname = `${user.lastname} ${user.middlename} ${user.firstname}`;

    return (
        <Menu
            id="_apps"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={onClose}
            PaperProps={{
                sx: {
                    bgcolor: (theme: any) => theme.palette.background.paper +
                    theme.customOptions.opacity,
                    border: (theme: any) => `1px solid ${theme.palette.divider}`,
                    min: 350,
                    width: 360,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`
                }
            }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
          <CardContent
            sx={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column'
            }}
          >
            <Stack
                divider={<Divider/>}
                spacing={1}
                display="flex"
                flex={1}
            >
                <Box justifyContent="center" alignItems="center">
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        sx={{my:3}}
                        badgeContent={
                            <IconButton
                                size="small"
                                onClick={async() => {
                                    const file = await new Promise<File>((resolve, reject) => {
                                        const inputFile = document.createElement('input')
                                        inputFile.setAttribute('type', 'file');
                                        inputFile.setAttribute('accept', 'image/*');
                                        inputFile.addEventListener('change', (event: any) => {
                                            const [file] = event.target.files;
                                            if(file)
                                                resolve (file);
                                            else reject('Error file');
                                        })
                                        inputFile.click();
                                    });
                                    if(file) {const _eventName = '_edite_profile_image';
                                        const customEvent = new CustomEvent(_eventName, {
                                            detail: {file, name: _eventName}
                                        });
                                        document.getElementById('root')?.dispatchEvent(customEvent);
                                    }
                                    onClose();
                                }}
                                sx={{
                                    bgcolor: (theme: any) => theme.palette.background.paper + 'aa',
                                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                                }}
                            >
                                <AddAPhotoRoundedIcon fontSize="small"/>
                            </IconButton>
                        }
                    >
                        <Avatar
                            sx={{width: 100, height: 100, fontSize: 50,}}
                            alt={fullname}
                            src={user.image}
                        />
                    </Badge>
                    <Typography fontWeight="bold" variant='body1'>{fullname}</Typography>
                    <Typography paragraph>{user.email}</Typography>
                </Box>
                <Box>
                    <MuiBox
                        alignItems="center"
                        display="flex"
                        width="100%"
                        justifyContent="center"
                        my={1}
                    >
                        <Button
                            variant="outlined"
                            color="inherit"
                            fullWidth={false}
                            size="medium"
                            onClick={() => {
                                const customEvent = new CustomEvent(
                                    '_deconnected',
                                    { detail: { name: '_deconnected' }}
                                );
                                document.getElementById('root')
                                ?.dispatchEvent(customEvent);
                            }}
                        >Se déconnecter</Button>
                    </MuiBox>
                </Box>
                <Box> </Box>
            </Stack>
            <Stack display="flex" direction="row" spacing={1}>
                    <Button
                        color="inherit"
                    >Politique de confidentialité</Button>
                    <Button
                        color="inherit"
                    >Conditions d'utilisation</Button>
            </Stack>
          </CardContent>
        </Menu>
    )
}
