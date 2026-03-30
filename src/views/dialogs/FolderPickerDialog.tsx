import { useCallback, useEffect, useMemo, useState } from 'react';
import scrollBarSx from "@/utils/scrollBarSx";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    CircularProgress,
    Box,
    IconButton,
    Divider,
} from '@mui/material';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import useAxios from '@/utils/useAxios';
import { RootState } from '@/types';

interface FolderPickerDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (path: string) => void;
    excludeName?: string;
}

export default function FolderPickerDialog({
    open,
    onClose,
    onConfirm,
    excludeName,
}: FolderPickerDialogProps) {
    const { t } = useTranslation();
    const { token, id: userId } = useSelector((store: RootState) => store.user);
    const [currentPath, setCurrentPath] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

    const [{ data, loading }, fetchFolders] = useAxios(
        { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
        { manual: true }
    );

    const loadFolders = useCallback((path: string) => {
        const query = JSON.stringify({ userId, path });
        fetchFolders({ url: `/api/stuff/workspace/${encodeURIComponent(query)}` });
    }, [fetchFolders, userId]);

    useEffect(() => {
        if (open) {
            setCurrentPath('');
            setSelectedFolder(null);
            loadFolders('');
        }
    }, [open, loadFolders]);

    const folders = useMemo(() => {
        if (!data) return [];
        const items = Array.isArray(data) ? data : data?.data || [];
        return items.filter((item: any) => item.isDirectory);
    }, [data]);

    const pathParts = useMemo(() => currentPath ? currentPath.split('/').filter(Boolean) : [], [currentPath]);

    const handleEnterFolder = (folderName: string) => {
        const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        setCurrentPath(newPath);
        setSelectedFolder(null);
        loadFolders(newPath);
    };

    const handleGoBack = () => {
        if (pathParts.length <= 1) {
            setCurrentPath('');
            loadFolders('');
        } else {
            const newPath = pathParts.slice(0, -1).join('/');
            setCurrentPath(newPath);
            loadFolders(newPath);
        }
        setSelectedFolder(null);
    };

    const handleGoRoot = () => {
        setCurrentPath('');
        setSelectedFolder(null);
        loadFolders('');
    };

    const handleConfirm = () => {
        const finalPath = selectedFolder
            ? (currentPath ? `${currentPath}/${selectedFolder}` : selectedFolder)
            : currentPath;
        onConfirm(finalPath);
    };

    const currentFolderName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : t('nav.files') || 'Mes fichiers';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            BackdropProps={{
                sx: {
                    bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                },
            }}
            PaperProps={{ sx: { border: 1, borderColor: "divider", height: 420 } }}
        >
            <DialogTitle sx={{ pb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FolderRoundedIcon color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="h6" fontSize={16} fontWeight="bold" flex={1}>
                    {t('move.chooseFolder')}
                </Typography>
            </DialogTitle>

            {/* Barre de navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, gap: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                {pathParts.length > 0 && (
                    <IconButton size="small" onClick={handleGoBack} sx={{ mr: 0.5 }}>
                        <ArrowBackOutlinedIcon fontSize="small" />
                    </IconButton>
                )}
                <IconButton size="small" onClick={handleGoRoot} disabled={pathParts.length === 0}>
                    <HomeOutlinedIcon fontSize="small" />
                </IconButton>
                {pathParts.length > 0 && <NavigateNextIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
                {pathParts.map((part, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                            variant="body2"
                            sx={{
                                cursor: i < pathParts.length - 1 ? 'pointer' : 'default',
                                fontWeight: i === pathParts.length - 1 ? 600 : 400,
                                color: i === pathParts.length - 1 ? 'text.primary' : 'text.secondary',
                                '&:hover': i < pathParts.length - 1 ? { textDecoration: 'underline' } : {},
                                fontSize: 13,
                            }}
                            onClick={() => {
                                if (i < pathParts.length - 1) {
                                    const newPath = pathParts.slice(0, i + 1).join('/');
                                    setCurrentPath(newPath);
                                    setSelectedFolder(null);
                                    loadFolders(newPath);
                                }
                            }}
                        >
                            {part}
                        </Typography>
                        {i < pathParts.length - 1 && <NavigateNextIcon sx={{ fontSize: 16, color: 'text.disabled', mx: 0.25 }} />}
                    </Box>
                ))}
            </Box>

            <DialogContent sx={{ p: 0, flex: 1, overflow: 'auto', ...scrollBarSx }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                        <CircularProgress size={28} />
                    </Box>
                ) : folders.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        {t('move.noSubFolder')}
                    </Typography>
                ) : (
                    <List dense disablePadding>
                        {folders.map((folder: any, i: number) => {
                            const isSelf = excludeName && folder.name === excludeName;
                            const isSelected = selectedFolder === folder.name;
                            return (
                                <ListItemButton
                                    key={i}
                                    disabled={!!isSelf}
                                    selected={isSelected}
                                    onClick={() => !isSelf && setSelectedFolder(isSelected ? null : folder.name)}
                                    sx={{
                                        px: 2, py: 0.75,
                                        ...(isSelf && { opacity: 0.3 }),
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <FolderRoundedIcon sx={{ color: folder.color || 'warning.main', fontSize: 22 }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={folder.name}
                                        secondary={folder.count != null ? `${folder.count} element${folder.count > 1 ? 's' : ''}` : undefined}
                                        primaryTypographyProps={{ noWrap: true, variant: 'body2', fontWeight: isSelected ? 600 : 400 }}
                                        secondaryTypographyProps={{ fontSize: 11 }}
                                    />
                                    {!isSelf && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); handleEnterFolder(folder.name); }}
                                            sx={{ ml: 0.5 }}
                                        >
                                            <NavigateNextIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    {isSelected && <CheckOutlinedIcon color="primary" sx={{ fontSize: 18, ml: 0.5 }} />}
                                </ListItemButton>
                            );
                        })}
                    </List>
                )}
            </DialogContent>

            <Divider />
            <DialogActions sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }} noWrap>
                    {selectedFolder
                        ? `${currentPath ? currentPath + '/' : ''}${selectedFolder}`
                        : currentPath || t('nav.files') || 'Mes fichiers'}
                </Typography>
                <Button onClick={onClose} color="inherit" size="small">{t('common.cancel')}</Button>
                <Button onClick={handleConfirm} variant="contained" size="small" sx={{ textTransform: 'none' }}>
                    {t('common.confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
