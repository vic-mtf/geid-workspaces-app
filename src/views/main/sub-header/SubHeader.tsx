import { Button, MenuItem, Menu, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { Stack } from "@mui/system";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import SortButton from "@/views/main/sub-header/SortButton";
import UploadFilesButton from "@/views/main/sub-header/UploadFilesButton";
import TeleverseButton from "@/views/main/sub-header/TeleverseButton";
import DisplayButton from "@/views/main/sub-header/DisplayButton";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CreateFolderDialog from "@/views/main/CreateFolderDialog";

export default function SubHeader() {
  const { t } = useTranslation();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const handleCreated = () => {
    // Déclenche un rechargement du répertoire courant
    document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
  };

  return (
    <>
      <Toolbar variant="dense">
        <Stack direction="row" spacing={2} flexGrow={1}>
          <Button
            ref={anchorRef}
            variant="contained"
            endIcon={<ExpandMoreRoundedIcon />}
            startIcon={<AddRoundedIcon />}
            onClick={() => setMenuOpen(true)}
          >
            {t("common.new")}
          </Button>
          <Menu
            open={menuOpen}
            anchorEl={anchorRef.current}
            onClose={() => setMenuOpen(false)}
            MenuListProps={{ dense: true }}
          >
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                setFolderDialogOpen(true);
              }}
            >
              <ListItemIcon>
                <FolderOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("files.newFolderMenu")} />
            </MenuItem>
          </Menu>
          <TeleverseButton />
        </Stack>
        <Stack direction="row" spacing={2}>
          <UploadFilesButton />
          <SortButton />
          <DisplayButton />
        </Stack>
      </Toolbar>

      <CreateFolderDialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
