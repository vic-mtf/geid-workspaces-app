import React, { useMemo, useRef, useState } from "react";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { setSort, setOrder } from "@/redux/app";
import { RootState } from "@/types";

export default function SortButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [openMenu, setOpenMenu] = useState(false);
  const anchorEl = useRef<HTMLButtonElement>(null);
  const sort = useSelector((store: RootState) => (store.app as any).sort ?? "name");
  const order = useSelector((store: RootState) => (store.app as any).order ?? "ascending");

  const sortTypes = useMemo(() => [
    { label: t("sort.name"), value: "name" },
    { label: t("sort.date") || "Date", value: "date" },
    { label: t("sort.size") || "Taille", value: "size" },
    { label: t("sort.modified") || "Modification", value: "modified" },
    { label: t("sort.type") || "Type", value: "type" },
  ], [t]);

  const sortDirs = useMemo(() => [
    { label: t("sort.ascending"), value: "ascending" },
    { label: t("sort.descending"), value: "descending" },
  ], [t]);

  return (
    <React.Fragment>
      <Button endIcon={<ExpandMoreRoundedIcon />} startIcon={<SortRoundedIcon />}
        variant="outlined" color="inherit" ref={anchorEl} onClick={() => setOpenMenu(true)}>
        {t("sort.sort")}
      </Button>
      <Menu open={openMenu} MenuListProps={{ dense: true }} anchorEl={anchorEl.current} onClose={() => setOpenMenu(false)}
        slotProps={{ paper: { sx: { bgcolor: (t: any) => t.palette.background.paper + t.customOptions.opacity, backdropFilter: (t: any) => `blur(${t.customOptions.blur})`, border: 1, borderColor: "divider", borderRadius: 2 } } }}>
        {sortTypes.map(({ label, value }) => (
          <MenuItem key={value} onClick={() => { dispatch(setSort(value)); setOpenMenu(false); }}>
            <ListItemIcon>{value === sort ? <CheckRoundedIcon /> : null}</ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ variant: "body2" }} />
          </MenuItem>
        ))}
        <Divider component="li" />
        {sortDirs.map(({ label, value }) => (
          <MenuItem key={value} onClick={() => { dispatch(setOrder(value)); setOpenMenu(false); }}>
            <ListItemIcon>{value === order ? <CheckRoundedIcon /> : null}</ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ variant: "body2" }} />
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
}
