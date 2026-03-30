import {
    ClickAwayListener,
    Grow,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Paper,
    Popper
} from '@mui/material';
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined';
import React, { useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

interface SubMenuOption {
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    onClick?: (file: any) => void;
}

interface SubMenuProps {
    icon?: React.ReactNode;
    label: string;
    options: SubMenuOption[];
    file: any;
    onClose?: () => void;
    root?: HTMLElement | null;
}

export default function SubMenu ({icon, label, options, file, onClose}: SubMenuProps) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLLIElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const enter = useCallback(() => {
        if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
        setOpen(true);
    }, []);

    const leave = useCallback(() => {
        closeTimer.current = setTimeout(() => setOpen(false), 300);
    }, []);

    return (
        <React.Fragment>
            <MenuItem
                ref={anchorRef}
                onMouseEnter={enter}
                onMouseLeave={leave}
                sx={{ borderRadius: 2 }}
            >
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
                <ListItemText primary={label} />
                <ListItemIcon sx={{ '& *': { ml: 2 } }}>
                    <NavigateNextOutlinedIcon/>
                </ListItemIcon>
            </MenuItem>
            {ReactDOM.createPortal(
                <Popper
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    placement="right-start"
                    transition
                    onMouseEnter={enter}
                    onMouseLeave={leave}
                    sx={{ zIndex: (theme: any) => theme.zIndex.drawer + 100 }}
                >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{ transformOrigin: placement === 'right-start' ? 'left top' : 'right top' }}
                    >
                        <Paper
                            sx={{
                                mx: .5,
                                borderRadius: 2,
                                bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
                                border: (theme: any) => `1px solid ${theme.palette.divider}`,
                                backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`
                            }}
                        >
                            <ClickAwayListener onClickAway={() => setOpen(false)}>
                                <MenuList autoFocusItem={open} dense sx={{ px: 0.5 }}>
                                    {options?.map((option, index) => (
                                        <MenuItem
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                option?.onClick?.(file);
                                                setOpen(false);
                                                if(typeof onClose === 'function') onClose();
                                            }}
                                            disabled={option.disabled}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            {option.icon && <ListItemIcon>{option.icon}</ListItemIcon>}
                                            <ListItemText primary={option?.label} />
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
                </Popper>,
                document.getElementById('root')!
            )}
        </React.Fragment>
    );
}
