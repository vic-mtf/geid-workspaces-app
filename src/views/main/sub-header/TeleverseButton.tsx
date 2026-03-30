import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import getFile from "@/utils/getFile";

export default function TeleverseButton() {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);
  const anchorEl = useRef<HTMLButtonElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const dispatchFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    const name = "_open_files_form";
    document.getElementById("root")?.dispatchEvent(
      new CustomEvent(name, { detail: { files: fileArray, name } })
    );
  };

  return (
    <React.Fragment>
      <Button
        startIcon={<PublishRoundedIcon />}
        endIcon={<ExpandMoreOutlinedIcon />}
        variant="outlined"
        color="inherit"
        ref={anchorEl}
        onClick={() => setOpenMenu(true)}
      >
        {t("files.upload")}
      </Button>
      <Menu
        open={openMenu}
        MenuListProps={{ dense: true, sx: { px: 0.5 } }}
        anchorEl={anchorEl.current}
        onClose={() => setOpenMenu(false)}
        slotProps={{ paper: { sx: { bgcolor: (t: any) => t.palette.background.paper + t.customOptions.opacity, backdropFilter: (t: any) => `blur(${t.customOptions.blur})`, border: 1, borderColor: "divider", borderRadius: 2 } } }}
      >
        <MenuItem
          sx={{ borderRadius: 2 }}
          onClick={async () => {
            const files = await getFile({ multiple: true, accept: "*.*" });
            if (files) dispatchFiles(files as unknown as FileList);
            setOpenMenu(false);
          }}
        >
          <ListItemIcon>
            <InsertDriveFileOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={t("files.uploadFileItem")} />
        </MenuItem>
        <MenuItem
          sx={{ borderRadius: 2 }}
          onClick={() => {
            folderInputRef.current?.click();
            setOpenMenu(false);
          }}
        >
          <ListItemIcon>
            <FolderOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={t("files.uploadFolder")} />
        </MenuItem>
      </Menu>

      {/* Input caché pour la sélection de dossier */}
      <input
        ref={folderInputRef}
        type="file"
        style={{ display: "none" }}
        // @ts-ignore — webkitdirectory est une propriété non-standard mais supportée
        webkitdirectory=""
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            dispatchFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />
    </React.Fragment>
  );
}
