import {
  Drawer, Toolbar, Typography, List, ListItem, ListItemIcon,
  ListItemText, Box, IconButton, CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import { useEffect, useState } from "react";
import workspaceApi from "@/services/workspaceApi";

const actionIcons: Record<string, React.ReactNode> = {
  upload: <UploadOutlinedIcon fontSize="small" />,
  create: <CreateNewFolderOutlinedIcon fontSize="small" />,
  delete: <DeleteOutlinedIcon fontSize="small" />,
  rename: <EditOutlinedIcon fontSize="small" />,
  move: <DriveFileMoveOutlinedIcon fontSize="small" />,
  copy: <ContentCopyOutlinedIcon fontSize="small" />,
  restore: <RestoreOutlinedIcon fontSize="small" />,
  share: <ShareOutlinedIcon fontSize="small" />,
  tag: <LabelOutlinedIcon fontSize="small" />,
  favorite: <StarOutlinedIcon fontSize="small" />,
  trash: <DeleteOutlinedIcon fontSize="small" color="error" />,
};

const actionLabels: Record<string, string> = {
  upload: "a téléversé",
  create: "a créé",
  delete: "a supprimé",
  rename: "a renommé",
  move: "a déplacé",
  copy: "a copié",
  restore: "a restauré",
  share: "a partagé",
  tag: "a modifié les tags de",
  favorite: "a modifié le favori",
  trash: "a mis à la corbeille",
};

interface ActivityLogProps {
  open: boolean;
  onClose: () => void;
}

export default function ActivityLog({ open, onClose }: ActivityLogProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    workspaceApi.getActivity(50)
      .then(res => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDrawer-paper": { width: { xs: "100vw", sm: 360 } } }}
    >
      <Toolbar variant="dense" sx={{ justifyContent: "space-between" }}>
        <Typography fontWeight="bold">Activité récente</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Toolbar>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={24} />
        </Box>
      ) : logs.length === 0 ? (
        <Typography align="center" color="text.secondary" py={4}>
          Aucune activité récente
        </Typography>
      ) : (
        <List dense>
          {logs.map((log: any) => (
            <ListItem key={log._id}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {actionIcons[log.action] || <EditOutlinedIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    {actionLabels[log.action] || log.action}{" "}
                    <strong>{log.targetName}</strong>
                  </Typography>
                }
                secondary={new Date(log.createdAt).toLocaleString("fr-FR", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Drawer>
  );
}
