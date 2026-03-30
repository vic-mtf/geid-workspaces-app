/**
 * DocumentViewer — Affichage de PDF et documents Office (via conversion serveur).
 *
 * - PDF : fetch authentifie, blob URL dans un iframe.
 * - Office : fetch /api/stuff/workspace/preview/{filePath} (retourne un PDF converti).
 */

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import { RootState } from "@/types";

interface DocumentViewerProps {
  fileUrl: string;
  filename: string;
  extension: string;
}

const PDF_EXTS = ["pdf"];

function extractFilePath(fileUrl: string): string {
  const marker = "/api/stuff/workspace/file/";
  const idx = fileUrl.indexOf(marker);
  if (idx >= 0) return fileUrl.substring(idx + marker.length);
  if (fileUrl.startsWith(marker)) return fileUrl.substring(marker.length);
  return fileUrl;
}

const DocumentViewer = React.memo(function DocumentViewer({
  fileUrl,
  filename,
  extension,
}: DocumentViewerProps) {
  const { t } = useTranslation();
  const token = useSelector((store: RootState) => store.user.token);

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isPdf = PDF_EXTS.includes(extension.toLowerCase());

  useEffect(() => {
    if (!fileUrl || !token) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setBlobUrl(null);

    const fetchUrl = isPdf
      ? fileUrl
      : `/api/stuff/workspace/preview/${extractFilePath(fileUrl)}`;

    fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then((blob) => {
        if (!cancelled) {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [fileUrl, token, isPdf]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", gap: 2 }}>
        <CircularProgress sx={{ color: "common.white" }} />
        <Typography sx={{ color: "common.white" }}>
          {isPdf ? t("viewer.loading") : t("viewer.converting")}
        </Typography>
      </Box>
    );
  }

  if (error || !blobUrl) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <Typography sx={{ color: "common.white" }}>{t("viewer.noPreview")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box
        component="iframe"
        src={blobUrl}
        title={filename}
        sx={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: 1,
          bgcolor: "common.white",
        }}
      />
    </Box>
  );
});

export default DocumentViewer;
