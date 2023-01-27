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
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';

export default function SubMenu ({icon, label, options, file, onClose}) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef();

    return (
        <React.Fragment>
            <MenuItem
                ref={anchorRef}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
                <ListItemText primary={label} />
                <ListItemIcon
                    sx={{
                        '& *': {
                            ml: 2,
                        }
                    }}
                >
                    <NavigateNextRoundedIcon/>
                </ListItemIcon>
            </MenuItem>
            <CustomMenu
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                anchorEl={anchorRef.current}
                options={options}
                onClose={onClose}
                open={open}
                file={file}
            />
        </React.Fragment>
    );
}

const CustomMenu = ({
    anchorEl, 
    open, 
    onMouseEnter, 
    onMouseLeave,
    options,
    file,
    onClose,
}) => {

    return (
        ReactDOM.createPortal(
            <Popper
                open={open}
                anchorEl={anchorEl}
                role={undefined}
                placement="right-start"
                transition
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                sx={{
                    zIndex: theme => theme.zIndex.drawer + 100,
                }}
            >
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{
                        transformOrigin:
                            placement === 'right-start' ? 'left top' : 'right top',
                    }}
                >
                    <Paper
                        sx={{
                            mx: .5,
                            bgcolor: theme => theme.palette.background.paper + 
                            theme.customOptions.opacity,
                            border: theme => `1px solid ${theme.palette.divider}`,
                            backdropFilter: theme => `blur(${theme.customOptions.blur})`
                        }}

                    >
                        <ClickAwayListener onClickAway={() => null} >
                            <MenuList
                                autoFocusItem={open}
                            >
                                {options?.map((option, index) => (
                                        <MenuItem 
                                            key={index}
                                            onClick={() => {
                                                option?.onClick(file);
                                                if(typeof onClose === 'function')
                                                    onClose();
                                            }}
                                            disabled={option.disabled}
                                        >
                                            <ListItemText primary={option?.label} />
                                        </MenuItem>
                                ))}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
            ,
            document.getElementById('root')
        )
    )
}