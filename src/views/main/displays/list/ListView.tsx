import {
  Box,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import VideoFileOutlinedIcon from "@mui/icons-material/VideoFileOutlined";
import AudioFileOutlinedIcon from "@mui/icons-material/AudioFileOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import optionLocalDate from "@/utils/optionLocalDate";
import fileExtensionBase from "@/utils/fileExtensionBase";
import WrapperContent from "@/views/main/displays/thumbnail/WrapperContent";
import { FileItem } from "@/types";

interface ListViewProps {
  data?: FileItem[];
  loading?: boolean;
}

function getFileIcon(name: string) {
  const ext = getFileExtension(name)?.toLowerCase() ?? "";
  if (ext === "pdf") return <PictureAsPdfOutlinedIcon color="error" fontSize="small" />;
  const info = fileExtensionBase.find(({ exts }) => exts.includes(ext));
  if (info?.type === "image") return <ImageOutlinedIcon color="primary" fontSize="small" />;
  if (info?.type === "video") return <VideoFileOutlinedIcon color="secondary" fontSize="small" />;
  if (info?.type === "audio") return <AudioFileOutlinedIcon color="warning" fontSize="small" />;
  return <InsertDriveFileOutlinedIcon fontSize="small" sx={{ opacity: 0.7 }} />;
}

export default function ListView({ data: _data, loading }: ListViewProps) {
  const { t } = useTranslation();
  const [findName, setFindName] = useState("");
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const data = useMemo(
    () =>
      _data?.filter((item) => {
        if (findName?.trim() === "") return true;
        const words = findName.split(/\s/).filter((w: string) => w?.trim());
        let found = false;
        words.forEach((word: string) => {
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
    const root = document.getElementById("root");
    root?.addEventListener("_search_data", handleSearch);
    return () => root?.removeEventListener("_search_data", handleSearch);
  });

  const handleFolderClick = (folderName: string) => {
    const params = new URLSearchParams(search);
    const currentFolder = params.get("folder") || "";
    const newFolder = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    navigate(`${pathname}?folder=${encodeURIComponent(newFolder)}`);
  };

  if (loading) {
    return (
      <Box sx={{ height: "85vh", overflow: "auto", px: 2, pt: 1 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2, mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="85vh"
        gap={1}
      >
        <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
        <Typography color="text.secondary" fontWeight="bold">
          {t("files.emptySpace")}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          {t("files.emptySpaceHint")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "85vh", overflow: "auto", px: 0.5 }}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        px={2}
        py={1}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box flex={1} minWidth={0}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            {t("list.name")}
          </Typography>
        </Box>
        <Box width={180} flexShrink={0} display={{ xs: "none", sm: "block" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            {t("list.modifiedDate")}
          </Typography>
        </Box>
        {!isSmall && (
          <Box width={100} flexShrink={0}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {t("list.size")}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Rows */}
      {data.map((file, index) => {
        const date = file.createdAt
          ? new Date(file.createdAt).toLocaleDateString("fr-FR", optionLocalDate)
          : "\u2014";
        const size =
          file.isDirectory || !file.size
            ? "\u2014"
            : normaliseOctetSize(file.size);

        const infos = file.isDirectory
          ? undefined
          : fileExtensionBase.find(({ exts }) =>
              exts.includes(getFileExtension(file.name ?? "") ?? "")
            );

        return (
          <WrapperContent
            key={`${index}_${file.name}`}
            {...(infos || {})}
            {...file}
            isDirectory={file.isDirectory}
            onFolderClick={handleFolderClick}
          >
            <Box
              display="flex"
              alignItems="center"
              width="100%"
              sx={{
                bgcolor: index % 2 === 0 ? "transparent" : "action.hover",
                py: 0.25,
              }}
            >
              <Box flex={1} minWidth={0} display="flex" alignItems="center" gap={1}>
                {file.isDirectory ? (
                  <FolderRoundedIcon color="warning" fontSize="small" />
                ) : (
                  getFileIcon(file.name ?? "")
                )}
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ maxWidth: { xs: 150, sm: 250, md: 400, lg: 500 } }}
                >
                  {(file.name ?? "").replace(/_/g, " ")}
                </Typography>
              </Box>
              <Box
                width={180}
                flexShrink={0}
                display={{ xs: "none", sm: "block" }}
              >
                <Typography variant="body2" color="text.secondary" noWrap>
                  {date}
                </Typography>
              </Box>
              {!isSmall && (
                <Box width={100} flexShrink={0}>
                  <Typography variant="body2" color="text.secondary">
                    {size}
                  </Typography>
                </Box>
              )}
            </Box>
          </WrapperContent>
        );
      })}
    </Box>
  );
}
