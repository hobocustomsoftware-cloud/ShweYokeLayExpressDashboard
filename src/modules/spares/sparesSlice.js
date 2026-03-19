import { createSlice } from "@reduxjs/toolkit";
import { sparePayload } from "./sparesPayload";

const spareSlice = createSlice({
    name: "spares",
    initialState: {
        spares: [],
        spare: null,
        paginateParams: sparePayload.paginateParams,
        total: 0,
    },
    reducers: {
        index: (state, action) => {
            state.spares = action.payload;
            return state;
        },
        update: (state, action) => {
            state.spare = action.payload;
            return state;
        },
        setPaginate: (state, action) => {
            state.paginateParams = action.payload;
            return state;
        },
    },
});

export const { index, update, setPaginate } = spareSlice.actions;
export default spareSlice.reducer;
