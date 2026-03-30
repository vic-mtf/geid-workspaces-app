/**
 * SearchResultsDropdown — Dropdown affichant les resultats de recherche
 * client-side (vue courante) et server-side (tous les fichiers).
 */

import React, { useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useTranslation } from "react-i18next";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";
import { FileItem } from "@/types";

interface SearchResult extends FileItem {
  isTrashed?: boolean;
  color?: string;
}

interface SearchResultsDropdownProps {
  query: string;
  clientResults: SearchResult[];
  serverResults: SearchResult[];
  serverLoading: boolean;
  onSelect: (file: SearchResult) => void;
  onClose: () => void;
}

/** Normalize accents for comparison */
function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Highlight matching parts in a name */
const HighlightedName = React.memo(function HighlightedName({
  name,
  query,
}: {
  name: string;
  query: string;
}) {
  const theme = useTheme();
  if (!query.trim()) return <>{name}</>;

  const normalizedName = normalize(name);
  const normalizedQuery = normalize(query.trim());
  const idx = normalizedName.indexOf(normalizedQuery);

  if (idx === -1) return <>{name}</>;

  const before = name.slice(0, idx);
  const match = name.slice(idx, idx + normalizedQuery.length);
  const after = name.slice(idx + normalizedQuery.length);

  return (
    <>
      {before}
      <Box
        component="span"
        sx={{
          bgcolor: alpha(theme.palette.warning.main, 0.3),
          borderRadius: 0.5,
          px: 0.25,
        }}
      >
        {match}
      </Box>
      {after}
    </>
  );
});

const ResultItem = React.memo(function ResultItem({
  file,
  query,
  onSelect,
}: {
  file: SearchResult;
  query: string;
  onSelect: (file: SearchResult) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const ext = file.isDirectory ? null : getFileExtension(file.name || "");
  const displayPath = file.path || "/";

  return (
    <Box
      onClick={() => onSelect(file)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1,
        cursor: "pointer",
        "&:hover": {
          bgcolor: "action.hover",
        },
        transition: "background-color 0.15s",
      }}
    >
      {/* Icon */}
      <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
        {file.isDirectory ? (
          <FolderRoundedIcon
            sx={{
              fontSize: 28,
              color: file.color || "primary.main",
            }}
          />
        ) : (
          <FileTypeIcon extension={ext || "txt"} size={28} />
        )}
      </Box>

      {/* Name + path */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: 500, color: "text.primary" }}
        >
          <HighlightedName name={file.name || ""} query={query} />
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{ color: "text.secondary", display: "block" }}
        >
          {displayPath}
        </Typography>
      </Box>

      {/* Badges */}
      <Box sx={{ flexShrink: 0, display: "flex", gap: 0.5 }}>
        {file.isTrashed && (
          <Chip
            icon={<DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />}
            label={t("search.trash")}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: "error.main",
              "& .MuiChip-icon": { color: "error.main" },
            }}
          />
        )}
        <Chip
          label={file.isDirectory ? t("search.folder") : (ext?.toUpperCase() || t("search.file"))}
          size="small"
          sx={{
            height: 22,
            fontSize: "0.7rem",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
          }}
        />
      </Box>
    </Box>
  );
});

const SectionHeader = React.memo(function SectionHeader({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 0.75,
        bgcolor: "action.hover",
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        {label} ({count})
      </Typography>
    </Box>
  );
});

const SearchResultsDropdown = React.memo(function SearchResultsDropdown({
  query,
  clientResults,
  serverResults,
  serverLoading,
  onSelect,
  onClose,
}: SearchResultsDropdownProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Deduplicate server results by removing items already in client results
  const clientIds = useMemo(
    () => new Set(clientResults.map((f) => f._id).filter(Boolean)),
    [clientResults]
  );
  const filteredServerResults = useMemo(
    () => serverResults.filter((f) => !clientIds.has(f._id)),
    [serverResults, clientIds]
  );

  const hasResults = clientResults.length > 0 || filteredServerResults.length > 0;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        mt: 0.5,
        maxHeight: 420,
        overflowY: "auto",
        bgcolor: alpha(theme.palette.background.paper, 0.92),
        backdropFilter: "blur(16px)",
        borderRadius: 2,
        boxShadow: theme.shadows[8],
        border: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.modal,
      }}
    >
      {/* Client results */}
      {clientResults.length > 0 && (
        <>
          <SectionHeader label={t("search.inThisView")} count={clientResults.length} />
          {clientResults.slice(0, 10).map((file, idx) => (
            <ResultItem
              key={file._id || `client-${idx}`}
              file={file}
              query={query}
              onSelect={onSelect}
            />
          ))}
        </>
      )}

      {/* Server results */}
      {(filteredServerResults.length > 0 || serverLoading) && (
        <>
          <SectionHeader
            label={t("search.allFiles")}
            count={filteredServerResults.length}
          />
          {serverLoading && filteredServerResults.length === 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t("search.searching")}
              </Typography>
            </Box>
          )}
          {filteredServerResults.slice(0, 20).map((file, idx) => (
            <ResultItem
              key={file._id || `server-${idx}`}
              file={file}
              query={query}
              onSelect={onSelect}
            />
          ))}
        </>
      )}

      {/* No results */}
      {!hasResults && !serverLoading && (
        <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {t("search.noResults")}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {t("search.noResultsHint")}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

export default SearchResultsDropdown;
export type { SearchResult };
