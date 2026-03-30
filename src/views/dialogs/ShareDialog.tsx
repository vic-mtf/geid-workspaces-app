import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box,
} from '@mui/material';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';

export default function ShareDialog() {
    const { t } = useTranslation();
    const [file, setFile] = useState<any>(null);

    useEffect(() => {
        const root = document.getElementById('root');
        const handler = (event: any) => setFile(event.detail?.file);
        root?.addEventListener('_open_share_dialog', handler);
        return () => root?.removeEventListener('_open_share_dialog', handler);
    }, []);

    const handleClose = () => setFile(null);

    return (
        <Dialog
            open={!!file}
            onClose={handleClose}
            fullWidth
            maxWidth="xs"
            BackdropProps={{
                sx: {
                    bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                },
            }}
            PaperProps={{ sx: { border: 1, borderColor: "divider" } }}
        >
            <DialogTitle>
                <Typography variant="h6" fontSize={16} fontWeight="bold">
                    {t('share.shareTitle')}
                </Typography>
                {file?.name && (
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 350, display: 'block' }}>
                        {file.name}
                    </Typography>
                )}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 3 }}>
                    <BuildOutlinedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    <Typography color="text.secondary" textAlign="center" fontWeight={500}>
                        {t("shared.maintenance")}
                    </Typography>
                    <Typography variant="body2" color="text.disabled" textAlign="center">
                        {t("shared.maintenanceHint")}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 2, py: 1 }}>
                <Button onClick={handleClose} color="inherit">{t('common.close')}</Button>
            </DialogActions>
        </Dialog>
    );
}
