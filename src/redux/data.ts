import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage/session";
import deepMerge from "@/utils/deepMerge";
import { DataSliceState } from "@/types";

const data = createSlice({
  name: "data",
  initialState: {
    loaded: false,
  } as DataSliceState,
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
  },
});

export const { addData, removeData, updateData } = data.actions;
export default persistReducer(
  { storage, key: "__ROOT_GEID_DATA_APP" },
  data.reducer
);
