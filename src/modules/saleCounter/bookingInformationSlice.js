import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  startingPoint: "",
  endingPoint: "",
  selectedDate: "",
  bookerName: "",
  phone: "",
  nationality: "",
  nrcRegion: "",
  nrcTownship: "",
  nrcCitizen: "",
  nrcNumber: "",
  nrc: "",
  specialRequest: "",
  selectedSeat: [],
  bookedSeats: [],
  seatsToShow: null,
  selectedRoute: [],
  commission: 0 || "",
  seatCount: 0,
  totalAmount: 0,
  saleMaker: "",
  userRole: "",
  salePlatform: "",
  depositBalance: 0,
  creditBalance: 0,
  start: "",
  destination: "",
  role: "",
  permissions: [],
};

const bookingInformationSlice = createSlice({
  name: "bookingInformation",
  initialState,
  reducers: {
    updateBookingInformation: (state, action) => {
      // Explicitly update only the properties present in the payload
      if (action.payload.selectedDate !== undefined)
        state.selectedDate = action.payload.selectedDate;
      if (action.payload.bookerName !== undefined)
        state.bookerName = action.payload.bookerName;
      if (action.payload.nationality !== undefined)
        state.nationality = action.payload.nationality;
      if (action.payload.phone !== undefined)
        state.phone = action.payload.phone;
      if (action.payload.nrcRegion !== undefined)
        state.nrcRegion = action.payload.nrcRegion;
      if (action.payload.nrcTownship !== undefined)
        state.nrcTownship = action.payload.nrcTownship;
      if (action.payload.nrcCitizen !== undefined)
        state.nrcCitizen = action.payload.nrcCitizen;
      if (action.payload.nrcNumber !== undefined)
        state.nrcNumber = action.payload.nrcNumber;
      if (action.payload.nrc !== undefined) state.nrc = action.payload.nrc;
      if (action.payload.specialRequest !== undefined)
        state.specialRequest = action.payload.specialRequest;
      if (action.payload.selectedSeat !== undefined)
        state.selectedSeat = action.payload.selectedSeat;
      if (action.payload.selectedRoute !== undefined)
        state.selectedRoute = action.payload.selectedRoute;
      if (action.payload.bookedSeats !== undefined)
        state.bookedSeats = action.payload.bookedSeats;
      if (action.payload.commission !== undefined)
        state.commission = action.payload.commission;
      if (action.payload.seatCount !== undefined)
        state.seatCount = action.payload.seatCount;
      if (action.payload.totalAmount !== undefined)
        state.totalAmount = action.payload.totalAmount;
      if (action.payload.saleMaker !== undefined)
        state.saleMaker = action.payload.saleMaker;
      if (action.payload.userRole !== undefined)
        state.userRole = action.payload.userRole;
      if (action.payload.salePlatform !== undefined)
        state.salePlatform = action.payload.salePlatform;
      if (action.payload.depositBalance !== undefined)
        state.depositBalance = action.payload.depositBalance;
      if (action.payload.creditBalance !== undefined)
        state.creditBalance = action.payload.creditBalance;
      if (action.payload.start !== undefined)
        state.start = action.payload.start;
      if (action.payload.destination !== undefined)
        state.destination = action.payload.destination;
      if (action.payload.role !== undefined) state.role = action.payload.role;
      if (action.payload.startingPoint !== undefined)
        state.startingPoint = action.payload.startingPoint;
      if (action.payload.endingPoint !== undefined)
        state.endingPoint = action.payload.endingPoint;
      if (action.payload.permissions !== undefined)
        state.permissions = action.payload.permissions;
    },
    setSelectedRoute: (state, action) => {
      state.selectedRoute = action.payload;
    },
    resetBookingInformation: () => initialState,
    resetSeatAndRoute: (state) => {
      state.selectedSeat = [];
      state.selectedRoute = null;
    },
  },
});

export const {
  updateBookingInformation,
  setSelectedRoute,
  resetBookingInformation,
  resetSeatAndRoute,
} = bookingInformationSlice.actions;
export default bookingInformationSlice.reducer;
