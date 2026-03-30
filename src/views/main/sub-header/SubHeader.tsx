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
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import SortButton from "@/views/main/sub-header/SortButton";
import UploadFilesButton from "@/views/main/sub-header/UploadFilesButton";
import TeleverseButton from "@/views/main/sub-header/TeleverseButton";
import DisplayButton from "@/views/main/sub-header/DisplayButton";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import CreateFolderDialog from "@/views/main/CreateFolderDialog";

interface SubHeaderProps {
  selectedFiles?: Set<string>;
  onClearSelection?: () => void;
  onDelete?: () => void;
  onMove?: () => void;
  trashCount?: number;
}

function SubHeader({
  selectedFiles,
  onClearSelection,
  onDelete,
  onMove,
  trashCount = 0,
}: SubHeaderProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isFilesView = pathname.startsWith("/files");
  const isTrashView = pathname.startsWith("/trash");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const handleCreated = () => {
    document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
  };

  // Écouter le raccourci Ctrl+Shift+N
  React.useEffect(() => {
    const root = document.getElementById("root");
    const handler = () => setFolderDialogOpen(true);
    root?.addEventListener("_open_create_folder", handler);
    return () => root?.removeEventListener("_open_create_folder", handler);
  }, []);

  const selectionActive = selectedFiles && selectedFiles.size > 0;

  return (
    <>
      <Toolbar variant="dense">
        <Stack direction="row" spacing={2} flexGrow={1} alignItems="center">
          {selectionActive ? (
            <>
              <Tooltip title={t("selection.deselectAll")}>
                <IconButton size="small" onClick={onClearSelection}>
                  <CloseOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="body2" fontWeight={600}>
                {t("selection.count", { count: selectedFiles.size })}
              </Typography>
              {isTrashView ? (
                <>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<RestoreOutlinedIcon />}
                    onClick={() => document.getElementById("root")?.dispatchEvent(new CustomEvent("_restore_selection"))}
                    sx={{ textTransform: "none" }}
                  >
                    {t("trash.restore")}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteForeverOutlinedIcon />}
                    onClick={() => document.getElementById("root")?.dispatchEvent(new CustomEvent("_permanent_delete_selection"))}
                    sx={{ textTransform: "none" }}
                  >
                    {t("deleteConfirm.deletePermanent")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlinedIcon />}
                    onClick={onDelete}
                    sx={{ textTransform: "none" }}
                  >
                    {t("selection.deleteSelected", { count: selectedFiles.size })}
                  </Button>
                  {isFilesView && (
                    <Button
                      size="small"
                      color="inherit"
                      startIcon={<DriveFileMoveOutlinedIcon />}
                      onClick={onMove}
                      sx={{ textTransform: "none" }}
                    >
                      {t("selection.moveSelected", { count: selectedFiles.size })}
                    </Button>
                  )}
                </>
              )}
            </>
          ) : isFilesView ? (
            <>
              <Button
                ref={anchorRef}
                variant="outlined"
                color="inherit"
                endIcon={<ExpandMoreOutlinedIcon />}
                startIcon={<AddOutlinedIcon />}
                onClick={() => setMenuOpen(true)}
              >
                {t("common.new")}
              </Button>
              <Menu
                open={menuOpen}
                anchorEl={anchorRef.current}
                onClose={() => setMenuOpen(false)}
                MenuListProps={{ dense: true, sx: { px: 0.5 } }}
                slotProps={{ paper: { sx: { bgcolor: (t: any) => t.palette.background.paper + t.customOptions.opacity, backdropFilter: (t: any) => `blur(${t.customOptions.blur})`, border: 1, borderColor: "divider", borderRadius: 2 } } }}
              >
                <MenuItem
                  sx={{ borderRadius: 2 }}
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
          ) : null}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {isTrashView && (
            <Button
              size="small"
              color="error"
              variant="outlined"
              disabled={trashCount === 0}
              startIcon={<DeleteForeverOutlinedIcon />}
              onClick={() => document.getElementById("root")?.dispatchEvent(new CustomEvent("_confirm_empty_trash"))}
              sx={{ textTransform: "none", mr: 1 }}
            >
              {t("trash.emptyTrash")}
            </Button>
          )}
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

export default React.memo(SubHeader);
