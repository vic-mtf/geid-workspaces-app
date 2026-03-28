import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
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
    ListItemAvatar,
    Avatar,
    Divider,
    Box,
    InputAdornment,
    Autocomplete,
    Chip,
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import useAxios from '@/utils/useAxios';
import avatarColor from '@/utils/avatarColor';
import { RootState } from '@/types';

export default function ShareDialog() {
    const { t } = useTranslation();
    const { token, id: currentUserId } = useSelector((store: RootState) => store.user);
    const { enqueueSnackbar } = useSnackbar();

    const [file, setFile] = useState<any>(null);
    const [shareLink, setShareLink] = useState('');
    const [targetEmail, setTargetEmail] = useState('');
    const [message, setMessage] = useState('');
    const [permission, setPermission] = useState('view');
    const [users, setUsers] = useState<any[]>([]);

    const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);

    const [, generateLink] = useAxios({ method: 'POST', headers }, { manual: true });
    const [, shareWith] = useAxios({ method: 'POST', headers }, { manual: true });
    const [, revokeShare] = useAxios({ method: 'DELETE', headers }, { manual: true });
    const [, fetchUsers] = useAxios({ url: '/api/stuff/workspace/users/list', headers: { Authorization: `Bearer ${token}` } }, { manual: true });

    useEffect(() => {
        const root = document.getElementById('root');
        const handler = (event: any) => {
            const f = event.detail?.file;
            setFile(f);
            setShareLink('');
            setTargetEmail('');
            setMessage('');
            setPermission('view');
            // Charger la liste des utilisateurs
            fetchUsers().then((res: any) => {
                const list = (res.data || []).filter((u: any) => u._id !== currentUserId);
                setUsers(list);
            }).catch(() => {});
        };
        root?.addEventListener('_open_share_dialog', handler);
        return () => root?.removeEventListener('_open_share_dialog', handler);
    }, [fetchUsers, currentUserId]);

    const fileId = file?._id;
    const fileName = file?.name || '';

    const handleGenerateLink = () => {
        if (!fileId) return;
        generateLink({ url: '/api/stuff/workspace/share/link', data: { fileId } })
            .then((res: any) => {
                setShareLink(res.data?.shareLink || '');
                enqueueSnackbar(t('share.linkGenerated'), { variant: 'success' });
            })
            .catch(() => enqueueSnackbar(t('share.linkGenerateError'), { variant: 'error' }));
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink).then(() =>
            enqueueSnackbar(t('share.linkCopied'), { variant: 'info' })
        );
    };

    const handleShare = () => {
        if (!fileId || !targetEmail.trim()) return;
        shareWith({
            url: '/api/stuff/workspace/share',
            data: { fileId, targetEmail: targetEmail.trim(), permission, message: message.trim() || undefined },
        })
            .then(() => {
                enqueueSnackbar(t('share.fileShared'), { variant: 'success' });
                setTargetEmail('');
                setMessage('');
            })
            .catch(() => enqueueSnackbar(t('share.fileShareError'), { variant: 'error' }));
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
                    bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                },
            }}
            PaperProps={{ sx: { border: 1, borderColor: "divider" } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAddOutlinedIcon color="primary" />
                <Box>
                    <Typography variant="h6" fontSize={16} fontWeight="bold">
                        {t('share.shareTitle')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 350, display: 'block' }}>
                        {fileName}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* Partager avec un utilisateur */}
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
                    {t('share.shareWithUser')}
                </Typography>

                <Autocomplete
                    freeSolo
                    options={users}
                    getOptionLabel={(opt: any) => typeof opt === 'string' ? opt : `${opt.fname || ''} ${opt.lname || ''} (${opt.email})`}
                    inputValue={targetEmail}
                    onInputChange={(_, val) => setTargetEmail(val)}
                    onChange={(_, val) => {
                        if (val && typeof val !== 'string') setTargetEmail(val.email || '');
                    }}
                    renderOption={(props, option: any) => (
                        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: avatarColor(option._id || '') }}>
                                {(option.fname?.[0] || '').toUpperCase()}{(option.lname?.[0] || '').toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="body2">{option.fname} {option.lname}</Typography>
                                <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                            </Box>
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            placeholder={t('share.userIdPlaceholder')}
                            sx={{ mb: 1 }}
                        />
                    )}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 1 }}>
                    <Select
                        size="small"
                        value={permission}
                        onChange={(e) => setPermission(e.target.value)}
                        sx={{ minWidth: 160 }}
                    >
                        <MenuItem value="view">{t('share.permissionRead')}</MenuItem>
                        <MenuItem value="edit">{t('share.permissionWrite')}</MenuItem>
                    </Select>
                </Stack>

                <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={3}
                    placeholder={t('share.messagePlaceholder') || 'Ajouter un message (optionnel)'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Button
                    variant="contained"
                    size="small"
                    startIcon={<SendRoundedIcon />}
                    onClick={handleShare}
                    disabled={!targetEmail.trim()}
                    sx={{ textTransform: 'none', mb: 2 }}
                >
                    {t('share.sendInvitation') || 'Envoyer l\'invitation'}
                </Button>

                <Divider sx={{ my: 1 }} />

                {/* Lien de partage */}
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LinkOutlinedIcon sx={{ fontSize: 16 }} />
                    {t('share.shareLink')}
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
                                    <IconButton size="small" onClick={handleCopyLink}>
                                        <ContentCopyOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                ) : (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<LinkOutlinedIcon />}
                        onClick={handleGenerateLink}
                        sx={{ textTransform: 'none' }}
                    >
                        {t('share.generateLink')}
                    </Button>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit">{t('common.close') || 'Fermer'}</Button>
            </DialogActions>
        </Dialog>
    );
}
