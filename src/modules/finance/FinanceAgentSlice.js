import { FinanceAgentPayload } from "./FinanceAgentPayload";
import { createSlice } from "@reduxjs/toolkit";

const financeAgentSlice = createSlice({
  name: "financeAgent",
  initialState: {
    agents: [],
    agent: null,
    paginateParams: FinanceAgentPayload.paginateParams,
    total: 0,
    role: null,
    permission: [],
  },
  reducers: {
    agentIndex: (state, action) => {
      state.agents = action.payload;
      // return state;
    },
    agentUpdate: (state, action) => {
      state.agent = action.payload;
      // return state;
    },
    setAgentPaginate: (state, action) => {
      state.paginateParams = action.payload;
      return state;
    },
    resetAgent: (state) => {
      state.agent = null;
    },
  },
});

export const { agentIndex, agentUpdate, setAgentPaginate, resetAgent } =
  financeAgentSlice.actions;
export default financeAgentSlice.reducer;
