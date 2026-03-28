import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";

export type TransferStatus = "pending" | "uploading" | "done" | "error" | "cancelled";

export interface TransferEntry {
  id: string;
  fileName: string;
  fileSize: number;
  icon?: string;
  fileType?: string;
  folder?: string;
  status: TransferStatus;
  progress: number;
  loaded: number;
  total: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

const MAX_HISTORY = 50;

const transfers = createSlice({
  name: "transfers",
  initialState: { entries: [] as TransferEntry[] },
  reducers: {
    addTransfer(state, action: PayloadAction<TransferEntry>) {
      state.entries.unshift(action.payload);
      if (state.entries.length > MAX_HISTORY) state.entries.pop();
    },
    updateTransferProgress(state, action: PayloadAction<{ id: string; loaded: number; total: number; progress: number }>) {
      const e = state.entries.find((x) => x.id === action.payload.id);
      if (e) { e.loaded = action.payload.loaded; e.total = action.payload.total; e.progress = action.payload.progress; e.status = "uploading"; }
    },
    setTransferStatus(state, action: PayloadAction<{ id: string; status: TransferStatus; errorMessage?: string }>) {
      const e = state.entries.find((x) => x.id === action.payload.id);
      if (e) {
        e.status = action.payload.status;
        if (action.payload.errorMessage) e.errorMessage = action.payload.errorMessage;
        if (["done", "error", "cancelled"].includes(action.payload.status)) {
          e.completedAt = new Date().toISOString();
          if (action.payload.status === "done") e.progress = 100;
        }
      }
    },
    removeTransfer(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter((e) => e.id !== action.payload);
    },
    clearCompleted(state) {
      state.entries = state.entries.filter((e) => e.status === "pending" || e.status === "uploading");
    },
  },
});

export const { addTransfer, updateTransferProgress, setTransferStatus, removeTransfer, clearCompleted } = transfers.actions;
export default persistReducer({ storage, key: "__ROOT_GEID_TRANSFERS" }, transfers.reducer);
