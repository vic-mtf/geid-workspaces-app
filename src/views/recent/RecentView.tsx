import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { useSelector } from 'react-redux';
import useAxios from '@/utils/useAxios';
import Thumbnail from '@/views/main/displays/thumbnail/Thumbnail';

export default function RecentView() {
    const token = useSelector((store: any) => store.user.token);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [, refetch] = useAxios({ url: '/api/stuff/workspace/recent?limit=50', headers: { Authorization: `Bearer ${token}` } }, { manual: true });

    const load = useCallback(() => {
        setLoading(true);
        refetch().then(({ data: res }) => {
            const mapped = (res || []).map((f: any) => ({
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
        root?.addEventListener('_reload_recent', handler);
        return () => root?.removeEventListener('_reload_recent', handler);
    }, [load]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (data.length === 0) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} gap={1}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                <Typography color="text.secondary" fontWeight="bold">Aucun fichier consulté récemment</Typography>
                <Typography variant="body2" color="text.disabled">Les fichiers que vous ouvrez apparaîtront ici</Typography>
            </Box>
        );
    }

    return <Thumbnail data={data} />;
}
