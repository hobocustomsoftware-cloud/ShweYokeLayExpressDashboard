import { createSlice } from "@reduxjs/toolkit";
import { carNumberPayload } from "./carNumbersPayload";

const carNumbersSlice = createSlice({
    name: "carNumbers",
    initialState: {
        carNumbers: [],
        carNumber: null,
        paginateParams: carNumberPayload.paginateParams,
        total: 0,
    },
    reducers: {
        index: (state, action) => {
            state.carNumbers = action.payload;
            return state;
        },
        update: (state, action) => {
            state.carNumber = action.payload;
            return state;
        },
        setPaginate: (state, action) => {
            state.paginateParams = action.payload;
            return state;
        },
    },
});

export const { index, update, setPaginate } = carNumbersSlice.actions;
export default carNumbersSlice.reducer;
