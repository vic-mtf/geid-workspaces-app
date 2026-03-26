import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage/session";
import deepMerge from "@/utils/deepMerge";
import { DataSliceState } from "@/types";

/** Cache d'un dossier (catégorie + sous-dossier) */
export interface FolderCacheEntry {
  data: unknown[];
  timestamp: number;
}

const data = createSlice({
  name: "data",
  initialState: {
    loaded: false,
    folderCache: {} as Record<string, FolderCacheEntry>,
  } as DataSliceState & { folderCache: Record<string, FolderCacheEntry> },
  reducers: {
    updateData(state, action: PayloadAction<{ data: Partial<DataSliceState> }>) {
      const { data } = action.payload;
      const states = deepMerge(state, data) as DataSliceState;
      Object.keys(states).forEach((key) => {
        (state as any)[key] = (states as any)[key];
      });
      const directories = ["documents", "images", "videos", "audios", "others"];
      const loaded = directories.every((directory) =>
        Array.isArray((state as any)[directory])
      );
      if (loaded) state.loaded = true;
    },
    addData(state, action: PayloadAction<{ key: string; data: any }>) {
      const { key, data } = action.payload;
      (state as any)[key] = data;
      const directories = ["documents", "images", "videos", "others"];
      const loaded = directories.every((directory) =>
        Array.isArray((state as any)[directory])
      );
      if (loaded) state.loaded = true;
    },
    removeData(state, action: PayloadAction<{ keys?: string[]; key?: string } | undefined>) {
      const keys =
        action.payload?.keys ||
        (action.payload?.key ? [action.payload.key] : []);
      keys?.forEach((key) => {
        delete (state as any)[key];
        state.isAllData = false;
      });
      if (keys?.length === 0) {
        delete (state as any).documents;
        delete (state as any).photos;
        delete (state as any).videos;
        delete (state as any).others;
        state.isAllData = false;
      }
    },
    // Cache un dossier par clé (ex: "documents", "images/photo")
    setFolderCache(state, action: PayloadAction<{ path: string; data: unknown[] }>) {
      (state as any).folderCache[action.payload.path] = {
        data: action.payload.data,
        timestamp: Date.now(),
      };
    },
    // Invalide le cache d'un chemin ou préfixe
    invalidateFolderCache(state, action: PayloadAction<string | undefined>) {
      const prefix = action.payload;
      if (!prefix) {
        (state as any).folderCache = {};
      } else {
        const cache = (state as any).folderCache as Record<string, FolderCacheEntry>;
        Object.keys(cache).forEach((k) => { if (k.startsWith(prefix)) delete cache[k]; });
      }
    },
  },
});

export const { addData, removeData, updateData, setFolderCache, invalidateFolderCache } = data.actions;
export default persistReducer(
  { storage, key: "__ROOT_GEID_DATA_APP" },
  data.reducer
);
