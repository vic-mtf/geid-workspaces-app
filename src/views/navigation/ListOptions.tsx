import { Badge, Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography, alpha, useTheme } from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import listOptionMenu from '@/views/navigation/listOptionMenu';
import { NavOption, RootState } from '@/types';
import React, { useState } from 'react';

function ListOptions () {
    const { pathname, search } = useLocation();
    const navigateTo = useNavigate();
    const theme = useTheme();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const pendingShareCount = useSelector((store: RootState) => (store.app as any).pendingShareCount || 0);

    const toggleExpand = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

    const renderItem = (option: NavOption, depth = 0) => {
        const isActive = pathname.startsWith(option.to);
        const hasChildren = option.children && option.children.length > 0;
        const isOpen = expanded[option.to] ?? false;

        return (
            <React.Fragment key={option.to}>
                {option.divider && <Divider sx={{ my: 1 }} />}
                <ListItemButton
                    onClick={() => {
                        if (hasChildren) toggleExpand(option.to);
                        else if (!option.disabled) navigateTo(option.to + search);
                    }}
                    selected={isActive && !hasChildren}
                    disabled={option.disabled}
                    sx={{
                        borderRadius: 2,
                        mb: 0.25,
                        py: depth > 0 ? 0.5 : 1,
                        pl: 1 + depth * 2,
                        '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: 'primary.main',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                        },
                        ...(option.disabled && { opacity: 0.5 }),
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: isActive && !hasChildren ? 'primary.main' : 'text.secondary' }}>
                        {React.createElement(option.icon, { fontSize: 'small' })}
                    </ListItemIcon>
                    <ListItemText
                        primary={option.label}
                        primaryTypographyProps={{
                            fontSize: depth > 0 ? 13 : 14,
                            fontWeight: isActive && !hasChildren ? 600 : 400,
                            color: isActive && !hasChildren ? 'primary.main' : option.disabled ? 'text.disabled' : 'text.primary',
                        }}
                    />
                    {option.to === '/shared' && pendingShareCount > 0 && (
                        <Badge badgeContent={pendingShareCount} color="error" sx={{ ml: 1, '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }} />
                    )}
                    {hasChildren && (
                        isOpen ? <ExpandLessRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    )}
                    {option.disabled && (
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, ml: 0.5 }}>
                            Bientôt
                        </Typography>
                    )}
                </ListItemButton>

                {hasChildren && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List disablePadding>
                            {option.children!.map((child) => renderItem(child, depth + 1))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    return (
        <List sx={{ px: 1, py: 0.5 }}>
            {listOptionMenu.map((option) => renderItem(option))}
        </List>
    );
}

export default React.memo(ListOptions);
