import React, { useMemo, useState } from "react";
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, List, ListItem, ListItemIcon, ListItemText, TextField, Typography,
} from '@mui/material';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';
import normaliseOctetSize from "@/utils/normaliseOctetSize";
import FileTypeIcon from "@/components/FileTypeIcon";
import getFileExtension from "@/utils/getFileExtension";

interface FormContentProps {
    files: File[] | null;
    findError: (field: string) => boolean;
    handleSendFile: (file: any) => (event: React.FormEvent) => void;
    docFields: any;
    onClose: (event: React.MouseEvent) => void;
    setFiles: (files: any) => void;
}

export default function FormContent({
    files,
    handleSendFile,
    docFields,
    onClose,
    setFiles,
}: FormContentProps) {
    const { t } = useTranslation();
    const items = useMemo(() => files ? [...files] : [], [files]);
    const [tagInput, setTagInput] = useState("");

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
            maxWidth="xs"
            PaperProps={{ sx: { border: 1, borderColor: 'divider' } }}
            BackdropProps={{
                sx: {
                    bgcolor: (theme: any) => theme.palette.background.paper + theme.customOptions.opacity,
                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
                }
            }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0.5 }}>
                <PublishRoundedIcon color="primary" />
                <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold" fontSize={16}>
                        {t('files.uploadFiles')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {items.length} {items.length > 1 ? "fichiers" : "fichier"} — {normaliseOctetSize(totalSize)}
                    </Typography>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSendFile(files)}>
                <DialogContent sx={{ maxHeight: '60vh', pt: 1 }}>
                    {/* Liste des fichiers */}
                    <List dense disablePadding sx={{ mb: 1 }}>
                        {items.map((file, index) => {
                            const ext = getFileExtension(file.name) ?? "txt";
                            return (
                                <ListItem
                                    key={index}
                                    disableGutters
                                    secondaryAction={
                                        items.length > 1 ? (
                                            <IconButton size="small" onClick={() =>
                                                setFiles((prev: File[] | null) => prev && prev.length > 1
                                                    ? prev.filter((_: File, i: number) => i !== index)
                                                    : null
                                                )
                                            }>
                                                <CloseRoundedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        ) : undefined
                                    }
                                    sx={{ py: 0.25 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <FileTypeIcon extension={ext} size={22} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={file.name}
                                        secondary={normaliseOctetSize(file.size)}
                                        primaryTypographyProps={{ variant: "body2", noWrap: true, fontSize: 13 }}
                                        secondaryTypographyProps={{ fontSize: 11 }}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>

                    {/* Tags optionnels */}
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                        {t("filesForm.keyword")} ({t("common.optional") || "optionnel"})
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
                        <TextField
                            size="small"
                            placeholder={t("tags.newTag") || "Ajouter un mot-cle"}
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                            sx={{ flex: 1 }}
                            InputProps={{ sx: { fontSize: 13 } }}
                        />
                        <Button size="small" variant="outlined" onClick={handleAddTag} disabled={!tagInput.trim()}>
                            +
                        </Button>
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

                    {/* Description optionnelle cachée — on garde le ref pour compatibilité */}
                    <input type="hidden" ref={(el) => { if (docFields.designation) docFields.designation.current = items[0]?.name || "fichier"; }} />
                    <input type="hidden" ref={(el) => { if (docFields.description) docFields.description.current = "Televerser depuis l'espace personnel"; }} />
                </DialogContent>

                <DialogActions sx={{ px: 2, py: 1 }}>
                    <Button onClick={onClose} color="inherit">{t('common.cancel')}</Button>
                    <Button type="submit" variant="contained" startIcon={<PublishRoundedIcon />} sx={{ textTransform: "none" }}>
                        {t('files.upload')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
