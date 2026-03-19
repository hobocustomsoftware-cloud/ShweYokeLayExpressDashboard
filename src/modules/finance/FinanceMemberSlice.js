import { FinanceMemberPayload } from "./FinanceMemberPayload";
import { createSlice } from "@reduxjs/toolkit";

const FinanceMemberSlice = createSlice({
  name: "financeMemberSlice",
  initialState: {
    members: [],
    member: null,
    paginateParams: FinanceMemberPayload.paginateParams,
    total: 0,
    role: null,
    permission: [],
  },
  reducers: {
    memberIndex: (state, action) => {
      state.members = action.payload;
      // return state;
    },
    memberUpdate: (state, action) => {
      state.member = action.payload;
      // return state;
    },
    setMemberPaginate: (state, action) => {
      state.paginateParams = action.payload;
      return state;
    },
  },
});

export const { memberIndex, memberUpdate, setMemberPaginate } =
  FinanceMemberSlice.actions;
export default FinanceMemberSlice.reducer;
