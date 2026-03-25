import { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, CircularProgress, Button, Grid, Menu, MenuItem,
    ListItemIcon, ListItemText, useMediaQuery, useTheme,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useAxios from '@/utils/useAxios';
import fileExtensionBase from '@/utils/fileExtensionBase';
import getFileExtension from '@/utils/getFileExtension';
import File from '@/views/main/displays/file/File';
import FolderItem from '@/views/main/displays/thumbnail/FolderItem';

interface ContextState {
    mouseX: number;
    mouseY: number;
    item: any | null;
}

export default function TrashView() {
    const { t } = useTranslation();
    const token = useSelector((store: any) => store.user.token);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [context, setContext] = useState<ContextState | null>(null);

    const headers = { Authorization: `Bearer ${token}` };

    const [, fetchTrash] = useAxios({ url: '/api/stuff/workspace/trash', headers }, { manual: true });
    const [, emptyTrash] = useAxios({ url: '/api/stuff/workspace/trash/empty', method: 'DELETE', headers }, { manual: true });
    const [, restoreItem] = useAxios({ method: 'PATCH', headers }, { manual: true });
    const [, deleteItem] = useAxios({ method: 'DELETE', headers }, { manual: true });

    const load = useCallback(() => {
        setLoading(true);
        fetchTrash().then(({ data: res }) => {
            const mapped = (res || [])
                .filter((f: any) => f.name && !f.name.startsWith('.') && f.name !== 'thumbs.db' && f.name !== 'Thumbs.db')
                .map((f: any) => ({
                    name: f.name,
                    url: f.contentUrl ? `/api/stuff/workspace/file/${encodeURIComponent(f.contentUrl.replace('workspace/', ''))}` : null,
                    createdAt: f.updatedAt || f.createdAt,
                    size: f.size || 0,
                    isDirectory: f.isDirectory || false,
                    _id: f._id,
                    doc: f,
                }));
            setData(mapped);
        }).catch(() => setData([])).finally(() => setLoading(false));
    }, [fetchTrash]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const root = document.getElementById('root');
        const handler = () => load();
        root?.addEventListener('_reload_trash', handler);
        return () => root?.removeEventListener('_reload_trash', handler);
    }, [load]);

    const handleContextMenu = (e: React.MouseEvent, item: any) => {
        e.preventDefault();
        setContext({ mouseX: e.clientX, mouseY: e.clientY, item });
    };

    const handleClose = () => setContext(null);

    const handleRestore = () => {
        if (!context?.item?._id) return;
        restoreItem({ url: `/api/stuff/workspace/trash/restore/${context.item._id}` })
            .then(() => load())
            .finally(() => handleClose());
    };

    const handleDeletePermanently = () => {
        if (!context?.item?._id) return;
        deleteItem({ url: `/api/stuff/workspace/trash/${context.item._id}` })
            .then(() => load())
            .finally(() => handleClose());
    };

    const handleEmptyTrash = () => {
        emptyTrash().then(() => {
            setData([]);
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1} height="100%" py={6}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (data.length === 0) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} height="100%" py={6} gap={1}>
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                <Typography color="text.secondary" fontWeight="bold">{t('trash.trashEmpty')}</Typography>
                <Typography variant="body2" color="text.disabled">{t('trash.trashEmptyHint')}</Typography>
            </Box>
        );
    }

    return (
        <Box overflow="auto" p={1} height="85vh">
            <Box display="flex" justifyContent="flex-end" mb={1}>
                <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteForeverOutlinedIcon />}
                    onClick={handleEmptyTrash}
                    sx={{ textTransform: 'none', fontSize: isMobile ? 12 : 13 }}
                >
                    {t('trash.emptyTrash')}
                </Button>
            </Box>
            <Grid container>
                {data.map((file, index) => {
                    const infos = file.isDirectory
                        ? null
                        : fileExtensionBase.find(({ exts }) => ~exts.indexOf(getFileExtension(file.name) ?? ''));
                    return (
                        <Grid
                            component="div"
                            item
                            xs={6}
                            sm={4}
                            md={12 / 5}
                            lg={12 / 6}
                            xl={12 / 8}
                            key={`trash_${index}_${file.name}`}
                        >
                            <Box
                                onContextMenu={(e) => handleContextMenu(e, file)}
                                sx={{
                                    p: 1,
                                    m: 0.5,
                                    borderRadius: 2,
                                    cursor: 'context-menu',
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                            >
                                <Box display="flex" flex={1} justifyContent="center" alignItems="center">
                                    {file.isDirectory ? (
                                        <FolderItem name={file.name} />
                                    ) : (
                                        <File
                                            {...infos}
                                            name={file.name}
                                            date={file.createdAt}
                                            url={file.url}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
            <Menu
                open={context !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={context ? { top: context.mouseY, left: context.mouseX } : undefined}
            >
                <MenuItem onClick={handleRestore}>
                    <ListItemIcon><RestoreOutlinedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>{t('trash.restore')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDeletePermanently}>
                    <ListItemIcon><DeleteForeverOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>{t('trash.deletePermanently')}</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}
