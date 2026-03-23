import { Box } from "@mui/material";
import { useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { VirtuosoGrid } from "react-virtuoso";
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

const gridComponents = {
  List: ({ style, children, ...props }: any) => (
    <Box
      {...props}
      style={style}
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(5, 1fr)",
          xl: "repeat(7, 1fr)",
        },
        gap: 0.5,
        p: 1,
      }}
    >
      {children}
    </Box>
  ),
  Item: ({ children, ...props }: any) => (
    <Box {...props}>{children}</Box>
  ),
};

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
    <VirtuosoGrid
      style={{ height: "100%", width: "100%" }}
      totalCount={data.length}
      components={gridComponents}
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
          ~exts.indexOf(getFileExtension(file.name) ?? "")
        );

        return (
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
        );
      }}
    />
  );
}
