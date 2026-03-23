import { List, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Box, LinearProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { mainMenu, quickAccess } from '@/views/navigation/listOptionMenu';
import { useEffect, useState } from 'react';
import workspaceApi from '@/services/workspaceApi';
import normaliseOctetSize from '@/utils/normaliseOctetSize';
import React from 'react';

export default function ListOptions () {
    const { pathname } = useLocation();
    const navigateTo = useNavigate();
    const [quota, setQuota] = useState<{ used: number; total: number } | null>(null);

    useEffect(() => {
        workspaceApi.getQuota()
            .then(res => setQuota(res.data))
            .catch(() => {});
    }, []);

    const renderItem = (option: typeof mainMenu[number]) => (
        <ListItemButton
            key={option.label}
            onClick={() => navigateTo(option.to)}
            selected={pathname === option.to || pathname.startsWith(option.to + '?')}
            sx={{
                borderRadius: (theme: any) => theme.spacing(0, 1, 1, 0),
            }}
        >
            <ListItemIcon>
                {React.createElement(option.icon, { fontSize: 'small' })}
            </ListItemIcon>
            <ListItemText primary={option.label} />
        </ListItemButton>
    );

    const quotaPercent = quota ? (quota.used / quota.total) * 100 : 0;
    const quotaColor = quotaPercent > 90 ? 'error' : quotaPercent > 70 ? 'warning' : 'primary';

    return (
        <Box display="flex" flexDirection="column" height="100%">
            <List dense sx={{ pr: 0.5, flex: 1 }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                    sx={{ px: 2, py: 0.5, display: 'block' }}
                >
                    Mon espace
                </Typography>
                {mainMenu.map(renderItem)}

                <Divider sx={{ my: 1 }} />

                <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                    sx={{ px: 2, py: 0.5, display: 'block' }}
                >
                    Accès rapide
                </Typography>
                {quickAccess.map(renderItem)}
            </List>

            {quota && (
                <Box px={2} pb={2}>
                    <Divider sx={{ mb: 1.5 }} />
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(quotaPercent, 100)}
                        color={quotaColor as any}
                        sx={{ borderRadius: 1, height: 6, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {normaliseOctetSize(quota.used)} sur {normaliseOctetSize(quota.total)} utilisés
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
