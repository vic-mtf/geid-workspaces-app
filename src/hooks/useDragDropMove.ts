import { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { invalidateFolderCache } from "@/redux/data";
import { RootState } from "@/types";

export default function useDragDropMove(getCurrentPath: () => string) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const token = useSelector((store: RootState) => store.user.token);
  const dispatch = useDispatch();
  const [moveConfirm, setMoveConfirm] = useState<{ fileName: string; fileId: string; folderName: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, fileName: string, fileId?: string, isDirectory?: boolean) => {
    e.dataTransfer.setData("fileName", fileName);
    if (fileId) e.dataTransfer.setData("fileId", fileId);
    if (isDirectory) e.dataTransfer.setData("isDirectory", "true");
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent, folderName: string) => { e.preventDefault(); setDragOverFolder(folderName); }, []);
  const handleDragLeave = useCallback(() => setDragOverFolder(null), []);
  const handleDrop = useCallback((e: React.DragEvent, folderName: string) => {
    e.preventDefault(); setDragOverFolder(null);
    const fileName = e.dataTransfer.getData("fileName");
    const fileId = e.dataTransfer.getData("fileId");
    if (fileName && fileName !== folderName) setMoveConfirm({ fileName, fileId: fileId || "", folderName });
  }, []);

  const handleConfirmMove = useCallback(async () => {
    if (!moveConfirm) return;
    const { fileId, folderName } = moveConfirm;
    const currentPath = getCurrentPath();
    setMoveConfirm(null);
    if (!fileId) { enqueueSnackbar(t("dragDrop.moveError"), { variant: "error" }); return; }
    try {
      const destinationPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      const res = await fetch("/api/stuff/workspace/move", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileId, destinationPath }),
      });
      if (!res.ok) throw new Error();
      dispatch(invalidateFolderCache(undefined));
      enqueueSnackbar(t("dragDrop.moveSuccess"), { variant: "success" });
      document.getElementById("root")?.dispatchEvent(new CustomEvent("_reload_current_dir"));
    } catch { enqueueSnackbar(t("dragDrop.moveError"), { variant: "error" }); }
  }, [moveConfirm, getCurrentPath, token, enqueueSnackbar, t, dispatch]);

  return { moveConfirm, dragOverFolder, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleConfirmMove, clearMoveConfirm: () => setMoveConfirm(null) };
}
