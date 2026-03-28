import React from "react";
import { Breadcrumbs, Link, Typography, Box as MuiBox } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useNavigate, useLocation } from "react-router-dom";

interface FolderBreadcrumbProps {
  categoryLabel: string;
}

function FolderBreadcrumb({ categoryLabel }: FolderBreadcrumbProps) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const folder = params.get("folder") || "";
  const parts = folder ? folder.split("/").filter(Boolean) : [];

  const goToIndex = (index: number) => {
    if (index < 0) {
      // root of category
      navigate(pathname);
    } else {
      const newFolder = parts.slice(0, index + 1).join("/");
      navigate(`${pathname}?folder=${encodeURIComponent(newFolder)}`);
    }
  };

  return (
    <MuiBox px={2} py={0.5}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ fontSize: 13, color: "text.secondary" }}
      >
        {parts.length > 0 ? (
          <Link
            underline="hover"
            color="inherit"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", fontSize: 13 }}
            onClick={() => goToIndex(-1)}
          >
            <HomeOutlinedIcon sx={{ fontSize: 15 }} />
            {categoryLabel}
          </Link>
        ) : (
          <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 13, fontWeight: 600 }} color="text.primary">
            <HomeOutlinedIcon sx={{ fontSize: 15 }} />
            {categoryLabel}
          </Typography>
        )}
        {parts.map((part, i) => {
          const isLast = i === parts.length - 1;
          return isLast ? (
            <Typography key={i} color="text.primary" sx={{ fontSize: 13, fontWeight: 600 }}>
              {part}
            </Typography>
          ) : (
            <Link
              key={i}
              underline="hover"
              color="inherit"
              sx={{ cursor: "pointer", fontSize: 13 }}
              onClick={() => goToIndex(i)}
            >
              {part}
            </Link>
          );
        })}
      </Breadcrumbs>
    </MuiBox>
  );
}

export default React.memo(FolderBreadcrumb);
