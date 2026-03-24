import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import fileExtensionBase from "@/utils/fileExtensionBase";
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import optionLocalDate from "@/utils/optionLocalDate";
import actions from "@/views/main/displays/thumbnail/actions";
import SubMenu from "@/views/main/displays/thumbnail/SubMenu";
import EmptyState from "@/components/EmptyState";
import { useSnackbar } from "notistack";
import useAxios from "@/utils/useAxios";
import { FileItem, RootState } from "@/types";

interface ListViewProps {
  data?: FileItem[];
}

export default function ListView({ data }: ListViewProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const user = useSelector((store: RootState) => store.user);
  const [, refresh] = useAxios(null as any, { manual: true });
  const searchQuery = useSelector((store: RootState) => store.ui.searchQuery);

  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; file: any } | null>(null);

  const getCurrentPath = () => {
    const params = new URLSearchParams(search);
    const folder = params.get("folder") || "";
    const cat = ["images", "videos", "others"].find((c) => pathname.includes(c)) ?? "documents";
    return folder ? `${cat}/${folder}` : cat;
  };

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
    return <EmptyState />;
  }

  return (
    <TableContainer sx={{ flex: 1, overflow: "auto", width: "100%" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Nom</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 13, width: 150 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: 13, width: 100 }}>Taille</TableCell>
            <TableCell sx={{ width: 44 }} />
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
                sx={{ cursor: "pointer", "&:last-child td": { borderBottom: 0 } }}
                onClick={() => {
                  if (file.isDirectory && file.name) handleFolderClick(file.name);
                  else if (file.url) window.open(file.url, "_blank");
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    {file.isDirectory ? (
                      <FolderRoundedIcon sx={{ fontSize: 22 }} color="primary" />
                    ) : infos?.icon ? (
                      <Box component="img" src={infos.icon} sx={{ width: 20, height: 20 }} />
                    ) : (
                      <InsertDriveFileOutlinedIcon sx={{ fontSize: 20 }} color="action" />
                    )}
                    <Typography variant="body2" noWrap>
                      {file.name?.replace(/_/gi, " ")}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" fontSize={13}>
                    {file.createdAt
                      ? new Date(file.createdAt).toLocaleDateString("fr-FR", optionLocalDate)
                      : "\u2014"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" fontSize={13}>
                    {file.isDirectory ? "\u2014" : normaliseOctetSize(file.size || 0)}
                  </Typography>
                </TableCell>
                <TableCell padding="none">
                  {!file.isDirectory && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAnchor({ el: e.currentTarget, file: { ...infos, ...file, _currentPath: getCurrentPath() } });
                      }}
                    >
                      <MoreVertRoundedIcon fontSize="small" />
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
                file={{ ...menuAnchor.file, _dispatch: dispatch }}
              />
            ) : (
              <MenuItem
                key={idx}
                disabled={action.disabled}
                onClick={() => {
                  setMenuAnchor(null);
                  action.onClick?.({
                    ...menuAnchor.file,
                    _dispatch: dispatch,
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
