import React, { useMemo, useRef, useState } from "react";
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Button from "../../../components/Button";
import { Divider, ListItemText, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";

const listSortType = [
    {
        label: 'Nom',
        key: '_name',
        search: 'name',
    }, 
    {
        label: 'Date',
        key: '_date',
        search: 'date',
    }
];

const listSortDirection = [
    {
        label: 'Croissante',
        key: '_ascending',
        search: 'ascending',
    }, 
    {
        label: 'Décroissante',
        key: '_descending',
        search: 'descending',
    }
]
export default function SortButton () {
    const [openMenu, setOpenMenu] = useState(false);
    const { search } = useLocation();
    const navigateTo = useNavigate();
    const anchorEl = useRef();
    const { order, sort, } = queryString.parse(search);

    const btnSelectedtype = useMemo(() => listSortType.find(
        option => option.search === (sort || 'name')
        ), 
    [sort]);
    const btnSelectedDirection = useMemo(() => listSortDirection.find(
        option => option.search === (order || 'ascending')
        ), 
    [order]);

    return (
        <React.Fragment>
            <Button
                endIcon={<ExpandMoreRoundedIcon/>}
                startIcon={<SortRoundedIcon/>}
                color="inherit"
                ref={anchorEl}
                onClick={() => setOpenMenu(true)}
            >Trier</Button>
            <Menu
                open={openMenu}
                variant="selectedMenu"
                MenuListProps={{
                    dense: true,
                }}
                PaperProps={{
                    sx: {
                        bgcolor: theme => theme.palette.background.paper + 
                        theme.customOptions.opacity,
                        border: theme => `1px solid ${theme.palette.divider}`,
                        backdropFilter: theme => `blur(${theme.customOptions.blur})`,
                    }
                }}
                anchorEl={anchorEl.current}
                onClose={() => setOpenMenu(false)}
            >
                {
                    listSortType.map(({key, label, search: sort}) => (
                        <MenuItem
                            key={key}
                            onClick={() => {
                                navigateTo( '?' +
                                    queryString.stringify({
                                        ...queryString.parse(search),
                                        sort,
                                    })
                                )
                                setOpenMenu(false);
                            }}
                        >
                            <ListItemIcon
                               children={
                                key === btnSelectedtype.key && <CheckRoundedIcon/>
                                }
                            />
                            <ListItemText
                                primary={label}
                                primaryTypographyProps={{
                                    variant: 'body2'
                                }}
                            />
                        </MenuItem>
                    ))
                }
                <Divider component="li"/>
                {
                    listSortDirection.map(({key, search: order, label}) => (
                        <MenuItem
                            key={key}
                            onClick={() => {
                                navigateTo( '?' +
                                    queryString.stringify({
                                        ...queryString.parse(search),
                                        order,
                                    })
                                )
                                setOpenMenu(false);
                            }}
                            //selected={key === btnSelectedDirection.key}
                        >
                            <ListItemIcon
                               children={
                                key === btnSelectedDirection.key && <CheckRoundedIcon/>
                                }
                            />
                            <ListItemText
                                primary={label}
                                primaryTypographyProps={{
                                    variant: 'body2'
                                }}
                            />
                        </MenuItem>
                    ))
                }
            </Menu>
        </React.Fragment>
    );
}