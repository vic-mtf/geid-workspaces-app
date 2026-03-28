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
import React, { useRef, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import optionLocalDate from "@/utils/optionLocalDate";
import useAxios from "@/utils/useAxios";
import actions from "@/views/main/displays/thumbnail/actions";
import SubMenu from "@/views/main/displays/thumbnail/SubMenu";
import { RootState } from "@/types";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CircleIcon from "@mui/icons-material/Circle";

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

  const isTrashView = pathname.startsWith("/trash");

  const getCurrentPath = useCallback(() => {
    return new URLSearchParams(search).get("folder") || "";
  }, [search, pathname]);

  const FOLDER_COLORS = useMemo(() => [
    { label: t("colors.default") || "Par defaut", value: null, hex: "#ed6c02" },
    { label: t("colors.blue") || "Bleu", value: "#1976d2", hex: "#1976d2" },
    { label: t("colors.green") || "Vert", value: "#2e7d32", hex: "#2e7d32" },
    { label: t("colors.red") || "Rouge", value: "#d32f2f", hex: "#d32f2f" },
    { label: t("colors.purple") || "Violet", value: "#7b1fa2", hex: "#7b1fa2" },
    { label: t("colors.orange") || "Orange", value: "#e65100", hex: "#e65100" },
    { label: t("colors.teal") || "Sarcelle", value: "#00695c", hex: "#00695c" },
    { label: t("colors.pink") || "Rose", value: "#c2185b", hex: "#c2185b" },
  ], [t]);

  const handleSetColor = async (color: string | null) => {
    setContextMenu(null);
    const fileId = (file as any)._id;
    if (!fileId) return;
    try {
      const res = await fetch(`/api/stuff/workspace/folder/color/${fileId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ color }),
      });
      if (!res.ok) throw new Error();
      document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
    } catch { enqueueSnackbar(t("colors.colorError") || "La couleur n'a pas pu etre modifiee.", { variant: "error" }); }
  };

  const handleTrashRestore = async () => {
    setContextMenu(null);
    const id = (file as any)._id;
    if (!id) return;
    try {
      const res = await fetch(`/api/stuff/workspace/restore/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${user?.token}` } });
      if (!res.ok) throw new Error();
      enqueueSnackbar(t("trash.restoreSuccess") || "Le fichier a ete restaure dans son emplacement d'origine.", { variant: "success" });
      document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
    } catch { enqueueSnackbar(t("trash.restoreError") || "La restauration n'a pas pu aboutir.", { variant: "error" }); }
  };

  const handleTrashDelete = () => {
    setContextMenu(null);
    document.getElementById("root")?.dispatchEvent(
      new CustomEvent("_confirm_delete", { detail: { fileNames: [name], isPermanent: true, fileId: (file as any)._id } })
    );
  };

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
    // Annuler le single clic (qui ouvrirait le détail)
    if (clickTimerRef.current) { clearTimeout(clickTimerRef.current); clickTimerRef.current = null; }
    onDoubleClickName?.();
  }, [onDoubleClickName]);

  // Timer pour distinguer single clic (→ detail) vs double clic (→ rename)
  const clickTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigatingRef = React.useRef(false);
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDirectory && onFolderClick && name) {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      setTimeout(() => { navigatingRef.current = false; }, 500);
      onFolderClick(name);
      return;
    }
    // Single clic sur fichier → ouvrir le détail (après délai pour laisser le double-clic annuler)
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      document.getElementById("root")?.dispatchEvent(new CustomEvent("_open_detail_file", { detail: { file } }));
    }, 250);
  }, [isDirectory, onFolderClick, name, file]);

  const handleDeleteFolder = () => {
    setContextMenu(null);
    document.getElementById("root")?.dispatchEvent(
      new CustomEvent("_confirm_delete", { detail: { fileNames: [name], isDirectory: true } })
    );
  };

  const handleRenameFromMenu = () => {
    setContextMenu(null);
    onDoubleClickName?.();
  };

  const trashActions = [
    { label: t("trash.restore") || "Restaurer", icon: <RestoreOutlinedIcon />, onClick: handleTrashRestore },
    { label: t("trash.deletePermanently") || "Supprimer definitivement", icon: <DeleteForeverOutlinedIcon />, onClick: handleTrashDelete },
  ];

  const folderActions = [
    { label: t("common.open"), icon: <FolderOpenOutlinedIcon />, onClick: () => { setContextMenu(null); if (onFolderClick && name) onFolderClick(name); } },
    { label: t("common.rename"), icon: <EditOutlinedIcon />, onClick: handleRenameFromMenu },
    { label: t("common.move") || "Deplacer", icon: <DriveFileMoveOutlinedIcon />, onClick: () => { setContextMenu(null); document.getElementById("root")?.dispatchEvent(new CustomEvent("_open_move_dialog", { detail: { file: { ...file, currentPath: getCurrentPath() } } })); } },
    { label: t("common.copy") || "Copier", icon: <ContentCopyOutlinedIcon />, onClick: () => { setContextMenu(null); document.getElementById("root")?.dispatchEvent(new CustomEvent("_open_copy_dialog", { detail: { file: { ...file, currentPath: getCurrentPath() } } })); } },
    {
      label: t("colors.title") || "Couleur",
      icon: <PaletteOutlinedIcon />,
      subOptions: FOLDER_COLORS.map((c) => ({ label: c.label, icon: <CircleIcon sx={{ color: c.hex, fontSize: 16 }} />, onClick: () => handleSetColor(c.value) })),
    },
    { label: t("common.share") || "Partager", icon: <ShareOutlinedIcon />, onClick: () => { setContextMenu(null); document.getElementById("root")?.dispatchEvent(new CustomEvent("_open_share_dialog", { detail: { file: { ...file, currentPath: getCurrentPath() } } })); } },
    { label: t("detail.title") || "Details", icon: <InfoOutlinedIcon />, onClick: () => { setContextMenu(null); document.getElementById("root")?.dispatchEvent(new CustomEvent("_open_detail_file", { detail: { file } })); } },
    { label: t("common.delete"), icon: <DeleteOutlinedIcon />, onClick: handleDeleteFolder },
  ] as any[];

  return (
    <React.Fragment>
      <Fade in={!isRemoved}>
        <ListItemButton
          disableRipple
          selected={false}
          sx={{
            display: "flex", flex: 1, borderRadius: 1, position: "relative",
            justifyContent: "center", alignItems: "center",
            p: 0,
            "&.Mui-focusVisible": { bgcolor: "transparent" },
            "&.Mui-selected": { bgcolor: "transparent" },
            "&:focus": { bgcolor: "transparent" },
          }}
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
        {isTrashView
          ? trashActions.map((action, index) => (
              <MenuItem key={index} onClick={action.onClick} sx={{ borderRadius: 2 }}>
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText primary={action.label} />
              </MenuItem>
            ))
          : isDirectory
            ? folderActions.map((action: any, index: number) =>
                action.subOptions ? (
                  <SubMenu key={index} options={action.subOptions} label={action.label} icon={action.icon} root={menuRootRef.current} onClose={() => setContextMenu(null)} file={file} />
                ) : (
                  <MenuItem key={index} onClick={action.onClick} sx={{ borderRadius: 2 }}>
                    <ListItemIcon>{action.icon}</ListItemIcon>
                    <ListItemText primary={action.label} />
                  </MenuItem>
                )
              )
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
