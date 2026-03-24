import { Box, Grid, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import fileExtensionBase from "@/utils/fileExtensionBase";
import getFileExtension from "@/utils/getFileExtension";
import File from "@/views/main/displays/file/File";
import FolderItem from "@/views/main/displays/thumbnail/FolderItem";
import WrapperContent from "@/views/main/displays/thumbnail/WrapperContent";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { FileItem } from "@/types";

interface ThumbnailProps {
  data?: FileItem[];
}

export default function Thumbnail({ data: _data }: ThumbnailProps) {
  const [findName, setFindName] = useState("");
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const data = useMemo(
    () =>
      _data?.filter((item) => {
        if (findName?.trim() === "") return true;
        const worlds = findName.split(/\s/).filter((word: string) => word?.trim());
        let found = false;
        worlds.forEach((word: string) => {
          const _word = word.toLowerCase().trim();
          if (
            (_word.length > 2 &&
              ~(item?.name?.toLowerCase() ?? "").indexOf(_word)) ||
            ~(item?.name?.replace(/_/gi, " ").toLowerCase() ?? "").indexOf(
              findName?.toLowerCase()?.trim() ?? ""
            )
          )
            found = true;
        });
        return found;
      }),
    [findName, _data]
  );

  useEffect(() => {
    const handleSearch = (event: any) => {
      const { value } = event.detail || { value: "" };
      setFindName(value);
    };
    document.getElementById("root")?.addEventListener("_search_data", handleSearch);
    return () =>
      document.getElementById("root")?.removeEventListener("_search_data", handleSearch);
  });

  const handleFolderClick = (folderName: string) => {
    const params = new URLSearchParams(search);
    const currentFolder = params.get("folder") || "";
    const newFolder = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    navigate(`${pathname}?folder=${encodeURIComponent(newFolder)}`);
  };

  return (
    <Box overflow="auto" p={1} height="85vh">
      {data?.length === 0 ? (
        <Typography
          align="center"
          color="text.secondary"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          variant="body1"
          fontWeight="bold"
        >
          <InboxOutlinedIcon fontSize="large" /> Aucun élément
        </Typography>
      ) : (
        <Grid component="div" container>
          {data?.map((file, index) => {
            if (file.isDirectory) {
              return (
                <Grid
                  component="div"
                  item
                  md={12 / 5}
                  lg={12 / 6}
                  xl={12 / 8}
                  key={`dir_${index}_${file.name}`}
                >
                  <WrapperContent {...file} isDirectory onFolderClick={handleFolderClick}>
                    <Box
                      display="flex"
                      flex={1}
                      justifyContent="center"
                      alignItems="center"
                    >
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
                component="div"
                item
                md={12 / 5}
                lg={12 / 6}
                xl={12 / 8}
                key={`${index}_${file.name}`}
              >
                <WrapperContent {...infos} {...file}>
                  <Box
                    display="flex"
                    flex={1}
                    justifyContent="center"
                    alignItems="center"
                  >
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
      )}
    </Box>
  );
}
