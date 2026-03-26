import React, { useMemo, useRef, useState } from "react";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import SegmentRoundedIcon from '@mui/icons-material/SegmentRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { setDisplay } from "@/redux/app";
import { RootState } from "@/types";

export default function DisplayButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [openMenu, setOpenMenu] = useState(false);
  const anchorEl = useRef<HTMLButtonElement>(null);
  const display = useSelector((store: RootState) => (store.app as any).display ?? "thumbnail");

  const listDisplayMode = useMemo(() => [
    { label: t('display.thumbnail'), key: '_square', icon: <GridViewOutlinedIcon />, value: 'thumbnail' },
    { label: t('display.list'), key: '_list', icon: <SegmentRoundedIcon />, value: 'list' },
    { label: t('display.compact'), key: '_compact', icon: <ViewStreamRoundedIcon />, value: 'compact' },
  ], [t]);

  const btnSelected = useMemo(() => listDisplayMode.find(o => o.value === display), [display, listDisplayMode]);

  return (
    <React.Fragment>
      <Button
        endIcon={<ExpandMoreRoundedIcon />}
        startIcon={btnSelected?.icon}
        ref={anchorEl}
        variant="outlined"
        color="inherit"
        onClick={() => setOpenMenu(true)}
      >{t('display.display')}</Button>
      <Menu
        open={openMenu}
        MenuListProps={{ dense: true }}
        anchorEl={anchorEl.current}
        onClose={() => setOpenMenu(false)}
      >
        {listDisplayMode.map(({ icon, label, key, value }) => (
          <MenuItem key={key} onClick={() => { dispatch(setDisplay(value)); setOpenMenu(false); }}>
            <ListItemIcon>{key === btnSelected?.key ? <CheckRoundedIcon /> : null}</ListItemIcon>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
}
