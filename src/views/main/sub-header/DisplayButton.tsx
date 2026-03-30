import React, { useMemo, useRef, useState } from "react";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import SegmentRoundedIcon from '@mui/icons-material/SegmentRounded';
import ViewStreamRoundedIcon from '@mui/icons-material/ViewStreamRounded';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
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
        endIcon={<ExpandMoreOutlinedIcon />}
        startIcon={btnSelected?.icon}
        ref={anchorEl}
        variant="outlined"
        color="inherit"
        onClick={() => setOpenMenu(true)}
      >{t('display.display')}</Button>
      <Menu
        open={openMenu}
        MenuListProps={{ dense: true, sx: { px: 0.5 } }}
        anchorEl={anchorEl.current}
        onClose={() => setOpenMenu(false)}
        slotProps={{ paper: { sx: { bgcolor: (t: any) => t.palette.background.paper + t.customOptions.opacity, backdropFilter: (t: any) => `blur(${t.customOptions.blur})`, border: 1, borderColor: "divider", borderRadius: 2 } } }}
      >
        {listDisplayMode.map(({ icon, label, key, value }) => (
          <MenuItem key={key} sx={{ borderRadius: 2 }} onClick={() => { dispatch(setDisplay(value)); setOpenMenu(false); }}>
            <ListItemIcon>{key === btnSelected?.key ? <CheckOutlinedIcon /> : null}</ListItemIcon>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
}
