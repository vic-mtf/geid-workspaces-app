import { Box, Grid } from "@mui/material";
import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import fileExtensionBase from "@/utils/fileExtensionBase";
import getFileExtension from "@/utils/getFileExtension";
import File from "@/views/main/displays/file/File";
import FolderItem from "@/views/main/displays/thumbnail/FolderItem";
import WrapperContent from "@/views/main/displays/thumbnail/WrapperContent";
import EmptyState from "@/components/EmptyState";
import { FileItem, RootState } from "@/types";

interface ThumbnailProps {
  data?: FileItem[];
}

export default function Thumbnail({ data: _data }: ThumbnailProps) {
  const searchQuery = useSelector((store: RootState) => store.ui.searchQuery);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const data = useMemo(
    () =>
      _data?.filter((item) => {
        if (!searchQuery?.trim()) return true;
        const words = searchQuery.split(/\s/).filter((w: string) => w?.trim());
        return words.some((word: string) => {
          const w = word.toLowerCase().trim();
          return w.length > 1 && (item?.name?.toLowerCase() ?? "").includes(w);
        });
      }) ?? [],
    [searchQuery, _data]
  );

  const handleFolderClick = useCallback(
    (folderName: string) => {
      const params = new URLSearchParams(search);
      const currentFolder = params.get("folder") || "";
      const newFolder = currentFolder ? `${currentFolder}/${folderName}` : folderName;
      navigate(`${pathname}?folder=${encodeURIComponent(newFolder)}`);
    },
    [search, pathname, navigate]
  );

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box overflow="auto" flex={1} p={1}>
      <Grid container spacing={0.5}>
        {data.map((file, index) => {
          if (file.isDirectory) {
            return (
              <Grid
                item
                xs={6} sm={4} md={3} lg={2} xl={12 / 7}
                key={`dir_${index}_${file.name}`}
              >
                <WrapperContent {...file} isDirectory onFolderClick={handleFolderClick}>
                  <Box display="flex" flex={1} justifyContent="center" alignItems="center">
                    <FolderItem name={file.name} />
                  </Box>
                </WrapperContent>
              </Grid>
            );
          }

          const infos = fileExtensionBase.find(({ exts }) =>
            ~exts.indexOf(getFileExtension(file.name) ?? "")
          );

          return (
            <Grid
              item
              xs={6} sm={4} md={3} lg={2} xl={12 / 7}
              key={`${index}_${file.name}`}
            >
              <WrapperContent {...infos} {...file}>
                <Box display="flex" flex={1} justifyContent="center" alignItems="center">
                  <File
                    {...infos}
                    name={file.name}
                    date={file.createdAt}
                    url={file.url}
                  />
                </Box>
              </WrapperContent>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
