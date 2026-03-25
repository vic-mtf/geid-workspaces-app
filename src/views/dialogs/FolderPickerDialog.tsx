import { useCallback, useEffect, useMemo, useState } from 'react';
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
    Breadcrumbs,
    Link,
    Typography,
    CircularProgress,
    Box,
} from '@mui/material';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import useAxios from '@/utils/useAxios';
import { RootState } from '@/types';

interface FolderPickerDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (path: string) => void;
}

export default function FolderPickerDialog({
    open,
    onClose,
    onConfirm,
}: FolderPickerDialogProps) {
    const { t } = useTranslation();
    const { token, id: userId } = useSelector(
        (store: RootState) => store.user
    );
    const [currentPath, setCurrentPath] = useState('documents');
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

    const [{ data, loading }, fetchFolders] = useAxios(
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
        },
        { manual: true }
    );

    const loadFolders = useCallback(
        (path: string) => {
            const query = JSON.stringify({ userId, path });
            fetchFolders({ url: `/api/stuff/workspace/${query}` });
        },
        [fetchFolders, userId]
    );

    useEffect(() => {
        if (open) {
            setCurrentPath('documents');
            setSelectedFolder(null);
            loadFolders('documents');
        }
    }, [open, loadFolders]);

    const folders = useMemo(() => {
        if (!data) return [];
        const items = Array.isArray(data) ? data : data?.data || [];
        return items.filter((item: any) => item.isDirectory);
    }, [data]);

    const pathSegments = useMemo(() => currentPath.split('/'), [currentPath]);

    const handleNavigate = (folder: any) => {
        const newPath = `${currentPath}/${folder.name}`;
        setCurrentPath(newPath);
        setSelectedFolder(null);
        loadFolders(newPath);
    };

    const handleBreadcrumb = (index: number) => {
        const newPath = pathSegments.slice(0, index + 1).join('/');
        setCurrentPath(newPath);
        setSelectedFolder(null);
        loadFolders(newPath);
    };

    const handleConfirm = () => {
        const finalPath = selectedFolder
            ? `${currentPath}/${selectedFolder}`
            : currentPath;
        onConfirm(finalPath);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
            <DialogTitle>{t('move.chooseFolder')}</DialogTitle>
            <DialogContent>
                <Breadcrumbs sx={{ mb: 2 }}>
                    {pathSegments.map((segment, index) => {
                        const isLast = index === pathSegments.length - 1;
                        return isLast ? (
                            <Typography
                                key={index}
                                color="text.primary"
                                variant="body2"
                            >
                                {segment}
                            </Typography>
                        ) : (
                            <Link
                                key={index}
                                component="button"
                                variant="body2"
                                underline="hover"
                                onClick={() => handleBreadcrumb(index)}
                            >
                                {segment}
                            </Link>
                        );
                    })}
                </Breadcrumbs>

                {loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        py={4}
                    >
                        <CircularProgress size={28} />
                    </Box>
                ) : folders.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 3, textAlign: 'center' }}
                    >
                        {t('move.noSubFolder')}
                    </Typography>
                ) : (
                    <List dense>
                        {folders.map((folder: any, i: number) => (
                            <ListItemButton
                                key={i}
                                selected={selectedFolder === folder.name}
                                onClick={() => setSelectedFolder(folder.name)}
                                onDoubleClick={() => handleNavigate(folder)}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <FolderRoundedIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={folder.name}
                                    primaryTypographyProps={{
                                        noWrap: true,
                                        variant: 'body2',
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button
                    onClick={handleConfirm}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    {t('common.confirm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
