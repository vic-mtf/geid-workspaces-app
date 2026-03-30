import React, { useMemo, useState } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, TextField, Typography,
} from '@mui/material';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';
import Typology from "@/views/forms/files/Typology";
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";

interface FormContentProps {
    files: File[] | null;
    isFolder?: boolean;
    findError: (field: string) => boolean;
    handleSendFile: (file: any) => (event: React.FormEvent) => void;
    docFields: any;
    onClose: (event: React.MouseEvent) => void;
    setFiles: (files: any) => void;
}

export default function FormContent({
    files,
    isFolder = false,
    handleSendFile,
    docFields,
    onClose,
    setFiles,
}: FormContentProps) {
    const { t } = useTranslation();
    const items = useMemo(() => files ? [...files] : [], [files]);
    const [tagInput, setTagInput] = useState("");

    const folderInfo = useMemo(() => {
        if (!isFolder || !items.length) return null;
        const firstPath = (items[0] as any)?.webkitRelativePath || "";
        const rootName = firstPath.split("/")[0] || "Dossier";
        const subFolders = new Set<string>();
        items.forEach((f: any) => {
            const parts = (f.webkitRelativePath || "").split("/");
            for (let i = 1; i < parts.length - 1; i++) {
                subFolders.add(parts.slice(0, i + 1).join("/"));
            }
        });
        return { rootName, fileCount: items.length, subFolderCount: subFolders.size };
    }, [isFolder, items]);

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (!tag) return;
        const current = docFields.tags?.current || "";
        docFields.tags.current = current ? `${current} ${tag}` : tag;
        setTagInput("");
    };

    const totalSize = useMemo(() => items.reduce((acc, f) => acc + f.size, 0), [items]);

    return (
        <Dialog
            open={!!files}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { border: 1, borderColor: 'divider' } }}
            BackdropProps={{
                sx: {
                    bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                }
            }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0.5 }}>
                {isFolder ? <FolderOutlinedIcon color="warning" /> : <PublishRoundedIcon color="primary" />}
                <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold" fontSize={16}>
                        {isFolder ? (t('files.uploadFolder') || "Televerser un dossier") : t('files.uploadFiles')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {isFolder
                            ? `${folderInfo?.rootName} — ${folderInfo?.fileCount} fichier${(folderInfo?.fileCount || 0) > 1 ? "s" : ""}${folderInfo?.subFolderCount ? `, ${folderInfo.subFolderCount} dossier${folderInfo.subFolderCount > 1 ? "s" : ""}` : ""}`
                            : `${items.length} fichier${items.length > 1 ? "s" : ""} — ${normaliseOctetSize(totalSize)}`
                        }
                    </Typography>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSendFile(files)}>
                <DialogContent sx={{ maxHeight: '60vh', pt: 1 }}>
                    {/* Liste des fichiers */}
                    <List dense disablePadding sx={{ mb: 1, maxHeight: 180, overflow: "auto" }}>
                        {items.slice(0, 30).map((file, index) => {
                            const ext = getFileExtension(file.name) ?? "txt";
                            const relPath = isFolder ? (file as any).webkitRelativePath : null;
                            return (
                                <ListItem key={index} disableGutters sx={{ py: 0.25 }}
                                    secondaryAction={!isFolder && items.length > 1 ? (
                                        <IconButton size="small" onClick={() =>
                                            setFiles((prev: File[] | null) => prev && prev.length > 1 ? prev.filter((_: File, i: number) => i !== index) : null)
                                        }><CloseRoundedIcon sx={{ fontSize: 16 }} /></IconButton>
                                    ) : undefined}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <FileTypeIcon extension={ext} size={22} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={file.name}
                                        secondary={relPath ? relPath.split("/").slice(1, -1).join("/") || undefined : normaliseOctetSize(file.size)}
                                        primaryTypographyProps={{ variant: "body2", noWrap: true, fontSize: 13 }}
                                        secondaryTypographyProps={{ fontSize: 11, color: "text.disabled" }}
                                    />
                                </ListItem>
                            );
                        })}
                        {items.length > 30 && (
                            <Typography variant="caption" color="text.disabled" sx={{ pl: 4 }}>
                                + {items.length - 30} autre{items.length - 30 > 1 ? "s" : ""}
                            </Typography>
                        )}
                    </List>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Designation */}
                    <TextField
                        fullWidth size="small" label={t("filesForm.designation")}
                        defaultValue={isFolder ? folderInfo?.rootName : items[0]?.name || ""}
                        inputRef={(el: HTMLInputElement | null) => { if (el && docFields.designation) docFields.designation.current = el.value; }}
                        onChange={(e) => { if (docFields.designation) docFields.designation.current = e.target.value; }}
                        sx={{ mb: 1.5 }}
                    />

                    {/* Description */}
                    <TextField
                        fullWidth size="small" multiline minRows={2} maxRows={3}
                        label={t("filesForm.description")}
                        inputRef={(el: HTMLInputElement | null) => { if (el && docFields.description) docFields.description.current = el.value; }}
                        onChange={(e) => { if (docFields.description) docFields.description.current = e.target.value; }}
                        sx={{ mb: 1.5 }}
                    />

                    {/* Type + Sous-type */}
                    <Typology type={docFields.type} subType={docFields.subType} />

                    {/* Tags */}
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, mt: 1, display: "block" }}>
                        {t("filesForm.keyword")} ({t("common.optional") || "optionnel"})
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
                        <TextField
                            size="small"
                            placeholder={t("tags.newTag") || "Ajouter un mot-cle"}
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                            sx={{ flex: 1 }}
                            InputProps={{ sx: { fontSize: 13 } }}
                        />
                        <Button size="small" variant="outlined" onClick={handleAddTag} disabled={!tagInput.trim()}>+</Button>
                    </Box>
                    {docFields.tags?.current && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                            {(docFields.tags.current as string).split(/\s+/).filter(Boolean).map((tag: string, i: number) => (
                                <Chip key={i} label={tag} size="small" variant="outlined" sx={{ fontSize: 11 }}
                                    onDelete={() => {
                                        const tags = (docFields.tags.current as string).split(/\s+/).filter((t: string) => t !== tag);
                                        docFields.tags.current = tags.join(" ");
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 2, py: 1 }}>
                    <Button onClick={onClose} color="inherit">{t('common.cancel')}</Button>
                    <Button type="submit" variant="contained" startIcon={isFolder ? <FolderOutlinedIcon /> : <PublishRoundedIcon />} sx={{ textTransform: "none" }}>
                        {t('files.upload')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
