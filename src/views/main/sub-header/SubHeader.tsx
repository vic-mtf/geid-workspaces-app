import {
  Button,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import { Stack } from "@mui/system";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import SortButton from "@/views/main/sub-header/SortButton";
import UploadFilesButton from "@/views/main/sub-header/UploadFilesButton";
import TeleverseButton from "@/views/main/sub-header/TeleverseButton";
import DisplayButton from "@/views/main/sub-header/DisplayButton";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CreateFolderDialog from "@/views/main/CreateFolderDialog";

interface SubHeaderProps {
  selectedFiles?: Set<string>;
  onClearSelection?: () => void;
  onDelete?: () => void;
  onMove?: () => void;
}

export default function SubHeader({
  selectedFiles,
  onClearSelection,
  onDelete,
  onMove,
}: SubHeaderProps) {
  const { t } = useTranslation();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const handleCreated = () => {
    document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
  };

  const selectionActive = selectedFiles && selectedFiles.size > 0;

  return (
    <>
      <Toolbar variant="dense">
        <Stack direction="row" spacing={2} flexGrow={1} alignItems="center">
          {selectionActive ? (
            <>
              <Tooltip title={t("selection.deselectAll")}>
                <IconButton size="small" onClick={onClearSelection}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="body2" fontWeight={600}>
                {t("selection.count", { count: selectedFiles.size })}
              </Typography>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteOutlinedIcon />}
                onClick={onDelete}
                sx={{ textTransform: "none" }}
              >
                {t("selection.deleteSelected", { count: selectedFiles.size })}
              </Button>
              <Button
                size="small"
                color="inherit"
                startIcon={<DriveFileMoveOutlinedIcon />}
                onClick={onMove}
                sx={{ textTransform: "none" }}
              >
                {t("selection.moveSelected", { count: selectedFiles.size })}
              </Button>
            </>
          ) : (
            <>
              <Button
                ref={anchorRef}
                variant="outlined"
                color="inherit"
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
            </>
          )}
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
