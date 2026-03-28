import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import appConfig from "@/configs/app-config.json";
import { AppSliceState } from "@/types";

const {
  lang,
  colors: {
    primary: { mode },
  },
} = appConfig;

const app = createSlice({
  name: "app",
  initialState: {
    mode: mode as "light" | "dark" | "auto",
    lang,
    opacity: 0.75,
    blur: 15,
    users: [],
    user: null,
    stayConnected: false,
    display: "thumbnail" as string,
    sort: "name" as string,
    order: "ascending" as string,
    pendingShareCount: 0,
    visitedViews: {} as Record<string, boolean>,
  } as AppSliceState & { display: string; sort: string; order: string; pendingShareCount: number; visitedViews: Record<string, boolean> },
  reducers: {
    switchTheme(state, action: PayloadAction<"light" | "dark" | "auto" | undefined>) {
      state.mode = action.payload || (mode as "light" | "dark" | "auto");
    },
    changeLang(state, action: PayloadAction<string | undefined>) {
      state.lang = action.payload || lang;
    },
    setUser(state, action: PayloadAction<string | null>) {
      state.user = action.payload;
    },
    removeUser(state, action: PayloadAction<number | undefined>) {
      const index = action.payload;
      if (typeof index === "number") delete state.users[index];
      else state.user = null;
    },
    setDisplay(state, action: PayloadAction<string>) {
      (state as any).display = action.payload;
    },
    setSort(state, action: PayloadAction<string>) {
      (state as any).sort = action.payload;
    },
    setOrder(state, action: PayloadAction<string>) {
      (state as any).order = action.payload;
    },
    setPendingShareCount(state, action: PayloadAction<number>) {
      (state as any).pendingShareCount = action.payload;
    },
    incrementPendingShare(state) {
      (state as any).pendingShareCount = ((state as any).pendingShareCount || 0) + 1;
    },
    markViewVisited(state, action: PayloadAction<string>) {
      (state as any).visitedViews[action.payload] = true;
    },
  },
});

export const { switchTheme, changeLang, removeUser, setUser, setDisplay, setSort, setOrder, setPendingShareCount, incrementPendingShare, markViewVisited } = app.actions;

export default persistReducer(
  { storage, key: "__ROOT_GEID_GLOBAL_CONFIG_APP" },
  app.reducer
);
