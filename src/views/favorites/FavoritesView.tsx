import { useState, useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useAxios from '@/utils/useAxios';
import useViewData from '@/hooks/useViewData';
import Thumbnail from '@/views/main/displays/thumbnail/Thumbnail';
import ListView from '@/views/main/displays/list/ListView';
import AdaptiveSkeleton from '@/components/AdaptiveSkeleton';
import UpdateToast from '@/components/UpdateToast';
import { RootState } from '@/types';

export default function FavoritesView() {
    const { t } = useTranslation();
    const token = useSelector((store: RootState) => store.user.token);
    const display = useSelector((store: RootState) => (store.app as any).display ?? 'thumbnail');
    const sort = useSelector((store: RootState) => (store.app as any).sort ?? 'name');
    const order = useSelector((store: RootState) => (store.app as any).order ?? 'ascending');
    const [selectedFiles, setSelectedFiles] = useState(new Set<string>());

    const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    const [, refetch] = useAxios({ url: '/api/stuff/workspace/favorites', headers }, { manual: true });

    const fetchFn = useCallback(async () => {
        const { data: res } = await refetch();
        return res || [];
    }, [refetch]);

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
                tags: f.tags || [],
                duration: f.duration || null,
                videoWidth: f.videoWidth || null,
                videoHeight: f.videoHeight || null,
            }));
    }, []);

    const { data, loading, showToast, hideToast } = useViewData({ viewKey: 'favorites', fetchFn, mapFn });

    const sorted = useMemo(() => {
        let result = [...data];
        if (sort === 'name') result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        else if (sort === 'date' || sort === 'modified') result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        else if (sort === 'size') result.sort((a, b) => (a.size || 0) - (b.size || 0));
        else if (sort === 'type') result.sort((a, b) => (a.name || '').split('.').pop()!.localeCompare((b.name || '').split('.').pop()!));
        if (order === 'descending') result.reverse();
        return result;
    }, [data, sort, order]);

    const onToggleSelect = useCallback((name: string) => {
        setSelectedFiles((prev) => { const next = new Set(prev); next.has(name) ? next.delete(name) : next.add(name); return next; });
    }, []);

    if (loading) return <AdaptiveSkeleton />;

    if (data.length === 0) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} height="100%" py={6} gap={1}>
                <StarBorderOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                <Typography color="text.secondary" fontWeight="bold">{t('favorites.noFavorites')}</Typography>
                <Typography variant="body2" color="text.disabled">{t('favorites.noFavoritesHint')}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {display === 'list' || display === 'compact' ? (
                <ListView data={sorted} selectedFiles={selectedFiles} onToggleSelect={onToggleSelect} compact={display === 'compact'} />
            ) : (
                <Thumbnail data={sorted} selectedFiles={selectedFiles} onToggleSelect={onToggleSelect} />
            )}
            <UpdateToast open={showToast} onClose={hideToast} />
        </Box>
    );
}
