import { useEffect, useState } from 'react';
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
    Chip,
    Stack,
    Autocomplete,
    Box,
} from '@mui/material';
import useAxios from '@/utils/useAxios';
import { RootState } from '@/types';

export default function TagsDialog() {
    const { t } = useTranslation();
    const { token } = useSelector((store: RootState) => store.user);
    const { enqueueSnackbar } = useSnackbar();

    const [file, setFile] = useState<any>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const headers = { Authorization: `Bearer ${token}` };

    const [, saveTags] = useAxios(
        { method: 'PATCH', headers },
        { manual: true }
    );

    const [, fetchSuggestions] = useAxios(
        {
            method: 'GET',
            url: '/api/stuff/workspace/tags',
            headers,
        },
        { manual: true }
    );

    useEffect(() => {
        const root = document.getElementById('root');
        const handler = (event: any) => {
            const f = event.detail?.file;
            setFile(f);
            setTags(f?.tags || []);
            setNewTag('');
            fetchSuggestions()
                .then((res: any) => {
                    const data = res.data;
                    setSuggestions(
                        Array.isArray(data) ? data : data?.tags || []
                    );
                })
                .catch(() => {
                    setSuggestions([]);
                });
        };
        root?.addEventListener('_open_tags_dialog', handler);
        return () => {
            root?.removeEventListener('_open_tags_dialog', handler);
        };
    }, [fetchSuggestions]);

    const fileId = file?._id;

    const handleAddTag = () => {
        const trimmed = newTag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed]);
        }
        setNewTag('');
    };

    const handleDeleteTag = (tag: string) => {
        setTags((prev) => prev.filter((t) => t !== tag));
    };

    const handleSave = () => {
        if (!fileId) return;
        saveTags({
            url: `/api/stuff/workspace/tags/${fileId}`,
            data: { tags },
        })
            .then(() => {
                enqueueSnackbar(t('tags.tagsUpdated'), { variant: 'success' });
                document
                    .getElementById('root')
                    ?.dispatchEvent(new CustomEvent('_reload_current_dir'));
                setFile(null);
            })
            .catch(() => {
                enqueueSnackbar(t('tags.tagsUpdateError'), {
                    variant: 'error',
                });
            });
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
                    bgcolor: (theme: any) =>
                        theme.palette.background.paper +
                        theme.customOptions.opacity,
                    backdropFilter: (theme: any) =>
                        `blur(${theme.customOptions.blur})`,
                },
            }}
            PaperProps={{ sx: { border: 1, borderColor: "divider" } }}
        >
            <DialogTitle>{t('tags.title')}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2, mt: 1 }}>
                    {tags.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            {t('tags.noTags')}
                        </Typography>
                    ) : (
                        tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                onDelete={() => handleDeleteTag(tag)}
                            />
                        ))
                    )}
                </Box>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ sm: 'center' }}
                >
                    <Autocomplete
                        freeSolo
                        options={suggestions.filter((s) => !tags.includes(s))}
                        inputValue={newTag}
                        onInputChange={(_, value) => setNewTag(value)}
                        onChange={(_, value) => {
                            if (typeof value === 'string' && value.trim()) {
                                const trimmed = value.trim();
                                if (!tags.includes(trimmed)) {
                                    setTags((prev) => [...prev, trimmed]);
                                }
                                setNewTag('');
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                placeholder={t('tags.newTag')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                            />
                        )}
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddTag}
                        sx={{ textTransform: 'none' }}
                    >
                        {t('common.add')}
                    </Button>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t('common.cancel')}</Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSave}
                    sx={{ textTransform: 'none' }}
                >
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
