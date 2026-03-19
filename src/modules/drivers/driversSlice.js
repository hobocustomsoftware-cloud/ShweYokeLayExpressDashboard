import { createSlice } from "@reduxjs/toolkit";
import { driverPayload } from "./driversPayload";

const driverSlice = createSlice({
    name: "drivers",
    initialState: {
        drivers: [],
        driver: null,
        paginateParams: driverPayload.paginateParams,
        total: 0,
    },
    reducers: {
        index: (state, action) => {
            state.drivers = action.payload;
            return state;
        },
        update: (state, action) => {
            state.driver = action.payload;
            return state;
        },
        setPaginate: (state, action) => {
            state.paginateParams = action.payload;
            return state;
        },
    },
});

export const { index, update, setPaginate } = driverSlice.actions;
export default driverSlice.reducer;
