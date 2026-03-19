import { createSlice } from "@reduxjs/toolkit";
import { couponPayload } from "./couponPayload";

const couponSlice = createSlice({
  name: "coupons",
  initialState: {
    coupons: [],
    coupon: null,
    paginateParams: couponPayload.paginateParams,
    total: 0,
  },
  reducers: {
    index: (state, action) => {
      state.coupons = action.payload;
      return state;
    },
    update: (state, action) => {
      state.coupon = action.payload;
      return state;
    },
    setPaginate: (state, action) => {
      state.paginateParams = action.payload;
      return state;
    },
  },
});

export const { index, update, setPaginate } = couponSlice.actions;
export default couponSlice.reducer;

