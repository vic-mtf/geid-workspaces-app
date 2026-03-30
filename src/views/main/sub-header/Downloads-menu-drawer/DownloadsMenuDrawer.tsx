import { Box, Drawer, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DownloadItem from '@/views/main/sub-header/Downloads-menu-drawer/DownloadItem';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

interface DownloadsMenuDrawerProps {
    open: boolean;
    onClose: () => void;
    loadingList: any[];
    loadNumber?: number;
}

export default function DownloadsMenuDrawer({ open, onClose, loadingList, loadNumber }: DownloadsMenuDrawerProps) {
    const { t } = useTranslation();
    const items = [...loadingList].reverse();
    const uploading = items.filter((i) => i.loading).length;
    const done = items.filter((i) => i.end).length;
    const failed = items.filter((i) => i.aborted).length;

    return (
        <Drawer
            variant="persistent"
            anchor="right"
            open={open}
            PaperProps={{
                sx: {
                    width: { xs: '100vw', sm: 360 },
                    bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
                    border: (theme: any) => `1px solid ${theme.palette.divider}`,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                    display: "flex",
                    flexDirection: "column",
                }
            }}
        >
            <Toolbar variant="dense" />

            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
                <Box flex={1}>
                    <Typography variant="h6" fontSize={15} fontWeight="bold">
                        {t("downloads.title")}
                    </Typography>
                    {items.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            {uploading > 0 && `${uploading} en cours`}
                            {uploading > 0 && done > 0 && " · "}
                            {done > 0 && `${done} termine${done > 1 ? "s" : ""}`}
                            {failed > 0 && ` · ${failed} echoue${failed > 1 ? "s" : ""}`}
                        </Typography>
                    )}
                </Box>
                <Tooltip title={t("common.close")}>
                    <IconButton size="small" onClick={onClose}>
                        <CloseOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Liste */}
            <Stack spacing={1} sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
                {items.map((item) => (
                    <DownloadItem key={item?._id} {...item} />
                ))}
                {items.length === 0 && (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 1, py: 4 }}>
                        <CloudUploadOutlinedIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                        <Typography color="text.secondary" variant="body2" textAlign="center">
                            {t("downloads.noDownloads")}
                        </Typography>
                    </Box>
                )}
            </Stack>
        </Drawer>
    );
}
