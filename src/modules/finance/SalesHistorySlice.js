import { SalesHistoryPayload } from "./SalesHistoryPayload";
import { createSlice } from "@reduxjs/toolkit";

const SalesHistorySlice = createSlice({
  name: "salesHistory",
  initialState: {
    salesHistories: [],
    summary: [],
    salesHistory: null,
    paginateParams: SalesHistoryPayload.paginateParams,
    agentPaginateParams: SalesHistoryPayload.agentPaginateParams,
    total: 0,
  },
  reducers: {
    index: (state, action) => {
      state.salesHistories = action.payload;
      return state;
    },
    summary: (state, action) => {
      state.summary = action.payload;
      return state;
    },
    update: (state, action) => {
      state.salesHistory = action.payload;
      return state;
    },
    setPaginate: (state, action) => {
      state.paginateParams = action.payload;
      return state;
    },
    setAgentPaginate: (state, action) => {
      state.agentPaginateParams = action.payload;
      return state;
    },
  },
});

export const { index, update, setPaginate, setAgentPaginate, summary } =
  SalesHistorySlice.actions;
export default SalesHistorySlice.reducer;
