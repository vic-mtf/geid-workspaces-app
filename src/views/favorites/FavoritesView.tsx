import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useAxios from '@/utils/useAxios';
import Thumbnail from '@/views/main/displays/thumbnail/Thumbnail';

export default function FavoritesView() {
    const { t } = useTranslation();
    const token = useSelector((store: any) => store.user.token);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [, refetch] = useAxios({ url: '/api/stuff/workspace/favorites', headers: { Authorization: `Bearer ${token}` } }, { manual: true });

    const load = useCallback(() => {
        setLoading(true);
        refetch().then(({ data: res }) => {
            const mapped = (res || [])
                .filter((f: any) => f.name && !f.name.startsWith('.') && f.name !== 'thumbs.db' && f.name !== 'Thumbs.db')
                .map((f: any) => ({
                    name: f.name,
                    url: f.contentUrl ? `/api/stuff/workspace/file/${encodeURIComponent(f.contentUrl.replace('workspace/', ''))}` : null,
                    createdAt: f.updatedAt || f.createdAt,
                    size: f.size || 0,
                    isDirectory: f.isDirectory || false,
                    doc: f,
                }));
            setData(mapped);
        }).catch(() => setData([])).finally(() => setLoading(false));
    }, [refetch]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const root = document.getElementById('root');
        const handler = () => load();
        root?.addEventListener('_reload_favorites', handler);
        return () => root?.removeEventListener('_reload_favorites', handler);
    }, [load]);

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
                <StarBorderOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                <Typography color="text.secondary" fontWeight="bold">{t('favorites.noFavorites')}</Typography>
                <Typography variant="body2" color="text.disabled">{t('favorites.noFavoritesHint')}</Typography>
            </Box>
        );
    }

    return <Thumbnail data={data} />;
}
