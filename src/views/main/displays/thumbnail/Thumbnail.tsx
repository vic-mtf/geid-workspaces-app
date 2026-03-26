/**
 * Thumbnail — Vue vignette avec virtualisation (react-virtuoso).
 *
 * Grille responsive virtualisée — seules les lignes visibles sont rendues.
 */

import { Box, Skeleton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { VirtuosoGrid } from "react-virtuoso";
import fileExtensionBase from "@/utils/fileExtensionBase";
import getFileExtension from "@/utils/getFileExtension";
import File from "@/views/main/displays/file/File";
import FolderItem from "@/views/main/displays/thumbnail/FolderItem";
import WrapperContent from "@/views/main/displays/thumbnail/WrapperContent";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { FileItem } from "@/types";

interface ThumbnailProps {
  data?: FileItem[];
  loading?: boolean;
}

export default function Thumbnail({ data: _data, loading }: ThumbnailProps) {
  const { t } = useTranslation();
  const [findName, setFindName] = useState("");
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const theme = useTheme();

  // Colonnes responsive
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.between("lg", "xl"));
  const cols = isXs ? 3 : isSm ? 4 : isMd ? 5 : isLg ? 6 : 8;

  const data = useMemo(
    () =>
      _data?.filter((item) => {
        if (findName?.trim() === "") return true;
        const words = findName.split(/\s/).filter((w: string) => w?.trim());
        return words.some((word: string) => {
          const _word = word.toLowerCase().trim();
          return (
            (_word.length > 2 && (item?.name?.toLowerCase() ?? "").includes(_word)) ||
            (item?.name?.replace(/_/gi, " ").toLowerCase() ?? "").includes(findName?.toLowerCase()?.trim() ?? "")
          );
        });
      }) ?? [],
    [findName, _data]
  );

  useEffect(() => {
    const handleSearch = (event: any) => setFindName(event.detail?.value ?? "");
    const root = document.getElementById("root");
    root?.addEventListener("_search_data", handleSearch);
    return () => root?.removeEventListener("_search_data", handleSearch);
  });

  const handleFolderClick = useCallback((folderName: string) => {
    const params = new URLSearchParams(search);
    const currentFolder = params.get("folder") || "";
    const newFolder = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    navigate(`${pathname}?folder=${encodeURIComponent(newFolder)}`);
  }, [search, pathname, navigate]);

  if (loading) {
    return (
      <Box p={1} display="flex" flexWrap="wrap" gap={1}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={`calc(${100 / cols}% - 8px)`} height={140} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} height="100%" py={6} gap={1}>
        <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
        <Typography color="text.secondary" fontWeight="bold">{t("files.emptySpace")}</Typography>
        <Typography variant="body2" color="text.disabled">{t("files.emptySpaceHint")}</Typography>
      </Box>
    );
  }

  return (
    <VirtuosoGrid
      totalCount={data.length}
      overscan={200}
      listClassName="virtuoso-grid-list"
      itemClassName="virtuoso-grid-item"
      style={{ height: "calc(100vh - 140px)" }}
      components={{
        List: ListContainer as any,
        Item: ({ children, ...props }: any) => (
          <Box {...props} sx={{ width: `${100 / cols}%`, p: 0.5, boxSizing: "border-box" }}>
            {children}
          </Box>
        ),
      }}
      itemContent={(index) => {
        const file = data[index];
        if (!file) return null;

        if (file.isDirectory) {
          return (
            <WrapperContent {...file} isDirectory onFolderClick={handleFolderClick}>
              <Box display="flex" flex={1} justifyContent="center" alignItems="center">
                <FolderItem name={file.name} />
              </Box>
            </WrapperContent>
          );
        }

        const infos = fileExtensionBase.find(({ exts }) =>
          exts.includes(getFileExtension(file.name ?? "") ?? "")
        );

        return (
          <WrapperContent {...infos} {...file}>
            <Box display="flex" flex={1} justifyContent="center" alignItems="center">
              <File {...infos} name={file.name} date={file.createdAt} url={file.url} />
            </Box>
          </WrapperContent>
        );
      }}
    />
  );
}

// Container pour la grille virtualisée
import React from "react";
const ListContainer = React.forwardRef<HTMLDivElement>((props, ref) => (
  <Box ref={ref} {...props} sx={{ display: "flex", flexWrap: "wrap", p: 0.5 }} />
));
ListContainer.displayName = "ListContainer";
