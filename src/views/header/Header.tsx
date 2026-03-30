import {
  AppBar,
  Box as MuiBox,
  CardMedia,
  ClickAwayListener,
  Divider,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import SearchInput from "@/components/SearchInput";
import SearchResultsDropdown, { type SearchResult } from "@/components/SearchResultsDropdown";
import DeconnectDialog from "@/views/header/DeconnectDialog";
import MainOption from "@/views/header/main-options/MainOption";
import appConfig from "@/configs/app-config.json";
import geidLogo from "@/assets/geid_logo_white.png";
import { RootState } from "@/types";

/** Normalize accents for fuzzy matching */
function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function Header() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const user = useSelector((store: RootState) => store.user);
  const data = useSelector((store: RootState) => store.data);

  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [serverResults, setServerResults] = useState<SearchResult[]>([]);
  const [serverLoading, setServerLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dispatch the existing _search_data event for client-side filtering in Thumbnail/ListView
  const dispatchSearchEvent = useCallback((value: string) => {
    document.getElementById("root")?.dispatchEvent(
      new CustomEvent("_search_data", {
        detail: { value, name: "_search_data" },
      })
    );
  }, []);

  // Client-side search in current view data
  const clientResults = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (q.length < 2) return [];

    const normalizedQuery = normalize(q);
    const allFiles: SearchResult[] = (data as any)?.files || [];

    return allFiles.filter((file) => {
      const name = normalize(file.name || "");
      const nameNoUnderscore = normalize((file.name || "").replace(/_/g, " "));
      return name.includes(normalizedQuery) || nameNoUnderscore.includes(normalizedQuery);
    }).slice(0, 10);
  }, [query, data]);

  // Server-side search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setServerResults([]);
      setServerLoading(false);
      return;
    }

    setServerLoading(true);
    debounceRef.current = setTimeout(() => {
      const abortController = new AbortController();

      fetch(`/api/stuff/workspace/search?q=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        signal: abortController.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((results: SearchResult[]) => {
          setServerResults(results);
          setServerLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setServerResults([]);
            setServerLoading(false);
          }
        });

      return () => abortController.abort();
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, user?.token]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setQuery(value);
      dispatchSearchEvent(value);
      if (value.trim().length >= 2) {
        setDropdownOpen(true);
      } else {
        setDropdownOpen(false);
      }
    },
    [dispatchSearchEvent]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    dispatchSearchEvent("");
    setDropdownOpen(false);
    setServerResults([]);
  }, [dispatchSearchEvent]);

  const handleFocus = useCallback(() => {
    if (query.trim().length >= 2) {
      setDropdownOpen(true);
    }
  }, [query]);

  const handleSelect = useCallback(
    (file: SearchResult) => {
      setDropdownOpen(false);
      // Navigate to the file's location using the existing _go_to_location event
      document.getElementById("root")?.dispatchEvent(
        new CustomEvent("_go_to_location", {
          detail: {
            file: {
              ...file,
              currentPath: file.path || "",
            },
          },
        })
      );
      // Clear search after navigation
      setTimeout(() => {
        setQuery("");
        dispatchSearchEvent("");
      }, 100);
    },
    [dispatchSearchEvent]
  );

  const handleClickAway = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dropdownOpen) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen]);

  return (
    <React.Fragment>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t: any) => t.zIndex.drawer + 1,
          bgcolor: appConfig.colors.main,
        }}
      >
        <Toolbar variant="dense">
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              sx={{ mr: 1 }}
              onClick={() => {
                document
                  .getElementById("root")
                  ?.dispatchEvent(new CustomEvent("_toggle_nav_drawer"));
              }}
            >
              <MenuOutlinedIcon />
            </IconButton>
          )}
          <MuiBox
            display="flex"
            alignItems="center"
            gap={{ xs: 0.75, sm: 1 }}
            flexGrow={1}
          >
            <CardMedia
              component="img"
              src={geidLogo}
              draggable={false}
              sx={{ height: { xs: 24, sm: 28 }, width: "auto" }}
            />
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "#fff", borderRightWidth: 2, my: 0.5 }}
            />
            <Typography
              noWrap
              component="div"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: 700 }}
            >
              {t("header.personalSpace")}
            </Typography>
          </MuiBox>

          {/* Search with dropdown */}
          <ClickAwayListener onClickAway={handleClickAway}>
            <MuiBox sx={{ position: "relative" }}>
              <SearchInput
                ref={searchRef}
                value={query}
                onChange={handleChange}
                onFocus={handleFocus}
                onClear={handleClear}
                placeholder={t("search.placeholder")}
              />
              {dropdownOpen && query.trim().length >= 2 && (
                <SearchResultsDropdown
                  query={query}
                  clientResults={clientResults}
                  serverResults={serverResults}
                  serverLoading={serverLoading}
                  onSelect={handleSelect}
                  onClose={() => setDropdownOpen(false)}
                />
              )}
            </MuiBox>
          </ClickAwayListener>

          <MuiBox
            component="div"
            display="flex"
            justifyContent="right"
            sx={{ flexGrow: 1 }}
          >
            <MainOption />
          </MuiBox>
        </Toolbar>
      </AppBar>
      <DeconnectDialog />
    </React.Fragment>
  );
}
