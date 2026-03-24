import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    IconButton,
    Stack,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Box,
    InputAdornment,
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import useAxios from '@/utils/useAxios';
import { RootState } from '@/types';

export default function ShareDialog() {
    const { token } = useSelector((store: RootState) => store.user);
    const { enqueueSnackbar } = useSnackbar();

    const [file, setFile] = useState<any>(null);
    const [shareLink, setShareLink] = useState('');
    const [targetUserId, setTargetUserId] = useState('');
    const [permission, setPermission] = useState('read');
    const [shares, setShares] = useState<any[]>([]);

    const headers = { Authorization: `Bearer ${token}` };

    const [, generateLink] = useAxios(
        { method: 'POST', headers },
        { manual: true }
    );
    const [, shareWith] = useAxios(
        { method: 'POST', headers },
        { manual: true }
    );
    const [, revokeShare] = useAxios(
        { method: 'DELETE', headers },
        { manual: true }
    );

    useEffect(() => {
        const root = document.getElementById('root');
        const handler = (event: any) => {
            const f = event.detail?.file;
            setFile(f);
            setShareLink('');
            setTargetUserId('');
            setPermission('read');
            setShares([]);
        };
        root?.addEventListener('_open_share_dialog', handler);
        return () => {
            root?.removeEventListener('_open_share_dialog', handler);
        };
    }, []);

    const fileId = file?.doc?._id || file?._id;

    const handleGenerateLink = () => {
        if (!fileId) return;
        generateLink({
            url: '/api/stuff/workspace/share/link',
            data: { fileId },
        })
            .then((res: any) => {
                const link = res.data?.link || res.data?.url || '';
                setShareLink(link);
                enqueueSnackbar('Lien de partage genere', {
                    variant: 'success',
                });
            })
            .catch(() => {
                enqueueSnackbar('Impossible de generer le lien', {
                    variant: 'error',
                });
            });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            enqueueSnackbar('Lien copie dans le presse-papier', {
                variant: 'info',
            });
        });
    };

    const handleShare = () => {
        if (!fileId || !targetUserId.trim()) return;
        shareWith({
            url: '/api/stuff/workspace/share',
            data: { fileId, targetUserId: targetUserId.trim(), permission },
        })
            .then(() => {
                enqueueSnackbar('Fichier partage', { variant: 'success' });
                setShares((prev) => [
                    ...prev,
                    { userId: targetUserId.trim(), permission },
                ]);
                setTargetUserId('');
            })
            .catch(() => {
                enqueueSnackbar('Impossible de partager le fichier', {
                    variant: 'error',
                });
            });
    };

    const handleRevoke = (userId: string) => {
        revokeShare({
            url: `/api/stuff/workspace/share/${fileId}/${userId}`,
        })
            .then(() => {
                enqueueSnackbar('Partage revoque', { variant: 'success' });
                setShares((prev) =>
                    prev.filter((s) => s.userId !== userId)
                );
            })
            .catch(() => {
                enqueueSnackbar('Impossible de revoquer le partage', {
                    variant: 'error',
                });
            });
    };

    const handleClose = () => setFile(null);

    return (
        <Dialog
            open={!!file}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            BackdropProps={{
                sx: {
                    bgcolor: (theme: any) =>
                        theme.palette.background.paper +
                        theme.customOptions.opacity,
                    backdropFilter: (theme: any) =>
                        `blur(${theme.customOptions.blur})`,
                },
            }}
        >
            <DialogTitle>
                Partager{' '}
                <Typography
                    component="span"
                    fontWeight="bold"
                >
                    {file?.name || ''}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {/* Section 1: Lien de partage */}
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                    Lien de partage
                </Typography>
                {shareLink ? (
                    <TextField
                        fullWidth
                        size="small"
                        value={shareLink}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={handleCopyLink}
                                    >
                                        <ContentCopyOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />
                ) : (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleGenerateLink}
                        sx={{ mb: 2, textTransform: 'none' }}
                    >
                        Generer un lien
                    </Button>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Section 2: Partager avec un utilisateur */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Partager avec un utilisateur
                </Typography>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ sm: 'center' }}
                    sx={{ mb: 2 }}
                >
                    <TextField
                        size="small"
                        placeholder="Identifiant utilisateur"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        sx={{ flex: 1 }}
                    />
                    <Select
                        size="small"
                        value={permission}
                        onChange={(e) => setPermission(e.target.value)}
                        sx={{ minWidth: 130 }}
                    >
                        <MenuItem value="read">Lecture</MenuItem>
                        <MenuItem value="write">Modification</MenuItem>
                    </Select>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleShare}
                        sx={{ textTransform: 'none' }}
                    >
                        Partager
                    </Button>
                </Stack>

                {/* Current shares */}
                {shares.length > 0 && (
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Partages en cours
                        </Typography>
                        <List dense>
                            {shares.map((share, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={share.userId}
                                        secondary={
                                            share.permission === 'read'
                                                ? 'Lecture'
                                                : 'Modification'
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleRevoke(share.userId)
                                            }
                                        >
                                            <DeleteOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Fermer</Button>
            </DialogActions>
        </Dialog>
    );
}
