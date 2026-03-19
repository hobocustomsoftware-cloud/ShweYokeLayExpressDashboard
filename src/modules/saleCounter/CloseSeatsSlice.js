import { createSlice } from "@reduxjs/toolkit";

const CloseSeatsSlice = createSlice({
  name: "closeSeats",
  initialState: {
    startingPoint: "",
    endingPoint: "",
    selectedDate: "",
    selectedEndDate: "",
    selectedRoute: [],
    sideToLock: "",
    selectedSeat: [],
  },
  reducers: {
    update: (state, action) => {
      if (action.payload.startingPoint !== undefined)
        state.startingPoint = action.payload.startingPoint;
      if (action.payload.endingPoint !== undefined)
        state.endingPoint = action.payload.endingPoint;
      if (action.payload.selectedDate !== undefined)
        state.selectedDate = action.payload.selectedDate;
      if (action.payload.selectedEndDate !== undefined)
        state.selectedEndDate = action.payload.selectedEndDate;
      if (action.payload.selectedRoute !== undefined)
        state.selectedRoute = action.payload.selectedRoute;
      if (action.payload.sideToLock !== undefined)
        state.sideToLock = action.payload.sideToLock;
      if (action.payload.selectedSeat !== undefined)
        state.selectedSeat = action.payload.selectedSeat;
    },
  },
});

export const { update } = CloseSeatsSlice.actions;
export default CloseSeatsSlice.reducer;
