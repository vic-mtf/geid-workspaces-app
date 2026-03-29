import { useState, useCallback, useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useAxios from '@/utils/useAxios';
import useViewData from '@/hooks/useViewData';
import Thumbnail from '@/views/main/displays/thumbnail/Thumbnail';
import ListView from '@/views/main/displays/list/ListView';
import AdaptiveSkeleton from '@/components/AdaptiveSkeleton';
import UpdateToast from '@/components/UpdateToast';
import { RootState } from '@/types';

interface RecentViewProps {
    selectedFiles?: Set<string>;
    onToggleSelect?: (name: string) => void;
}

export default function RecentView({ selectedFiles = new Set(), onToggleSelect }: RecentViewProps) {
    const { t } = useTranslation();
    const token = useSelector((store: RootState) => store.user.token);
    const display = useSelector((store: RootState) => (store.app as any).display ?? 'thumbnail');
    const sort = useSelector((store: RootState) => (store.app as any).sort ?? 'name');
    const order = useSelector((store: RootState) => (store.app as any).order ?? 'ascending');

    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);

    const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    const [, refetch] = useAxios({ url: '/api/stuff/workspace/recent?limit=50', headers }, { manual: true });
    const [, refetchTags] = useAxios({ url: '/api/stuff/workspace/recent/tags', headers }, { manual: true });

    const fetchFn = useCallback(async () => {
        const [{ data: res }, { data: tagsRes }] = await Promise.all([refetch(), refetchTags()]);
        const tagList = (tagsRes || []).map((t: any) => typeof t === 'string' ? t : t.tag).filter((t: string) => t && t.trim());
        setTags(tagList);
        return res || [];
    }, [refetch, refetchTags]);

    const mapFn = useCallback((res: any[]) => {
        return res
            .filter((f: any) => f.name && !f.name.startsWith('.') && f.name !== 'thumbs.db')
            .map((f: any) => ({
                _id: f._id,
                name: f.name,
                url: f.url || (f.contentUrl ? `/api/stuff/workspace/file/${f.contentUrl.replace('workspace/', '')}` : null),
                createdAt: f.updatedAt || f.createdAt,
                size: f.size || 0,
                isDirectory: f.isDirectory || false,
                tags: f.tags || [],
                duration: f.duration || null,
                videoWidth: f.videoWidth || null,
                videoHeight: f.videoHeight || null,
                currentPath: f.currentPath || f.path || '',
            }));
    }, []);

    const { data, loading, showToast, hideToast } = useViewData({ viewKey: 'recent', fetchFn, mapFn });

    const filtered = useMemo(() => {
        let result = data;
        if (selectedTag) result = result.filter((f) => f.tags?.includes(selectedTag));
        const sortFn = (a: any, b: any) => {
            if (sort === 'name' || !sort) return (a.name || '').localeCompare(b.name || '');
            if (sort === 'date' || sort === 'modified') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sort === 'size') return (a.size || 0) - (b.size || 0);
            if (sort === 'type') return (a.name || '').split('.').pop()!.localeCompare((b.name || '').split('.').pop()!);
            return 0;
        };
        const dirs = [...result.filter((f) => f.isDirectory)].sort(sortFn);
        const files = [...result.filter((f) => !f.isDirectory)].sort(sortFn);
        if (order === 'descending') { dirs.reverse(); files.reverse(); }
        return [...dirs, ...files];
    }, [data, selectedTag, sort, order]);


    if (loading) return <AdaptiveSkeleton />;

    if (data.length === 0) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} height="100%" py={6} gap={1}>
                <AccessTimeOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                <Typography color="text.secondary" fontWeight="bold">{t('recent.noRecent')}</Typography>
                <Typography variant="body2" color="text.disabled">{t('recent.noRecentHint')}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 0.75, flexShrink: 0, borderBottom: 1, borderColor: 'divider', overflowX: 'auto', '&::-webkit-scrollbar': { height: 0 } }}>
                <LocalOfferOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                <Chip
                    label={t('recent.all') || 'Tout'}
                    size="small"
                    variant={!selectedTag ? 'filled' : 'outlined'}
                    color={!selectedTag ? 'primary' : 'default'}
                    onClick={() => setSelectedTag(null)}
                    sx={{ borderRadius: 1, fontSize: 12, flexShrink: 0 }}
                />
                {tags.slice(0, 20).map((tag) => (
                    <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant={selectedTag === tag ? 'filled' : 'outlined'}
                        color={selectedTag === tag ? 'primary' : 'default'}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        sx={{ borderRadius: 1, fontSize: 12, flexShrink: 0 }}
                    />
                ))}
            </Box>
            {display === 'list' || display === 'compact' ? (
                <ListView data={filtered} selectedFiles={selectedFiles} onToggleSelect={onToggleSelect || (() => {})} compact={display === 'compact'} />
            ) : (
                <Thumbnail data={filtered} selectedFiles={selectedFiles} onToggleSelect={onToggleSelect || (() => {})} />
            )}
            <UpdateToast open={showToast} onClose={hideToast} />
        </Box>
    );
}
