import React from "react";
import { Box, Skeleton } from "@mui/material";
import scrollBarSx from "@/utils/scrollBarSx";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

const GRID_COLS = "repeat(auto-fill, minmax(160px, 1fr))";

function AdaptiveSkeleton() {
  const display = useSelector((store: RootState) => (store.app as any).display ?? "thumbnail");

  if (display === "thumbnail" || !display) {
    return (
      <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Box sx={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", p: 1, ...scrollBarSx }}>
          <Box sx={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 0.5 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, p: 1 }}>
                <Skeleton variant="rounded" width={100} height={120} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="text" width={50} height={10} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  const rowHeight = display === "compact" ? 32 : 42;

  return (
    <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
      <Box sx={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", px: 0.5, ...scrollBarSx }}>
        <Box display="flex" alignItems="center" px={1} sx={{ height: rowHeight, borderBottom: 1, borderColor: "divider" }}>
          <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1.5 }} />
          <Skeleton variant="text" width={60} height={14} sx={{ flex: 0 }} />
          <Box flex={1} />
          <Skeleton variant="text" width={100} height={12} sx={{ display: { xs: "none", sm: "block" } }} />
          <Skeleton variant="text" width={60} height={12} sx={{ ml: 2, display: { xs: "none", md: "block" } }} />
        </Box>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} display="flex" alignItems="center" px={1} sx={{ height: rowHeight, borderBottom: 1, borderColor: "divider" }}>
            <Skeleton variant="circular" width={18} height={18} sx={{ mr: 1, flexShrink: 0 }} />
            <Skeleton variant="rounded" width={28} height={28} sx={{ mr: 1, borderRadius: 0.5, flexShrink: 0 }} />
            <Skeleton variant="text" width={`${30 + Math.random() * 40}%`} height={14} />
            <Box flex={1} />
            <Skeleton variant="text" width={90} height={12} sx={{ display: { xs: "none", sm: "block" } }} />
            <Skeleton variant="text" width={50} height={12} sx={{ ml: 2, display: { xs: "none", md: "block" } }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default React.memo(AdaptiveSkeleton);
