import React, { useMemo, useRef, useState } from "react";
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import queryString from "query-string";

export default function SortButton () {
    const { t } = useTranslation();
    const [openMenu, setOpenMenu] = useState(false);
    const { search } = useLocation();
    const navigateTo = useNavigate();
    const anchorEl = useRef<HTMLButtonElement>(null);
    const { order, sort, } = queryString.parse(search);

    const listSortType = useMemo(() => [
        { label: t('sort.name'), key: '_name', search: 'name' },
        { label: t('sort.date'), key: '_date', search: 'date' },
    ], [t]);

    const listSortDirection = useMemo(() => [
        { label: t('sort.ascending'), key: '_ascending', search: 'ascending' },
        { label: t('sort.descending'), key: '_descending', search: 'descending' },
    ], [t]);

    const btnSelectedtype = useMemo(() => listSortType.find(
        option => option.search === (sort || 'name')
        ),
    [sort, listSortType]);
    const btnSelectedDirection = useMemo(() => listSortDirection.find(
        option => option.search === (order || 'ascending')
        ),
    [order, listSortDirection]);

    return (
        <React.Fragment>
            <Button
                endIcon={<ExpandMoreRoundedIcon/>}
                startIcon={<SortRoundedIcon/>}
                color="inherit"
                ref={anchorEl}
                onClick={() => setOpenMenu(true)}
            >{t('sort.sort')}</Button>
            <Menu
                open={openMenu}
                variant="selectedMenu"
                MenuListProps={{
                    dense: true,
                }}
                PaperProps={{
                    sx: {
                        bgcolor: (theme: any) => theme.palette.background.paper +
                        theme.customOptions.opacity,
                        border: (theme: any) => `1px solid ${theme.palette.divider}`,
                        backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
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
                                key === btnSelectedtype?.key && <CheckRoundedIcon/>
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
                        >
                            <ListItemIcon
                               children={
                                key === btnSelectedDirection?.key && <CheckRoundedIcon/>
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
