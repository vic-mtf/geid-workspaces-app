/**
 * WrapperContent — Wrapper interactif pour chaque fichier/dossier.
 *
 * Gere : clic, clic droit (context menu), double-clic (rename via parent).
 * Le renommage inline est deleguee au parent via onDoubleClickName.
 */

import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Fade,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useRef, useState, useCallback } from "react";
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
  onDoubleClickName?: () => void;
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
  onDoubleClickName,
  ...otherProps
}: WrapperContentProps) {
  const { t } = useTranslation();
  const file = { createdAt, name, type, url, isDirectory, ...otherProps };
  const date = new Date(createdAt || "");
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const menuRootRef = useRef<HTMLElement>(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const user = useSelector((store: RootState) => store.user);
  const { pathname, search } = useLocation();

  const [{ loading }, refresh] = useAxios(
    { headers: { Authorization: `Bearer ${user?.token}` } },
    { manual: true }
  );

  const getCurrentPath = useCallback(() => {
    const params = new URLSearchParams(search);
    const folder = params.get("folder") || "";
    const cat = ["images", "videos", "others"].find((c) => pathname.includes(c)) ?? "documents";
    return folder ? `${cat}/${folder}` : cat;
  }, [search, pathname]);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 }
        : null
    );
  };

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDoubleClickName?.();
  }, [onDoubleClickName]);

  const handleClick = (e: React.MouseEvent) => {
    if (isDirectory && onFolderClick && name) {
      onFolderClick(name);
      return;
    }
    if (!isDirectory && url) {
      e.preventDefault();
      fetch(url, { headers: { Authorization: `Bearer ${user?.token}` } })
        .then((res) => res.blob())
        .then((blob) => window.open(URL.createObjectURL(blob), "_blank"))
        .catch(() => enqueueSnackbar(t("files.openFileError"), { variant: "error" }));
    }
  };

  const handleDeleteFolder = async () => {
    setContextMenu(null);
    try {
      const path = getCurrentPath();
      const res = await fetch(
        `/api/stuff/workspace/folder/${encodeURIComponent(JSON.stringify({ path, folderName: name }))}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${user?.token}` } }
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

  const handleRenameFromMenu = () => {
    setContextMenu(null);
    onDoubleClickName?.();
  };

  const folderActions = [
    { label: t("common.open"), icon: <FolderOpenOutlinedIcon />, onClick: () => { setContextMenu(null); if (onFolderClick && name) onFolderClick(name); } },
    { label: t("common.rename"), icon: <EditOutlinedIcon />, onClick: handleRenameFromMenu },
    { label: t("common.delete"), icon: <DeleteOutlinedIcon />, onClick: handleDeleteFolder },
  ];

  return (
    <React.Fragment>
      <Fade in={!isRemoved}>
        <ListItemButton
          sx={{ display: "flex", flex: 1, borderRadius: 2, position: "relative" }}
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
          onDoubleClick={handleDoubleClick}
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
    </React.Fragment>
  );
}
