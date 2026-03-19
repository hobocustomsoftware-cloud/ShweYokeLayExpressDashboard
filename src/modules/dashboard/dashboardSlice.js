import { createSlice } from "@reduxjs/toolkit";
import { dashboardPayload } from "./dashboardPayload";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    total_data: [],
    chart_data: [],
    agentStats: [],

    adminData: [],
    summary: [],
    salesData: [],
    agentData: [],
    agentSummary: [],
    paginateParams:
      dashboardPayload.paginateParams || dashboardPayload.agentPaginateParams,
  },
  reducers: {
    totaldata: (state, action) => {
      state.total_data = action.payload;
      return state;
    },
    agentStats: (state, action) => {
      state.agentStats = action.payload;
      return state;
    },
    chartdata: (state, action) => {
      state.chart_data = action.payload;
      return state;
    },

    updateAdminData: (state, action) => {
      state.adminData = action.payload;
      return state;
    },
    updateSummary: (state, action) => {
      state.summary = action.payload;
      return state;
    },
    updateSalesData: (state, action) => {
      state.salesData = action.payload;
      return state;
    },
    updateAgentData: (state, action) => {
      console.log("updateAgentData reducer hit:", action.payload);
      state.agentData = action.payload;
      return state;
    },
    updateAgentSummary: (state, action) => {
      state.agentSummary = action.payload;
      return state;
    },
    setPaginate: (state, action) => {
      state.paginateParams = action.payload;
      return state;
    },
  },
});

export const {
  totaldata,
  chartdata,
  agentStats,
  updateAdminData,
  updateSummary,
  updateSalesData,
  updateAgentData,
  updateAgentSummary,
  setPaginate,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
