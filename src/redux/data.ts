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

/** Cache d'une vue spéciale (recent, favorites, trash, shared) */
export interface ViewCacheEntry {
  data: unknown[];
  timestamp: number;
}

// ── Module-level in-memory cache ────────────────────────────────
// Survives component remounts, instant synchronous access.
// Only empty on full page refresh (F5).
export const dataStore = {
  files: null as any[] | null,
  folderData: {} as Record<string, { data: any[]; timestamp: number }>,
  recent: null as any[] | null,
  favorites: null as any[] | null,
  trash: null as any[] | null,
  shared: null as any[] | null,
};

const data = createSlice({
  name: "data",
  initialState: {
    loaded: false,
    panelWidths: {} as Record<string, number>,
  } as DataSliceState & { panelWidths: Record<string, number> },
  reducers: {
    updateData(state, action: PayloadAction<{ data: Partial<DataSliceState> }>) {
      const { data } = action.payload;
      const states = deepMerge(state, data) as DataSliceState;
      Object.keys(states).forEach((key) => {
        (state as any)[key] = (states as any)[key];
      });
      if (Array.isArray((state as any).files)) state.loaded = true;
    },
    addData(state, action: PayloadAction<{ key: string; data: any }>) {
      const { key, data } = action.payload;
      (state as any)[key] = data;
      if (Array.isArray((state as any).files)) state.loaded = true;
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
        delete (state as any).files;
        state.loaded = false;
        state.isAllData = false;
      }
    },
    // Largeur persistée d'un panneau ajustable
    setPanelWidth(state, action: PayloadAction<{ key: string; width: number }>) {
      (state as any).panelWidths[action.payload.key] = action.payload.width;
    },
  },
});

export const { addData, removeData, updateData, setPanelWidth } = data.actions;

// Keep these names exported for backward compatibility (no-op or adapted)
export const setFolderCache = (_payload: { path: string; data: unknown[] }) => {
  // Write to in-memory dataStore instead of Redux
  dataStore.folderData[_payload.path] = { data: _payload.data as any[], timestamp: Date.now() };
  // Return a dummy action so existing dispatch(setFolderCache(...)) calls don't crash
  return { type: "data/noop" };
};
export const setViewCache = (_payload: { view: string; data: unknown[] }) => {
  dataStore[_payload.view as keyof typeof dataStore] = _payload.data as any;
  return { type: "data/noop" };
};
export const invalidateFolderCache = (_prefix?: string) => {
  if (!_prefix) {
    dataStore.folderData = {};
  } else {
    Object.keys(dataStore.folderData).forEach((k) => {
      if (k.startsWith(_prefix)) delete dataStore.folderData[k];
    });
  }
  return { type: "data/noop" };
};

export default persistReducer(
  { storage, key: "__ROOT_GEID_DATA_APP", whitelist: ["panelWidths"] },
  data.reducer
);
