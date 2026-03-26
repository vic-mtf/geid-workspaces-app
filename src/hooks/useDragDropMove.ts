import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { RootState } from "@/types";

export default function useDragDropMove(getCurrentPath: () => string) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const token = useSelector((store: RootState) => store.user.token);
  const [moveConfirm, setMoveConfirm] = useState<{ fileName: string; folderName: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, fileName: string) => {
    e.dataTransfer.setData("fileName", fileName);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent, folderName: string) => {
    e.preventDefault(); setDragOverFolder(folderName);
  }, []);
  const handleDragLeave = useCallback(() => setDragOverFolder(null), []);
  const handleDrop = useCallback((e: React.DragEvent, folderName: string) => {
    e.preventDefault(); setDragOverFolder(null);
    const fileName = e.dataTransfer.getData("fileName");
    if (fileName && fileName !== folderName) setMoveConfirm({ fileName, folderName });
  }, []);
  const handleConfirmMove = useCallback(async () => {
    if (!moveConfirm) return;
    const { fileName, folderName } = moveConfirm;
    const path = getCurrentPath();
    setMoveConfirm(null);
    try {
      const res = await fetch("/api/stuff/workspace/move", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ source: `${path}/${fileName}`, destination: `${path}/${folderName}/${fileName}` }),
      });
      if (!res.ok) throw new Error();
      enqueueSnackbar(t("dragDrop.moveSuccess"), { variant: "success" });
      document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
    } catch { enqueueSnackbar(t("dragDrop.moveError"), { variant: "error" }); }
  }, [moveConfirm, getCurrentPath, token, enqueueSnackbar, t]);

  return { moveConfirm, dragOverFolder, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleConfirmMove, clearMoveConfirm: () => setMoveConfirm(null) };
}
