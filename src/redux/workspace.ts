import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FileItem } from "@/types";

export type ViewMode = "grid" | "list";

export interface WorkspaceState {
  viewMode: ViewMode;
  selectedFiles: string[];
  clipboard: { action: "copy" | "cut"; fileIds: string[] } | null;
  favorites: FileItem[];
  recentFiles: FileItem[];
  trash: FileItem[];
  tags: string[];
  quota: { used: number; total: number };
}

const workspace = createSlice({
  name: "workspace",
  initialState: {
    viewMode: "grid",
    selectedFiles: [],
    clipboard: null,
    favorites: [],
    recentFiles: [],
    trash: [],
    tags: [],
    quota: { used: 0, total: 5 * 1024 * 1024 * 1024 },
  } as WorkspaceState,
  reducers: {
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
    },
    setSelectedFiles(state, action: PayloadAction<string[]>) {
      state.selectedFiles = action.payload;
    },
    toggleFileSelection(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.selectedFiles.indexOf(id);
      if (idx >= 0) state.selectedFiles.splice(idx, 1);
      else state.selectedFiles.push(id);
    },
    clearSelection(state) {
      state.selectedFiles = [];
    },
    setClipboard(state, action: PayloadAction<WorkspaceState["clipboard"]>) {
      state.clipboard = action.payload;
    },
    setFavorites(state, action: PayloadAction<FileItem[]>) {
      state.favorites = action.payload;
    },
    setRecentFiles(state, action: PayloadAction<FileItem[]>) {
      state.recentFiles = action.payload;
    },
    setTrash(state, action: PayloadAction<FileItem[]>) {
      state.trash = action.payload;
    },
    setTags(state, action: PayloadAction<string[]>) {
      state.tags = action.payload;
    },
    setQuota(state, action: PayloadAction<{ used: number; total: number }>) {
      state.quota = action.payload;
    },
  },
});

export const {
  setViewMode,
  setSelectedFiles,
  toggleFileSelection,
  clearSelection,
  setClipboard,
  setFavorites,
  setRecentFiles,
  setTrash,
  setTags,
  setQuota,
} = workspace.actions;

export default workspace.reducer;
