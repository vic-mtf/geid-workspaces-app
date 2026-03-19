import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Fade
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import optionLocalDate from '@/utils/optionLocalDate';
import useAxios from '@/utils/useAxios';
import actions from '@/views/main/displays/thumbnail/actions';
import SubMenu from '@/views/main/displays/thumbnail/SubMenu';
import { RootState } from '@/types';

interface WrapperContentProps {
    children?: React.ReactNode;
    createdAt?: string;
    name?: string;
    type?: string;
    url?: string;
    [key: string]: any;
}

export default function WrapperContent ({
    children,
    createdAt,
    name,
    type,
    url,
    ...otherProps
}: WrapperContentProps) {
    const file = { createdAt, name, type, url, ...otherProps };
    const date = new Date(createdAt || '');
    const [contextMenu, setContextMenu] = useState<{mouseX: number; mouseY: number} | null>(null);
    const menuRootRef = useRef<HTMLElement>(null);
    const [isRemoved, setIsRemoved] = useState(false);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const user = useSelector((store: RootState) => store.user);
    const [{loading}, refresh] = useAxios({
        headers: {
            'Authorization': `Bearer ${user?.token}`
          },
    }, {manual: true});
    const handleContextMenu = (event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenu(
        contextMenu === null ?
        { mouseX: event.clientX + 2, mouseY: event.clientY - 6 } : null,
      );
    };

    return (
        <React.Fragment>
            <Fade in={!isRemoved}>
                <ListItemButton
                    sx={{
                        display: 'flex',
                        flex: 1,
                        borderRadius: 2,
                    }}
                    title={`Nom: ${(name || '').replace(/_/ig, ' ')}\nType: ${type}\nDate: ${
                        date.toLocaleDateString(undefined, optionLocalDate)
                        }`
                    }
                    onContextMenu={handleContextMenu}
                    component="a"
                    target="_blank"
                    href={url || "#"}
                    selected={!!contextMenu}
                >
                    {children}
                </ListItemButton>
            </Fade>
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
                        bgcolor: (theme: any) => theme.palette.background.paper +
                        theme.customOptions.opacity,
                        border: (theme: any) => `1px solid ${theme.palette.divider}`,
                        backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`
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
