import { Box as MuiBox, Drawer, Stack, Toolbar, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import IconButton from '@/components/IconButton';
import DownloadItem from '@/views/main/sub-header/Downloads-menu-drawer/DownloadItem';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface DownloadsMenuDrawerProps {
    open: boolean;
    onClose: () => void;
    loadingList: any[];
    loadNumber?: number;
}

export default function DownloadsMenuDrawer ({open, onClose, loadingList}: DownloadsMenuDrawerProps) {
    const { t } = useTranslation();
    return (
        <Drawer
          variant="persistent"
          anchor="right"
          open={open}
          PaperProps={{
            sx: {
                width: {
                    xs: '100vw',
                    md: 250,
                    lg: 400,
                },
                bgcolor: (theme: any) => theme.palette.background.paper +
                theme.customOptions.opacity,
                border: (theme: any) => `1px solid ${theme.palette.divider}`,
                backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                px:1,
                overflow: 'hidden',
                display: "flex"
            }
          }}
        >
        <Toolbar variant="dense" />
        <Toolbar  disableGutters>
            <MuiBox>
                <IconButton title={t("common.close")} onClick={onClose} value="">
                    <CloseRoundedIcon fontSize="small"/>
                </IconButton>
            </MuiBox>
            <Typography
                variant="h6"
                fontSize={15}
                fontWeight="bold"
                ml={1}
            >
                {t("downloads.title")}
            </Typography>
        </Toolbar>
            <Stack
                spacing={2}
                display="flex"
                flex={1}
                mb={1}
                overflow="auto"
            >
                {loadingList?.reverse()?.map((item, _index) => (
                    <DownloadItem
                        key={item?._id}
                        {...item}
                    />
                ))}
                {loadingList?.length === 0 &&
                <Typography
                    align="center"
                    color="text.secondary"
                    display="flex"
                    flex={1}
                    justifyContent="center"
                    alignItems="center"
                >{t("downloads.noDownloads")}</Typography>}
            </Stack>
        </Drawer>
    )
}
