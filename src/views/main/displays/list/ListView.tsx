import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import fileExtensionBase from "@/utils/fileExtensionBase";
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import optionLocalDate from "@/utils/optionLocalDate";
import actions from "@/views/main/displays/thumbnail/actions";
import SubMenu from "@/views/main/displays/thumbnail/SubMenu";
import { useSnackbar } from "notistack";
import useAxios from "@/utils/useAxios";
import { FileItem, RootState } from "@/types";

interface ListViewProps {
  data?: FileItem[];
}

export default function ListView({ data }: ListViewProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const user = useSelector((store: RootState) => store.user);
  const [, refresh] = useAxios(null as any, { manual: true });
  const searchQuery = useSelector((store: RootState) => store.ui.searchQuery);

  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; file: any } | null>(null);

  const filteredData = data?.filter((item) => {
    if (!searchQuery?.trim()) return true;
    return item.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleFolderClick = (folderName: string) => {
    const params = new URLSearchParams(search);
    const currentFolder = params.get("folder") || "";
    const newFolder = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    navigate(`${pathname}?folder=${encodeURIComponent(newFolder)}`);
  };

  if (!filteredData?.length) {
    return (
      <Typography
        align="center" color="text.secondary" height="100%"
        display="flex" alignItems="center" justifyContent="center"
        flexDirection="column" variant="body1" fontWeight="bold"
      >
        <InboxOutlinedIcon fontSize="large" /> Aucun élément
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ height: "85vh", overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Nom</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: 150 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: 100 }}>Taille</TableCell>
            <TableCell sx={{ width: 48 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((file, index) => {
            const infos = file.isDirectory
              ? null
              : fileExtensionBase.find(({ exts }) =>
                  ~exts.indexOf(getFileExtension(file.name) ?? "")
                );

            return (
              <TableRow
                key={`${index}_${file.name}`}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  if (file.isDirectory && file.name) handleFolderClick(file.name);
                  else if (file.url) window.open(file.url, "_blank");
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {file.isDirectory ? (
                      <FolderOutlinedIcon color="primary" fontSize="small" />
                    ) : infos?.icon ? (
                      <Box component="img" src={infos.icon} sx={{ width: 20, height: 20 }} />
                    ) : (
                      <InsertDriveFileOutlinedIcon fontSize="small" color="action" />
                    )}
                    <Typography variant="body2" noWrap>
                      {file.name?.replace(/_/gi, " ")}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {file.createdAt
                      ? new Date(file.createdAt).toLocaleDateString(undefined, optionLocalDate)
                      : "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {file.isDirectory ? "—" : normaliseOctetSize(file.size || 0)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {!file.isDirectory && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAnchor({ el: e.currentTarget, file: { ...infos, ...file } });
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Menu
        open={!!menuAnchor}
        anchorEl={menuAnchor?.el}
        onClose={() => setMenuAnchor(null)}
        MenuListProps={{ dense: true }}
      >
        {menuAnchor &&
          actions.map((action, idx) =>
            action.options ? (
              <SubMenu
                key={idx}
                options={action.options}
                label={action.label}
                icon={action.icon}
                root={null}
                onClose={() => setMenuAnchor(null)}
                file={menuAnchor.file}
              />
            ) : (
              <MenuItem
                key={idx}
                disabled={action.disabled}
                onClick={() => {
                  setMenuAnchor(null);
                  action.onClick?.({
                    ...menuAnchor.file,
                    enqueueSnackbar,
                    closeSnackbar,
                    refresh,
                    user,
                    setIsRemoved: () => {},
                  });
                }}
              >
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText primary={action.label} />
              </MenuItem>
            )
          )}
      </Menu>
    </TableContainer>
  );
}
