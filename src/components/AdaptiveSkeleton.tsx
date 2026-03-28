import React from "react";
import { Box, Skeleton } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

function AdaptiveSkeleton() {
  const display = useSelector((store: RootState) => (store.app as any).display ?? "thumbnail");
  if (display === "thumbnail" || !display) {
    return (
      <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
        <Box sx={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", p: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 0.5 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, p: 0.5 }}>
                <Skeleton variant="rounded" width={100} height={120} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" width={80} height={14} />
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
      <Box sx={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", px: 0.5 }}>
        <Box display="flex" alignItems="center" px={1} sx={{ height: rowHeight, borderBottom: 1, borderColor: "divider" }}>
          <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1.5 }} />
          <Skeleton variant="text" width={200} height={16} />
          <Box flex={1} />
          <Skeleton variant="text" width={100} height={14} />
        </Box>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} display="flex" alignItems="center" px={1} sx={{ height: rowHeight, borderBottom: 1, borderColor: "divider" }}>
            <Skeleton variant="circular" width={18} height={18} sx={{ mr: 1, flexShrink: 0 }} />
            <Skeleton variant="rounded" width={22} height={22} sx={{ mr: 1, flexShrink: 0 }} />
            <Skeleton variant="text" width={`${40 + Math.random() * 30}%`} height={14} sx={{ flex: 1 }} />
            <Skeleton variant="text" width={90} height={12} sx={{ ml: 1 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default React.memo(AdaptiveSkeleton);
