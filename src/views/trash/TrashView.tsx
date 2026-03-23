import { Box, Typography, CircularProgress, Button, Stack, Toolbar, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import workspaceApi from "@/services/workspaceApi";
import ListView from "@/views/main/displays/list/ListView";
import Thumbnail from "@/views/main/displays/thumbnail/Thumbnail";
import MainLayout from "@/components/Main";
import EmptyState from "@/components/EmptyState";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import { RootState } from "@/types";

export default function TrashView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const viewMode = useSelector((store: RootState) => store.workspace.viewMode);
  const { enqueueSnackbar } = useSnackbar();

  const loadTrash = () => {
    setLoading(true);
    workspaceApi.getTrash()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTrash(); }, []);

  const handleEmptyTrash = () => {
    workspaceApi.emptyTrash()
      .then((res) => {
        enqueueSnackbar(
          <Typography>Corbeille vidée ({res.data.count} éléments supprimés)</Typography>,
          { variant: "success" }
        );
        setData([]);
      })
      .catch(() => {
        enqueueSnackbar(
          <Typography>Impossible de vider la corbeille</Typography>,
          { variant: "error" }
        );
      });
  };

  return (
    <MainLayout>
      <Toolbar variant="dense" />
      <Box px={2} py={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontSize={16} fontWeight="bold" display="flex" alignItems="center" gap={1}>
            <DeleteOutlineRoundedIcon fontSize="small" color="error" /> Corbeille
          </Typography>
          {data.length > 0 && (
            <Button
              color="error"
              variant="outlined"
              size="small"
              startIcon={<DeleteForeverOutlinedIcon />}
              onClick={handleEmptyTrash}
            >
              Vider la corbeille
            </Button>
          )}
        </Stack>
        {data.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Les éléments de la corbeille seront supprimés définitivement après 30 jours
          </Typography>
        )}
      </Box>
      <Divider />
      <Box overflow="auto" display="flex" flex={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <CircularProgress size={28} />
          </Box>
        ) : data.length === 0 ? (
          <EmptyState
            icon={<DeleteOutlineRoundedIcon sx={{ fontSize: 56 }} color="disabled" />}
            message="La corbeille est vide"
          />
        ) : viewMode === "list" ? (
          <ListView data={data} />
        ) : (
          <Thumbnail data={data} />
        )}
      </Box>
    </MainLayout>
  );
}
