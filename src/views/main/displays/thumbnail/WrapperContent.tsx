import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import optionLocalDate from "@/utils/optionLocalDate";
import useAxios from "@/utils/useAxios";
import actions from "@/views/main/displays/thumbnail/actions";
import SubMenu from "@/views/main/displays/thumbnail/SubMenu";
import { RootState } from "@/types";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";

interface WrapperContentProps {
  children?: React.ReactNode;
  createdAt?: string;
  name?: string;
  type?: string;
  url?: string;
  isDirectory?: boolean;
  onFolderClick?: (name: string) => void;
  [key: string]: any;
}

export default function WrapperContent({
  children,
  createdAt,
  name,
  type,
  url,
  isDirectory,
  onFolderClick,
  ...otherProps
}: WrapperContentProps) {
  const { t } = useTranslation();
  const file = { createdAt, name, type, url, isDirectory, ...otherProps };
  const date = new Date(createdAt || "");
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const menuRootRef = useRef<HTMLElement>(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameFolderValue, setRenameFolderValue] = useState("");
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const user = useSelector((store: RootState) => store.user);
  const { pathname, search } = useLocation();

  const [{ loading }, refresh] = useAxios(
    { headers: { Authorization: `Bearer ${user?.token}` } },
    { manual: true }
  );

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 }
        : null
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDirectory && onFolderClick && name) {
      onFolderClick(name);
      return;
    }
    // Authenticated file open in new tab
    if (!isDirectory && url) {
      e.preventDefault();
      fetch(url, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
        })
        .catch(() => {
          enqueueSnackbar(t("files.openFileError"), { variant: "error" });
        });
    }
  };

  // Calcule le chemin courant pour les actions sur dossiers
  const getCurrentPath = () => {
    const params = new URLSearchParams(search);
    const folder = params.get("folder") || "";
    const cat = ["images", "videos", "others"].find((c) => pathname.includes(c)) ?? "documents";
    return folder ? `${cat}/${folder}` : cat;
  };

  const handleDeleteFolder = async () => {
    setContextMenu(null);
    try {
      const path = getCurrentPath();
      const res = await fetch(
        `/api/stuff/workspace/folder/${encodeURIComponent(JSON.stringify({ path, folderName: name }))}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      if (!res.ok) {
        enqueueSnackbar(t("files.folderDeleteError"), { variant: "error" });
        return;
      }
      setIsRemoved(true);
      document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
    } catch {
      enqueueSnackbar(t("files.deleteError"), { variant: "error" });
    }
  };

  const handleOpenRenameFolder = () => {
    setContextMenu(null);
    setRenameFolderValue(name || "");
    setRenameDialogOpen(true);
  };

  const handleConfirmRenameFolder = () => {
    const newName = renameFolderValue.trim();
    setRenameDialogOpen(false);
    if (!newName || newName === name?.trim()) return;
    const path = getCurrentPath();
    fetch("/api/stuff/workspace/folder", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ path, oldName: name, newName }),
    })
      .then((res) => {
        if (!res.ok) {
          enqueueSnackbar(t("files.folderRenameError"), { variant: "error" });
          return;
        }
        document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
      })
      .catch(() => enqueueSnackbar(t("files.renameError"), { variant: "error" }));
  };

  const folderActions = [
    {
      label: t("common.open"),
      icon: <FolderOpenOutlinedIcon />,
      onClick: () => {
        setContextMenu(null);
        if (onFolderClick && name) onFolderClick(name);
      },
    },
    {
      label: t("common.rename"),
      icon: <EditOutlinedIcon />,
      onClick: handleOpenRenameFolder,
    },
    {
      label: t("common.delete"),
      icon: <DeleteOutlinedIcon />,
      onClick: handleDeleteFolder,
    },
  ];

  return (
    <React.Fragment>
      <Fade in={!isRemoved}>
        <ListItemButton
          sx={{ display: "flex", flex: 1, borderRadius: 2 }}
          title={
            isDirectory
              ? t("files.folderLabel", { name: name || "" })
              : t("files.fileTitleTooltip", {
                  name: (name || "").replace(/_/gi, " "),
                  type: type,
                  date: date.toLocaleDateString(undefined, optionLocalDate),
                })
          }
          onContextMenu={handleContextMenu}
          onClick={handleClick}
          selected={!!contextMenu}
        >
          {children}
        </ListItemButton>
      </Fade>
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        variant="menu"
        MenuListProps={{ dense: true, sx: { px: 0.5 } }}
        PaperProps={{
          sx: {
            bgcolor: (theme: any) =>
              theme.palette.background.paper + theme.customOptions.opacity,
            border: (theme: any) => `1px solid ${theme.palette.divider}`,
            backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
          },
        }}
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {isDirectory
          ? folderActions.map((action, index) => (
              <MenuItem key={index} onClick={action.onClick} sx={{ borderRadius: 2 }}>
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText primary={action.label} />
              </MenuItem>
            ))
          : actions.map((action, index) =>
              action.options ? (
                <SubMenu
                  options={action.options}
                  label={action.label}
                  icon={action.icon}
                  key={index}
                  root={menuRootRef.current}
                  onClose={() => setContextMenu(null)}
                  file={file}
                />
              ) : (
                <MenuItem
                  key={index}
                  disabled={action.disabled}
                  sx={{ borderRadius: 2 }}
                  onClick={() => {
                    setContextMenu(null);
                    if (typeof action.onClick === "function")
                      action.onClick({
                        ...file,
                        currentPath: getCurrentPath(),
                        enqueueSnackbar,
                        closeSnackbar,
                        refresh,
                        loading,
                        user,
                        setIsRemoved,
                      });
                  }}
                >
                  <ListItemIcon>{action.icon}</ListItemIcon>
                  <ListItemText primary={action.label} />
                </MenuItem>
              )
            )}
      </Menu>
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" fontSize={18}>
            {t("files.renameFolder")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            value={renameFolderValue}
            onChange={(e) => setRenameFolderValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmRenameFolder();
            }}
            inputProps={{ style: { fontSize: 15 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>{t("common.cancel")}</Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "none" }}
            onClick={handleConfirmRenameFolder}
          >
            {t("common.rename")}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
