import { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
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
    busyFiles?: Set<string>;
}

export default function TrashView({ selectedFiles = new Set(), onToggleSelect, busyFiles }: TrashViewProps) {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const token = useSelector((store: RootState) => store.user.token);
    const display = useSelector((store: RootState) => (store.app as any).display ?? 'thumbnail');
    const sort = useSelector((store: RootState) => (store.app as any).sort ?? 'name');
    const order = useSelector((store: RootState) => (store.app as any).order ?? 'ascending');
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
                createdAt: f.trashedAt || f.createdAt,
                size: f.size || 0,
                isDirectory: f.isDirectory || false,
                count: f.count,
                currentPath: f.path || '',
                color: f.color || null,
                duration: f.duration || null,
                videoWidth: f.videoWidth || null,
                videoHeight: f.videoHeight || null,
                imageWidth: f.imageWidth || null,
                imageHeight: f.imageHeight || null,
            }));
    }, []);

    const { data, loading, showToast, hideToast, reload } = useViewData({ viewKey: 'trash', fetchFn, mapFn });

    // Informer Main.tsx du nombre d'éléments pour le bouton "Vider la corbeille"
    useEffect(() => {
        document.getElementById("root")?.dispatchEvent(new CustomEvent("_trash_count", { detail: { count: data.length } }));
    }, [data.length]);

    const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false);

    // Écouter l'event du SubHeader pour ouvrir la confirmation
    useEffect(() => {
        const root = document.getElementById("root");
        const handler = () => setEmptyConfirmOpen(true);
        root?.addEventListener("_confirm_empty_trash", handler);
        return () => root?.removeEventListener("_confirm_empty_trash", handler);
    }, []);

    const handleEmptyTrash = () => {
        setEmptyConfirmOpen(false);
        emptyTrash().then(() => {
            reload(false);
            document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
        });
    };

    const sorted = useMemo(() => {
        const sortFn = (a: any, b: any) => {
            if (sort === 'name' || !sort) return (a.name || '').localeCompare(b.name || '');
            if (sort === 'date' || sort === 'modified') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sort === 'size') return (a.size || 0) - (b.size || 0);
            if (sort === 'type') return ((a.name || '').split('.').pop() || '').localeCompare((b.name || '').split('.').pop() || '');
            return 0;
        };
        const dirs = [...data.filter((f) => f.isDirectory)].sort(sortFn);
        const files = [...data.filter((f) => !f.isDirectory)].sort(sortFn);
        if (order === 'descending') { dirs.reverse(); files.reverse(); }
        return [...dirs, ...files];
    }, [data, sort, order]);

    // Restauration groupée depuis le SubHeader
    useEffect(() => {
        const root = document.getElementById("root");
        const handler = async () => {
            const items = sorted.filter((f) => selectedFiles.has(f.name ?? ""));
            if (items.length === 0) return;
            const names = items.map((f) => f.name).filter(Boolean) as string[];
            names.forEach((n) => root?.dispatchEvent(new CustomEvent("_set_busy", { detail: { name: n } })));
            let ok = 0;
            await Promise.all(items.map(async (item) => {
                try {
                    const res = await fetch(`/api/stuff/workspace/restore/${item._id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
                    if (!res.ok) throw new Error();
                    ok++;
                } catch { /* ignore */ }
            }));
            names.forEach((n) => root?.dispatchEvent(new CustomEvent("_clear_busy", { detail: { name: n } })));
            if (ok > 0) enqueueSnackbar(t("trash.restoreSuccess"), { variant: "success" });
            if (ok < items.length) enqueueSnackbar(t("trash.restoreError"), { variant: "error" });
            reload(false);
            root?.dispatchEvent(new CustomEvent("_reload_current_dir"));
        };
        root?.addEventListener("_restore_selection", handler);
        return () => root?.removeEventListener("_restore_selection", handler);
    }, [sorted, selectedFiles, token, enqueueSnackbar, t, reload]);

    // Suppression permanente groupée depuis le SubHeader
    useEffect(() => {
        const root = document.getElementById("root");
        const handler = () => {
            const names = sorted.filter((f) => selectedFiles.has(f.name ?? "")).map((f) => f.name).filter(Boolean) as string[];
            if (names.length === 0) return;
            const ids = sorted.filter((f) => selectedFiles.has(f.name ?? "")).map((f) => f._id).filter(Boolean);
            root?.dispatchEvent(new CustomEvent("_confirm_delete", {
                detail: { fileNames: names, isPermanent: true, fileIds: ids },
            }));
        };
        root?.addEventListener("_permanent_delete_selection", handler);
        return () => root?.removeEventListener("_permanent_delete_selection", handler);
    }, [sorted, selectedFiles]);

    // Ctrl+A — sélectionner/désélectionner tous les éléments
    useEffect(() => {
        const root = document.getElementById("root");
        const handler = () => {
            if (!onToggleSelect) return;
            const allNames = sorted.map((f) => f.name).filter(Boolean) as string[];
            const allSelected = allNames.length > 0 && allNames.every((n) => selectedFiles.has(n));
            if (allSelected) {
                allNames.forEach((n) => onToggleSelect(n));
            } else {
                allNames.filter((n) => !selectedFiles.has(n)).forEach((n) => onToggleSelect(n));
            }
        };
        root?.addEventListener("_select_all", handler);
        return () => root?.removeEventListener("_select_all", handler);
    }, [sorted, selectedFiles, onToggleSelect]);

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
            {display === 'list' || display === 'compact' ? (
                <ListView data={sorted} selectedFiles={selectedFiles} onToggleSelect={onToggleSelect || (() => {})} compact={display === 'compact'} busyFiles={busyFiles} />
            ) : (
                <Thumbnail data={sorted} selectedFiles={selectedFiles} onToggleSelect={onToggleSelect || (() => {})} busyFiles={busyFiles} />
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
