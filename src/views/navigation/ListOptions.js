import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom';
import listOptionMenu from './listOptionMenu';
import React from 'react';

export default function ListOptions () {
    const { pathname } = useLocation();
    const navigateTo = useNavigate();
    const { search } = useLocation();
    return (
        <List
            dense
            sx={{pr: .5}}
        >
            {
                listOptionMenu.map(option => (
                    <ListItemButton 
                        key={option.label} 
                        onClick={() => navigateTo(option.to + search)}
                        selected={RegExp(`${option.to}`).test(pathname)}
                        sx={{ 
                            borderRadius: theme => theme.spacing(0, 1, 1, 0)
                         }}
                    >
                        <ListItemIcon>
                            { 
                                React.createElement(
                                    option.icon, 
                                    { fontSize: 'small' }
                                ) 
                            }
                        </ListItemIcon>
                        <ListItemText
                            primary={option.label}
                        />
                    </ListItemButton>
                ))
            }
        </List>
    );
}