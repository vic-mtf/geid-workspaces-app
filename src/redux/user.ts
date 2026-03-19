import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage/session";
import deepMerge from "../utils/deepMerge";
import { UserSliceState } from "../types";

const user = createSlice({
  name: "user",
  initialState: {
    connected: false,
  } as UserSliceState,
  reducers: {
    updateUser(state, action: PayloadAction<{ data: Partial<UserSliceState> }>) {
      const { data } = action.payload;
      const states = deepMerge(state, data) as UserSliceState;
      Object.keys(states).forEach((key) => {
        (state as any)[key] = (states as any)[key];
      });
    },
    deconnected(state) {
      state.connected = false;
    },
  },
});

export const { deconnected, updateUser } = user.actions;
export default persistReducer(
  { storage, key: "__ROOT_GEID_USER_CONFIG_APP" },
  user.reducer
);
