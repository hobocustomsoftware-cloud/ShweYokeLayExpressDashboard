import { SaleCounterPayload } from "./SaleCounterPayload";
import { createSlice } from "@reduxjs/toolkit";

const SaleCounterSlice = createSlice({
  name: "saleCounter",
  initialState: {
    saleCounters: [],
    saleCounter: null,
    paginateParams: SaleCounterPayload.paginateParams,
    total: 0,
  },
  reducers: {
    index: (state, action) => {
      state.saleCounters = action.payload;
      return state;
    },
    update: (state, action) => {
      state.saleCounter = action.payload;
      return state;
    },
    setPaginate: (state, action) => {
      state.paginateParams = action.payload;
      return state;
    },
  },
});

export const { index, update, setPaginate } = SaleCounterSlice.actions;
export default SaleCounterSlice.reducer;
