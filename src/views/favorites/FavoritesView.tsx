import { Box, Typography, CircularProgress, Toolbar, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import workspaceApi from "@/services/workspaceApi";
import ListView from "@/views/main/displays/list/ListView";
import Thumbnail from "@/views/main/displays/thumbnail/Thumbnail";
import MainLayout from "@/components/Main";
import EmptyState from "@/components/EmptyState";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import { RootState } from "@/types";

export default function FavoritesView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const viewMode = useSelector((store: RootState) => store.workspace.viewMode);

  useEffect(() => {
    workspaceApi.getFavorites()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <Toolbar variant="dense" />
      <Box px={2} py={1.5}>
        <Typography variant="h6" fontSize={16} fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <StarOutlinedIcon fontSize="small" color="warning" /> Favoris
        </Typography>
      </Box>
      <Divider />
      <Box overflow="auto" display="flex" flex={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <CircularProgress size={28} />
          </Box>
        ) : data.length === 0 ? (
          <EmptyState
            icon={<StarOutlinedIcon sx={{ fontSize: 56 }} color="disabled" />}
            message="Aucun fichier en favori"
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
