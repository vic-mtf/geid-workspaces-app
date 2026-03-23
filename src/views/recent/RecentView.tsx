import { Box, Typography, CircularProgress, Toolbar } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import workspaceApi from "@/services/workspaceApi";
import ListView from "@/views/main/displays/list/ListView";
import Thumbnail from "@/views/main/displays/thumbnail/Thumbnail";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { RootState } from "@/types";

export default function RecentView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const viewMode = useSelector((store: RootState) => store.workspace.viewMode);

  useEffect(() => {
    workspaceApi.getRecent(50)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box component="main" sx={{ flexGrow: 1, px: 0.5, width: "100%" }}>
      <Toolbar variant="dense" />
      <Box px={2} py={1}>
        <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <AccessTimeOutlinedIcon color="primary" /> Fichiers récents
        </Typography>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : viewMode === "list" ? (
        <ListView data={data} />
      ) : (
        <Thumbnail data={data} />
      )}
    </Box>
  );
}
