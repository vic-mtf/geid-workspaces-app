import { 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Menu, 
    MenuItem, 
    Zoom
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import optionLocalDate from '../../../../utils/optionLocalDate';
import useAxios from '../../../../utils/useAxios';
import actions from './actions';
import SubMenu from './SubMenu';

export default function WrapperContent ({
    children, 
    createdAt, 
    name, 
    type, 
    url, 
    ...otherProps
}) {
    const file = { createdAt, name, type, url, ...otherProps };
    const date = new Date(createdAt);
    const [contextMenu, setContextMenu] = useState(null);
    const menuRootRef = useRef();
    const [isRemoved, setIsRemoved] = useState(false);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const user = useSelector(store => store.user);
    const [{loading}, refresh] = useAxios({
        headers: {
            'Authorization': `Bearer ${user?.token}`
          },
    }, {manual: true});
    const handleContextMenu = event => {
      event.preventDefault();
      setContextMenu(
        contextMenu === null ? 
        { mouseX: event.clientX + 2, mouseY: event.clientY - 6 } : null,
      );
    };

    return (
        <React.Fragment>
            <Zoom in={!isRemoved}>
                <ListItemButton
                    sx={{
                        display: 'flex',
                        flex: 1,
                        borderRadius: 2,
                    }}
                    title={`Nom: ${name.replace(/_/ig, ' ')}\nType: ${type}\nDate: ${
                        date.toLocaleDateString(undefined, optionLocalDate)
                        }`
                    }
                    onContextMenu={handleContextMenu}
                    LinkComponent="a"
                    target="_blank"
                    href={url}
                    selected={!!contextMenu}
                >
                    {children}
                </ListItemButton>
            </Zoom>
            <Menu
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                variant="menu"
                MenuListProps={{
                    dense: true
                }}
                PaperProps={{
                    sx: {
                        bgcolor: theme => theme.palette.background.paper + 
                        theme.customOptions.opacity,
                        border: theme => `1px solid ${theme.palette.divider}`,
                        backdropFilter: theme => `blur(${theme.customOptions.blur})`
                    }
                }}
                anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
                }
            >
                {actions.map((action, index) => (
                    action.options ? 
                    (
                    <SubMenu 
                        options={action.options}
                        label={action.label}
                        icon={action.icon}
                        key={index}
                        root={menuRootRef.current}
                        onClose={() => setContextMenu(null)}
                        file={file}
                    />
                    ) :
                    (<MenuItem 
                        key={index} 
                        disabled={action.disabled}
                        onClick={() => {
                            setContextMenu(null);
                            if(typeof action.onClick === 'function')
                                action.onClick({
                                    ...file, 
                                    enqueueSnackbar, 
                                    closeSnackbar,
                                    refresh,
                                    loading,
                                    user,
                                    setIsRemoved,
                                });
                        }
                     }
                    >
                        <ListItemIcon> {action.icon} </ListItemIcon>
                        <ListItemText primary={action.label} />
                    </MenuItem>)
                ))}
            </Menu>
        </React.Fragment>
    );
}
