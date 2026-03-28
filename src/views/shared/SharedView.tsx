import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Avatar, Box, Breadcrumbs, Chip, CircularProgress, IconButton, Link,
  Skeleton, Stack, Tab, Tabs, Tooltip, Typography,
} from "@mui/material";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import Thumbnail from "@/views/main/displays/thumbnail/Thumbnail";
import ListView from "@/views/main/displays/list/ListView";
import AdaptiveSkeleton from "@/components/AdaptiveSkeleton";
import UpdateToast from "@/components/UpdateToast";
import avatarColor from "@/utils/avatarColor";
import { RootState, FileItem } from "@/types";

export default function SharedView() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const token = useSelector((store: RootState) => store.user.token);
  const display = useSelector((store: RootState) => (store.app as any).display ?? "thumbnail");
  const sort = useSelector((store: RootState) => (store.app as any).sort ?? "name");
  const order = useSelector((store: RootState) => (store.app as any).order ?? "ascending");

  const [tab, setTab] = useState(0);
  const [received, setReceived] = useState<FileItem[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hasNewData, setHasNewData] = useState(false);
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);
  const [folderData, setFolderData] = useState<FileItem[] | null>(null);
  const [folderLoading, setFolderLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const toggleSelect = useCallback((n: string) => { setSelectedFiles((p) => { const s = new Set(p); s.has(n) ? s.delete(n) : s.add(n); return s; }); }, []);
  const clearSelection = useCallback(() => setSelectedFiles(new Set()), []);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }), [token]);
  const apiFetch = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, { headers, ...options });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  }, [headers]);

  const loadReceived = useCallback(async () => { try { setReceived(await apiFetch("/api/stuff/workspace/shared")); } catch { setReceived([]); } }, [apiFetch]);
  const loadInvitations = useCallback(async () => { try { setInvitations(await apiFetch("/api/stuff/workspace/share/invitations")); } catch { setInvitations([]); } }, [apiFetch]);
  const loadSent = useCallback(async () => { try { setSent(await apiFetch("/api/stuff/workspace/share/sent")); } catch { setSent([]); } }, [apiFetch]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadReceived(), loadInvitations(), loadSent()]);
    setLoading(false);
  }, [loadReceived, loadInvitations, loadSent]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    const root = document.getElementById("root");
    const handler = () => { loadAll(); if (folderStack.length > 0) browseFolder(folderStack[folderStack.length - 1].id); };
    root?.addEventListener("_reload_current_dir", handler);
    root?.addEventListener("_reload_shared", handler);
    return () => { root?.removeEventListener("_reload_current_dir", handler); root?.removeEventListener("_reload_shared", handler); };
  }, [loadAll, folderStack]);

  const browseFolder = useCallback(async (folderId: string) => {
    setFolderLoading(true);
    try { setFolderData(await apiFetch(`/api/stuff/workspace/shared/folder/${folderId}`)); } catch { setFolderData([]); }
    finally { setFolderLoading(false); }
  }, [apiFetch]);

  const handleFolderClick = useCallback((folderName: string) => {
    const source = folderStack.length > 0 ? folderData : received;
    const folder = (source || []).find((f: any) => f.name === folderName && f.isDirectory);
    if (!folder?._id) return;
    setFolderStack((prev) => [...prev, { id: folder._id, name: folderName }]);
    clearSelection();
    browseFolder(folder._id);
  }, [folderData, received, folderStack, browseFolder, clearSelection]);

  const handleBreadcrumb = useCallback((index: number) => {
    if (index < 0) { setFolderStack([]); setFolderData(null); }
    else { const s = folderStack.slice(0, index + 1); setFolderStack(s); browseFolder(s[s.length - 1].id); }
    clearSelection();
  }, [folderStack, browseFolder, clearSelection]);

  const handleAccept = useCallback(async (id: string) => {
    setActionLoading(id);
    try { await apiFetch(`/api/stuff/workspace/share/accept/${id}`, { method: "PATCH" }); enqueueSnackbar(t("shared.invitationAccepted") || "Invitation acceptee", { variant: "success" }); await loadAll(); }
    catch { enqueueSnackbar(t("shared.invitationError") || "Erreur", { variant: "error" }); }
    finally { setActionLoading(null); }
  }, [apiFetch, enqueueSnackbar, t, loadAll]);

  const handleReject = useCallback(async (id: string) => {
    setActionLoading(id);
    try { await apiFetch(`/api/stuff/workspace/share/reject/${id}`, { method: "PATCH" }); enqueueSnackbar(t("shared.invitationRejected") || "Invitation refusee", { variant: "info" }); await loadAll(); }
    catch { enqueueSnackbar(t("shared.invitationError") || "Erreur", { variant: "error" }); }
    finally { setActionLoading(null); }
  }, [apiFetch, enqueueSnackbar, t, loadAll]);

  const currentData = folderStack.length > 0 ? (folderData || []) : received;
  const sortedData = useMemo(() => {
    let s = [...currentData];
    if (!sort || sort === "name") s.sort((a, b) => { if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1; return (a.name || "").localeCompare(b.name || ""); });
    else if (sort === "date") s.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    if (order === "descending") s.reverse();
    return s;
  }, [currentData, sort, order]);

  const allSelected = useMemo(() => sortedData.length > 0 && sortedData.every((f) => selectedFiles.has(f.name ?? "")), [sortedData, selectedFiles]);
  const selectAll = useCallback(() => { if (allSelected) clearSelection(); else setSelectedFiles(new Set(sortedData.map((f) => f.name ?? ""))); }, [allSelected, sortedData, clearSelection]);

  if (loading && received.length === 0) return <AdaptiveSkeleton />;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
      <Tabs value={tab} onChange={(_, v) => { setTab(v); clearSelection(); setFolderStack([]); setFolderData(null); }} variant="fullWidth" sx={{ minHeight: 36, borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
        <Tab label={<Stack direction="row" alignItems="center" spacing={0.5}><span>{t("shared.received") || "Fichiers recus"}</span>{received.length > 0 && <Chip size="small" label={received.length} sx={{ height: 18, fontSize: 10 }} />}</Stack>} sx={{ minHeight: 36, textTransform: "none", fontSize: 13 }} />
        <Tab label={<Stack direction="row" alignItems="center" spacing={0.5}><span>{t("shared.invitations") || "Invitations"}</span>{invitations.length > 0 && <Box sx={{ bgcolor: "error.main", color: "error.contrastText", borderRadius: 10, px: 0.75, fontSize: 10, fontWeight: 700, minWidth: 18, textAlign: "center", lineHeight: "18px" }}>{invitations.length}</Box>}</Stack>} sx={{ minHeight: 36, textTransform: "none", fontSize: 13 }} />
        <Tab label={t("shared.sent") || "Envoyees"} sx={{ minHeight: 36, textTransform: "none", fontSize: 13 }} />
      </Tabs>

      {tab === 0 && (
        <>
          {folderStack.length > 0 && (
            <Box px={2} py={0.5} sx={{ flexShrink: 0, borderBottom: 1, borderColor: "divider" }}>
              <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ fontSize: 13 }}>
                <Link underline="hover" color="inherit" sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", fontSize: 13 }} onClick={() => handleBreadcrumb(-1)}>
                  <HomeOutlinedIcon sx={{ fontSize: 15 }} /> {t("shared.title") || "Espace partage"}
                </Link>
                {folderStack.map((f, i) => i === folderStack.length - 1
                  ? <Typography key={i} color="text.primary" sx={{ fontSize: 13, fontWeight: 600 }}>{f.name}</Typography>
                  : <Link key={i} underline="hover" color="inherit" sx={{ cursor: "pointer", fontSize: 13 }} onClick={() => handleBreadcrumb(i)}>{f.name}</Link>
                )}
              </Breadcrumbs>
            </Box>
          )}
          {folderLoading ? <AdaptiveSkeleton /> : sortedData.length === 0 ? (
            <Empty icon={<PeopleOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />} title={t("shared.noReceived") || "Aucun fichier partage"} hint={t("shared.noReceivedHint") || ""} />
          ) : display === "thumbnail" || !display ? (
            <Thumbnail data={sortedData} selectedFiles={selectedFiles} onToggleSelect={toggleSelect} />
          ) : (
            <ListView data={sortedData} selectedFiles={selectedFiles} onToggleSelect={toggleSelect} allSelected={allSelected} onSelectAll={selectAll} compact={display === "compact"} />
          )}
        </>
      )}

      {tab === 1 && (invitations.length === 0 ? (
        <Empty icon={<SendOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />} title={t("shared.noInvitations") || "Aucune invitation"} />
      ) : (
        <Box sx={{ flex: 1, overflow: "auto", p: 1 }}><Stack spacing={0.75}>
          {invitations.map((inv) => <InvCard key={inv._id} inv={inv} loading={actionLoading === inv._id} onAccept={() => handleAccept(inv._id)} onReject={() => handleReject(inv._id)} />)}
        </Stack></Box>
      ))}

      {tab === 2 && (sent.length === 0 ? (
        <Empty icon={<SendOutlinedIcon sx={{ fontSize: 48, opacity: 0.4 }} />} title={t("shared.noSent") || "Aucune invitation envoyee"} />
      ) : (
        <Box sx={{ flex: 1, overflow: "auto", p: 1 }}><Stack spacing={0.75}>
          {sent.map((inv) => <SentCard key={inv._id} inv={inv} />)}
        </Stack></Box>
      ))}

      <UpdateToast open={hasNewData} onClose={() => setHasNewData(false)} />
    </Box>
  );
}

function Empty({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (<Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>{icon}<Typography color="text.secondary" fontWeight="bold">{title}</Typography>{hint && <Typography variant="body2" color="text.disabled">{hint}</Typography>}</Box>);
}

function InvCard({ inv, loading, onAccept, onReject }: { inv: any; loading: boolean; onAccept: () => void; onReject: () => void }) {
  const u = inv.fromUser;
  const name = [u?.fname, u?.lname].filter(Boolean).join(" ") || u?.email || "Utilisateur";
  const colors = avatarColor(inv.from);
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar src={u?.imageUrl} sx={{ width: 36, height: 36, fontSize: 13, ...colors }}>{`${(u?.fname?.[0] || "").toUpperCase()}${(u?.lname?.[0] || "").toUpperCase()}`}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600}>{name}</Typography>
          <Typography variant="caption" color="text.secondary">{u?.email}</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
            <Chip size="small" label={inv.isDirectory ? "Dossier" : "Fichier"} variant="outlined" sx={{ height: 18, fontSize: 10 }} />
            <Typography variant="body2" fontWeight={500} noWrap>{inv.fileName}</Typography>
            <Chip size="small" label={inv.permission === "edit" ? "Modification" : "Lecture"} color="primary" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
          </Stack>
          {inv.message && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontStyle: "italic", display: "block" }}>{inv.message}</Typography>}
        </Box>
        <Stack direction="row" spacing={0.5}>
          {loading ? <CircularProgress size={20} /> : (<>
            <Tooltip title="Accepter" arrow><IconButton size="small" color="success" onClick={onAccept}><CheckCircleOutlinedIcon /></IconButton></Tooltip>
            <Tooltip title="Refuser" arrow><IconButton size="small" color="error" onClick={onReject}><CancelOutlinedIcon /></IconButton></Tooltip>
          </>)}
        </Stack>
      </Stack>
    </Box>
  );
}

function SentCard({ inv }: { inv: any }) {
  const u = inv.toUser;
  const name = [u?.fname, u?.lname].filter(Boolean).join(" ") || u?.email || "Utilisateur";
  const sc = inv.status === "accepted" ? "success" : inv.status === "rejected" ? "error" : "warning";
  const sl = inv.status === "accepted" ? "Accepte" : inv.status === "rejected" ? "Refuse" : "En attente";
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip size="small" label={inv.isDirectory ? "Dossier" : "Fichier"} variant="outlined" sx={{ height: 18, fontSize: 10 }} />
            <Typography variant="body2" fontWeight={600} noWrap>{inv.fileName}</Typography>
            <Typography variant="caption" color="text.secondary">→</Typography>
            <Typography variant="body2" noWrap>{name}</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">{new Date(inv.createdAt).toLocaleDateString("fr-FR")}</Typography>
        </Box>
        <Chip size="small" label={sl} color={sc as any} variant="outlined" sx={{ fontSize: 11 }} />
      </Stack>
    </Box>
  );
}
