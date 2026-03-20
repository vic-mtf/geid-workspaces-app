import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Fade,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
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

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 }
        : null
    );
  };

  const handleClick = () => {
    if (isDirectory && onFolderClick && name) {
      onFolderClick(name);
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
        enqueueSnackbar("Impossible de supprimer ce dossier.", { variant: "error" });
        return;
      }
      setIsRemoved(true);
      document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
    } catch {
      enqueueSnackbar("Erreur lors de la suppression.", { variant: "error" });
    }
  };

  const handleRenameFolder = () => {
    setContextMenu(null);
    const newName = window.prompt("Nouveau nom du dossier :", name || "");
    if (!newName || newName.trim() === name?.trim()) return;
    const path = getCurrentPath();
    fetch("/api/stuff/workspace/folder", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ path, oldName: name, newName: newName.trim() }),
    })
      .then((res) => {
        if (!res.ok) {
          enqueueSnackbar("Impossible de renommer ce dossier.", { variant: "error" });
          return;
        }
        document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
      })
      .catch(() => enqueueSnackbar("Erreur lors du renommage.", { variant: "error" }));
  };

  const folderActions = [
    {
      label: "Ouvrir",
      icon: <FolderOpenOutlinedIcon />,
      onClick: () => {
        setContextMenu(null);
        if (onFolderClick && name) onFolderClick(name);
      },
    },
    {
      label: "Renommer",
      icon: <EditOutlinedIcon />,
      onClick: handleRenameFolder,
    },
    {
      label: "Supprimer",
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
              ? `Dossier : ${name || ""}`
              : `Nom: ${(name || "").replace(/_/gi, " ")}\nType: ${type}\nDate: ${date.toLocaleDateString(undefined, optionLocalDate)}`
          }
          onContextMenu={handleContextMenu}
          onClick={handleClick}
          {...(!isDirectory
            ? { component: "a", target: "_blank", href: url || "#" }
            : {})}
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
        MenuListProps={{ dense: true }}
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
              <MenuItem key={index} onClick={action.onClick}>
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
                  onClick={() => {
                    setContextMenu(null);
                    if (typeof action.onClick === "function")
                      action.onClick({
                        ...file,
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
