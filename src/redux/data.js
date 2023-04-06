import { createSlice } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage/session";

const data = createSlice({
    name: 'data',
    initialState: {
        isAllData: false
    },
    reducers: {
        addData(state, actions) {
            const { key, data } = actions.payload;
            console.log(data);
            state[key] = data;
            if(
                state.documents &&
                state.photos &&
                state.videos &&
                state.others
            ) state.isAllData = true;
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

export const { addData, removeData } = data.actions;
export default persistReducer({
    storage,
    key:'__ROOT_GEID_DATA_APP'
}, 
data.reducer
);