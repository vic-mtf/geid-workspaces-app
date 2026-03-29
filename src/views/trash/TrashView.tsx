import { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, useMediaQuery, useTheme } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useAxios from '@/utils/useAxios';
import useViewData from '@/hooks/useViewData';
import Thumbnail from '@/views/main/displays/thumbnail/Thumbnail';
import ListView from '@/views/main/displays/list/ListView';
import AdaptiveSkeleton from '@/components/AdaptiveSkeleton';
import UpdateToast from '@/components/UpdateToast';
import { RootState } from '@/types';

interface TrashViewProps {
    selectedFiles?: Set<string>;
    onToggleSelect?: (name: string) => void;
}

export default function TrashView({ selectedFiles = new Set(), onToggleSelect }: TrashViewProps) {
    const { t } = useTranslation();
    const token = useSelector((store: RootState) => store.user.token);
    const display = useSelector((store: RootState) => (store.app as any).display ?? 'thumbnail');
    const sort = useSelector((store: RootState) => (store.app as any).sort ?? 'name');
    const order = useSelector((store: RootState) => (store.app as any).order ?? 'ascending');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
    const [, fetchTrashApi] = useAxios({ url: '/api/stuff/workspace/trash', headers }, { manual: true });
    const [, emptyTrash] = useAxios({ url: '/api/stuff/workspace/trash/empty', method: 'DELETE', headers }, { manual: true });

    const fetchFn = useCallback(async () => {
        const { data: res } = await fetchTrashApi();
        return res || [];
    }, [fetchTrashApi]);

    const mapFn = useCallback((res: any[]) => {
        return res
            .filter((f: any) => f.name && !f.name.startsWith('.') && f.name !== 'thumbs.db')
            .map((f: any) => ({
                _id: f._id,
                name: f.name,
                url: f.contentUrl ? `/api/stuff/workspace/file/${f.contentUrl.replace('workspace/', '')}` : null,
                createdAt: f.updatedAt || f.createdAt,
                size: f.size || 0,
                isDirectory: f.isDirectory || false,
                count: f.count,
            }));
    }, []);

    const { data, loading, showToast, hideToast, reload } = useViewData({ viewKey: 'trash', fetchFn, mapFn });

    const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false);
    const handleEmptyTrash = () => {
        setEmptyConfirmOpen(false);
        emptyTrash().then(() => reload(false));
    };

    const sorted = useMemo(() => {
        const sortFn = (a: any, b: any) => {
            if (sort === 'name' || !sort) return (a.name || '').localeCompare(b.name || '');
            if (sort === 'date' || sort === 'modified') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sort === 'size') return (a.size || 0) - (b.size || 0);
            if (sort === 'type') return (a.name || '').split('.').pop()!.localeCompare((b.name || '').split('.').pop()!);
            return 0;
        };
        const dirs = [...data.filter((f) => f.isDirectory)].sort(sortFn);
        const files = [...data.filter((f) => !f.isDirectory)].sort(sortFn);
        if (order === 'descending') { dirs.reverse(); files.reverse(); }
        return [...dirs, ...files];
    }, [data, sort, order]);


    if (loading) return <AdaptiveSkeleton />;

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
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <Box display="flex" justifyContent="flex-end" px={2} py={0.5} flexShrink={0}>
                <Button size="small" color="error" variant="outlined" startIcon={<DeleteForeverOutlinedIcon />} onClick={() => setEmptyConfirmOpen(true)} sx={{ textTransform: 'none', fontSize: isMobile ? 12 : 13 }}>
                    {t('trash.emptyTrash')}
                </Button>
            </Box>
            {display === 'list' || display === 'compact' ? (
                <ListView data={sorted} selectedFiles={selectedFiles} onToggleSelect={onToggleSelect || (() => {})} compact={display === 'compact'} />
            ) : (
                <Thumbnail data={sorted} selectedFiles={selectedFiles} onToggleSelect={onToggleSelect || (() => {})} />
            )}
            <Dialog open={emptyConfirmOpen} onClose={() => setEmptyConfirmOpen(false)} maxWidth="xs" fullWidth
                BackdropProps={{ sx: { bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity, backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})` } }}
                PaperProps={{ sx: { border: 1, borderColor: "divider" } }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <WarningAmberRoundedIcon color="warning" />
                        <Typography variant="h6" fontWeight="bold" fontSize={18}>
                            {t('trash.emptyTrashConfirmTitle') || 'Vider la corbeille'}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        {t('trash.emptyTrashConfirmMessage') || 'Tous les elements de la corbeille seront definitivement supprimes. Cette action est irreversible.'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmptyConfirmOpen(false)} color="inherit">{t('common.cancel')}</Button>
                    <Button variant="contained" color="error" startIcon={<DeleteForeverOutlinedIcon />} onClick={handleEmptyTrash}>
                        {t('trash.emptyTrashConfirm') || 'Vider definitivement'}
                    </Button>
                </DialogActions>
            </Dialog>
            <UpdateToast open={showToast} onClose={hideToast} />
        </Box>
    );
}
