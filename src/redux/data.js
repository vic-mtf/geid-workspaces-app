import { createSlice } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage/session";
import deepMerge from "../utils/deepMerge";

const data = createSlice({
    name: 'data',
    initialState: {
        loaded: false,
    },
    reducers: {
        updateData(state, actions) {
            const { data } = actions.payload;
            const states = deepMerge(state, data);
            Object.keys(states).forEach(key => {
                state[key] = states[key];
            });
            const directories  = ['documents', 'images', 'videos', 'audios', 'others'];
            const loaded = directories.every(directory => Array.isArray(state[directory]));
            if(loaded) state.loaded = true; 
        },
        addData(state, actions) {
            const { key, data } = actions.payload;
            state[key] = data;
            const directories  = ['documents', 'images', 'videos', 'others'];
            const loaded = directories.every(directory => Array.isArray(state[directory]));
            if(loaded) state.loaded = true;
        },
        removeData(state, actions) {
            const keys = actions.payload?.keys || 
            (actions.payload?.key ? [actions.payload?.key] : []);
            keys?.forEach(key => {
                delete state[key];
                state.isAllData = false;
            });
            if(keys?.length === 0) {
                delete state.documents;
                delete state.photos;
                delete state.videos;
                delete state.others;
                state.isAllData = false;
            }
        }
    }
});

export const { addData, removeData, updateData } = data.actions;
export default persistReducer({
    storage,
    key:'__ROOT_GEID_DATA_APP'
}, 
data.reducer
);