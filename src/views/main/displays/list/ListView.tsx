/**
 * ListView — Affichage en liste des fichiers workspace.
 *
 * Utilise les icônes SVG de file-icon-vectors pour chaque extension.
 * Miniature thumbnail pour les images en mode liste.
 */

import {
  Avatar,
  Box,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Virtuoso } from "react-virtuoso";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import getFileExtension from "@/utils/getFileExtension";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import optionLocalDate from "@/utils/optionLocalDate";
import fileExtensionBase from "@/utils/fileExtensionBase";
import WrapperContent from "@/views/main/displays/thumbnail/WrapperContent";
import { FileItem, RootState } from "@/types";

interface ListViewProps {
  data?: FileItem[];
  loading?: boolean;
}

// Miniature en mode liste pour les images
const ListThumbnail = React.memo(function ListThumbnail({ url }: { url?: string }) {
  const token = useSelector((store: RootState) => store.user.token);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let revoked = false;
    const thumbUrl = url.replace("/file/", "/thumbnail/");
    fetch(thumbUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok && r.status !== 204 ? r.blob() : null))
      .then((b) => { if (b && !revoked) setSrc(URL.createObjectURL(b)); })
      .catch(() => {});
    return () => { revoked = true; };
  }, [url, token]);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  if (!src) return null;
  return (
    <Avatar
      variant="rounded"
      src={src}
      sx={{ width: 28, height: 28, mr: -0.5 }}
    />
  );
});

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
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: 1, mb: 0.5 }} />
        ))}
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} height="100%" py={6} gap={1}>
        <InboxOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />
        <Typography color="text.secondary" fontWeight="bold">{t("files.emptySpace")}</Typography>
        <Typography variant="body2" color="text.disabled">{t("files.emptySpaceHint")}</Typography>
      </Box>
    );
  }

  const blankIcon = useMemo(() => new URL("../../../../../node_modules/file-icon-vectors/dist/icons/vivid/blank.svg", import.meta.url).href, []);

  const renderRow = useCallback((index: number) => {
    const file = data![index];
    if (!file) return null;
    const date = file.createdAt ? new Date(file.createdAt).toLocaleDateString("fr-FR", optionLocalDate) : "\u2014";
    const sizeStr = file.isDirectory || !file.size ? "\u2014" : normaliseOctetSize(file.size);
    const ext = getFileExtension(file.name ?? "")?.toLowerCase() ?? "";
    const infos = file.isDirectory ? undefined : fileExtensionBase.find(({ exts }) => exts.includes(ext));
    const isImage = infos?.type === "image";

    return (
      <WrapperContent
        {...(infos || {})}
        {...file}
        isDirectory={file.isDirectory}
        onFolderClick={handleFolderClick}
      >
        <Box
          display="flex" alignItems="center" width="100%" px={1} py={0.5}
          sx={{ borderRadius: 1, "&:hover": { bgcolor: "action.hover" }, bgcolor: index % 2 === 0 ? "transparent" : "action.hover" }}
        >
          <Box width={36} height={28} flexShrink={0} display="flex" alignItems="center" justifyContent="center">
            {file.isDirectory ? (
              <FolderRoundedIcon color="warning" fontSize="small" />
            ) : isImage ? (
              <ListThumbnail url={file.url} />
            ) : infos?.icon ? (
              <Box component="img" src={infos.icon} sx={{ width: 22, height: 22 }} />
            ) : (
              <Box component="img" src={blankIcon} sx={{ width: 22, height: 22, opacity: 0.6 }} />
            )}
          </Box>
          <Box flex={1} minWidth={0} pl={0.5}>
            <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 150, sm: 250, md: 400, lg: 500 } }}>
              {(file.name ?? "").replace(/_/g, " ")}
            </Typography>
          </Box>
          <Box width={160} flexShrink={0} display={{ xs: "none", sm: "block" }}>
            <Typography variant="caption" color="text.secondary" noWrap>{date}</Typography>
          </Box>
          {!isSmall && (
            <Box width={90} flexShrink={0}>
              <Typography variant="caption" color="text.secondary">{sizeStr}</Typography>
            </Box>
          )}
        </Box>
      </WrapperContent>
    );
  }, [data, handleFolderClick, isSmall, blankIcon]);

  return (
    <Box sx={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column", px: 0.5 }}>
      {/* Header sticky */}
      <Box
        display="flex" alignItems="center" px={2} py={0.75}
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        <Box width={36} flexShrink={0} />
        <Box flex={1} minWidth={0}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">{t("list.name")}</Typography>
        </Box>
        <Box width={160} flexShrink={0} display={{ xs: "none", sm: "block" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">{t("list.modifiedDate")}</Typography>
        </Box>
        {!isSmall && (
          <Box width={90} flexShrink={0}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">{t("list.size")}</Typography>
          </Box>
        )}
      </Box>

      {/* Liste virtualisée */}
      <Virtuoso
        totalCount={data!.length}
        itemContent={renderRow}
        overscan={300}
        style={{ flex: 1 }}
      />
    </Box>
  );
}
