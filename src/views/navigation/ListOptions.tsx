import { Divider, List, ListItemButton, ListItemIcon, ListItemText, alpha, useTheme } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom';
import listOptionMenu from '@/views/navigation/listOptionMenu';
import React from 'react';

export default function ListOptions () {
    const { pathname, search } = useLocation();
    const navigateTo = useNavigate();
    const theme = useTheme();

    return (
        <List dense sx={{ px: 1, py: 0.5 }}>
            {listOptionMenu.map((option) => {
                const isActive = pathname.startsWith(option.to);
                return (
                    <React.Fragment key={option.to}>
                        {option.divider && <Divider sx={{ my: 1 }} />}
                        <ListItemButton
                            onClick={() => navigateTo(option.to + search)}
                            selected={isActive}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                py: 1,
                                '&.Mui-selected': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : 'text.secondary' }}>
                                {React.createElement(option.icon, { fontSize: 'small' })}
                            </ListItemIcon>
                            <ListItemText
                                primary={option.label}
                                primaryTypographyProps={{
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'primary.main' : 'text.primary',
                                }}
                            />
                        </ListItemButton>
                    </React.Fragment>
                );
            })}
        </List>
    );
}
