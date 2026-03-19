import { FinanceUserPayload } from "./FinanceUserPayload";
import { createSlice } from "@reduxjs/toolkit";

const financeUserSlice = createSlice({
  name: "financeUser",
  initialState: {
    users: [],
    user: null,
    paginateParams: FinanceUserPayload.paginateParams,
    total: 0,
    role: null,
    permission: [],
  },
  reducers: {
    index: (state, action) => {
      state.users = action.payload;
      // return state;
    },
    update: (state, action) => {
      state.user = action.payload;
      // return state;
    },
    setPaginate: (state, action) => {
      state.paginateParams = action.payload;
      return state;
    },
    resetUser: (state) => {
      state.user = null;
    },
  },
});

export const { index, update, setPaginate, resetUser } =
  financeUserSlice.actions;
export default financeUserSlice.reducer;
