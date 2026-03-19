import { agentPayload } from "./agentPayload";
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  agents: [],
  agent: null,
  paginateParams: agentPayload.paginateParams,
  total: 0,
};

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    index: (state, action) => {
      state.agents = action.payload;
      return state;
    },
    updateAgent: (state, action) => {
      state.agent = action.payload;
      return state;
    },
    setPaginate: (state, action) => {
      state.paginateParams = action.payload;
      return state;
    },
    resetAgent: () => initialState,
  },
});

export const { index, updateAgent, setPaginate, resetAgent } =
  agentSlice.actions;
export default agentSlice.reducer;
