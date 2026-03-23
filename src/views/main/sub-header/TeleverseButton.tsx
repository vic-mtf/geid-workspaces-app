import React, { useRef, useState } from "react";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useDispatch } from "react-redux";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import getFile from "@/utils/getFile";
import { openFilesForm } from "@/redux/ui";

export default function TeleverseButton() {
  const dispatch = useDispatch();
  const [openMenu, setOpenMenu] = useState(false);
  const anchorEl = useRef<HTMLButtonElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const dispatchFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    dispatch(openFilesForm(fileArray));
  };

  return (
    <React.Fragment>
      <Button
        startIcon={<PublishRoundedIcon />}
        endIcon={<ExpandMoreRoundedIcon />}
        color="inherit"
        ref={anchorEl}
        onClick={() => setOpenMenu(true)}
      >
        Téléverser
      </Button>
      <Menu
        open={openMenu}
        variant="selectedMenu"
        MenuListProps={{ dense: true }}
        PaperProps={{
          sx: {
            bgcolor: (theme: any) =>
              theme.palette.background.paper + theme.customOptions.opacity,
            border: (theme: any) => `1px solid ${theme.palette.divider}`,
            backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
          },
        }}
        anchorEl={anchorEl.current}
        onClose={() => setOpenMenu(false)}
      >
        <MenuItem
          onClick={async () => {
            const files = await getFile({ multiple: true, accept: "*.*" });
            if (files) dispatchFiles(files as unknown as FileList);
            setOpenMenu(false);
          }}
        >
          <ListItemIcon>
            <InsertDriveFileOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Fichier(s)" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            folderInputRef.current?.click();
            setOpenMenu(false);
          }}
        >
          <ListItemIcon>
            <FolderOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Dossier" />
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
