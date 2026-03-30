import React, { useEffect, useState } from 'react';
import {
  Box, Button, IconButton, LinearProgress, Typography, Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import normaliseOctetSize from '@/utils/normaliseOctetSize';
import FileTypeIcon from '@/components/FileTypeIcon';
import getFileExtension from '@/utils/getFileExtension';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

interface DownloadItemProps {
    file?: File;
    xhr?: XMLHttpRequest;
    icon?: string;
    end?: boolean | null;
    aborted?: boolean;
    loading?: boolean;
    cancel?: () => void;
    total?: number;
    loaded?: number;
    resend?: () => void;
    remove?: () => void;
    upload?: XMLHttpRequestUpload;
    type?: string;
}

export default function DownloadItem(props: DownloadItemProps) {
    const { file, xhr, end, aborted, loading, cancel, total, loaded, resend, remove, upload: _upload, type } = props;
    const [upload, setUpload] = useState({ total, loaded });
    const name = file?.name;
    const ext = getFileExtension(name ?? "") ?? "txt";
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();

    useEffect(() => {
        const handler = ({ loaded, total }: { loaded: number; total: number }) => setUpload({ loaded, total });
        if (xhr) {
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    enqueueSnackbar(t('downloads.uploadComplete', { name: name?.substring(0, 30) }), { variant: 'success' });
                    document.getElementById('root')?.dispatchEvent(new CustomEvent('_reload_current_dir'));
                }
            };
        }
        _upload?.addEventListener('progress', handler as any);
        return () => _upload?.removeEventListener('progress', handler as any);
    }, [_upload, xhr, enqueueSnackbar, name, t]);

    const percent = Math.floor(((upload.loaded ?? 0) * 100) / (upload.total ?? 1));
    const sizeText = upload.loaded === upload.total
        ? normaliseOctetSize(upload.total ?? 0)
        : `${normaliseOctetSize(upload.loaded ?? 0)} / ${normaliseOctetSize(upload.total ?? 0)}`;

    // Status
    const isDone = end === true;
    const isFailed = aborted === true;
    const isUploading = loading === true;

    return (
        <Box sx={{
            display: "flex", alignItems: "center", gap: 1.5, p: 1.5,
            borderRadius: 2, border: 1, borderColor: "divider",
            bgcolor: isDone ? "success.main" : isFailed ? "error.main" : "transparent",
            ...(isDone && { bgcolor: (theme: any) => theme.palette.mode === "dark" ? "rgba(46,125,50,0.08)" : "rgba(46,125,50,0.04)" }),
            ...(isFailed && { bgcolor: (theme: any) => theme.palette.mode === "dark" ? "rgba(211,47,47,0.08)" : "rgba(211,47,47,0.04)" }),
        }}>
            {/* Icone fichier */}
            <Box sx={{ flexShrink: 0, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileTypeIcon extension={ext} size={32} />
            </Box>

            {/* Infos */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap title={name}>
                    {name}
                </Typography>

                {isUploading && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                            <LinearProgress variant="determinate" value={percent} sx={{ flex: 1, borderRadius: 1, height: 4 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontSize: 11 }}>
                                {percent}%
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                            {sizeText}
                        </Typography>
                    </>
                )}

                {isDone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 14, color: "success.main" }} />
                        <Typography variant="caption" color="success.main" fontWeight={500}>
                            {t('downloads.uploadDone')}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                            {normaliseOctetSize(upload.total ?? 0)}
                        </Typography>
                    </Box>
                )}

                {isFailed && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                        <ErrorOutlineRoundedIcon sx={{ fontSize: 14, color: "error.main" }} />
                        <Typography variant="caption" color="error.main" fontWeight={500}>
                            {t('downloads.uploadFailed')}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Actions */}
            <Box sx={{ flexShrink: 0, display: "flex", gap: 0.25 }}>
                {isUploading && (
                    <Tooltip title={t('common.cancel')}>
                        <IconButton size="small" onClick={cancel} sx={{ color: "text.secondary" }}>
                            <CloseRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {isFailed && (
                    <Tooltip title={t('common.retry')}>
                        <IconButton size="small" onClick={resend} color="error">
                            <ReplayRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {(isDone || isFailed) && (
                    <Tooltip title={t('common.close')}>
                        <IconButton size="small" onClick={remove} sx={{ color: "text.disabled" }}>
                            <CloseRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
}
