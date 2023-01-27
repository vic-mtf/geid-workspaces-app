import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom';
import listOptionMenu from './listOptionMenu';
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
                        key={option.key} 
                        onClick={() => navigateTo(option.to + search)}
                        selected={!!pathname.match(new RegExp(`${option.to}`))}
                        sx={{borderRadius: "0 20px 20px 0"}}
                    >
                        <ListItemIcon>
                            {option.icon}
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