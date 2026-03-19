import {
  Button,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { getData, removeAllData } from "../../../helpers/localstorage";
import { keys, laravelDecrypt } from "../../../constants/config";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AdminStdSeatLock from "../../../helpers/AdminStdSeatLock";
import AdminVipSeatLock from "../../../helpers/AdminVipSeatLock";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import { CloseSeatsPayload } from "../CloseSeatsPayload";
import { PermissionGate } from "../../../helpers/PermissionGate";
import { SaleCounterService } from "../SaleCounterService";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import dayjs from "dayjs";
import { endpoints } from "../../../constants/endpoints";
import { formatTo12Hour } from "../../../helpers/otherHelpers";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { update } from "../CloseSeatsSlice";
import { updateBookingInformation } from "../bookingInformationSlice";
import { useNavigate } from "react-router-dom";

export const CloseSeatsPage = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(CloseSeatsPayload.check);
  const [vehiclesType, setVehiclesType] = useState([]);
  const [data, setData] = useState([]);
  const [seatLayout, setSeatLayout] = useState(null);
  const [totalSeat, setTotalSeat] = useState(null);
  const [counter, setCounter] = useState([]);
  const [startingPointOptions, setStartingPointOptions] = useState([]);
  const [endingPointOptions, setEndingPointOptions] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routes, setRoute] = useState([]);
  const [storeData, setStoreData] = useState({});
  const [openAlert, setOpenAlert] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { startingPoint, endingPoint, selectedDate } = useSelector(
    (state) => state.closeSeats
  );

  const logout = async () => {
    removeAllData();
    navigate(paths.adminLogout);
  };

  // 🔹 Initialize store data (run once)
  useEffect(() => {
    const init = async () => {
      if (Object.keys(storeData).length === 0) {
        const decrypted = await laravelDecrypt(getData(keys.CODE));
        if (!decrypted) {
          setOpenAlert(true);
          logout();
        } else {
          setStoreData(decrypted);
        }
      }
    };
    init();
  }, [storeData]);

  // 🔹 Load vehicles & counter data
  const loadingData = useCallback(async () => {
    setLoading(true);
    try {
      const [vehiclesTypeResult, counterResult] = await Promise.all([
        getRequest(endpoints.vehiclesType),
        getRequest(endpoints.counter),
      ]);

      if (vehiclesTypeResult.status === 200)
        setVehiclesType(vehiclesTypeResult.data);

      if (counterResult.status === 200) {
        setCounter(counterResult.data);
        setStartingPointOptions(counterResult.data);
        setEndingPointOptions(counterResult.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadingRouteData = useCallback(
    async (payload) => {
      if (payload.startingPoint === payload.endingPoint) {
        return;
      }
      setRouteLoading(true);
      const routeResult = await getRequest(
        `${endpoints.saleCounterRouteSearch}`,
        {
          starting_point: payload.startingPoint,
          ending_point: payload.endingPoint,
          selected_date: payload.selectedDate,
        }
      );
      if (routeResult.status === 200) {
        console.log("routeResult", routeResult);
        const routes = Array.isArray(routeResult?.data?.routes)
          ? routeResult.data.routes
          : [];
        setRoute(routes);

        const orders = routes?.orders?.map((order) => {
          try {
            const seats = JSON.parse(order.seat);
            if (!Array.isArray(seats)) return [];

            return seats.map((seat) => ({
              number: seat?.number ?? null,
              type: seat?.type ?? "Unknown",
              sold: true,
              status: order?.status ?? null,
            }));
          } catch (error) {
            console.error("Invalid JSON in order.seat:", order.seat, error);
            return [];
          }
        });
        dispatch(updateBookingInformation({ bookedSeats: orders }));
        setRouteLoading(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  // 🔹 Dispatch route + date updates when both points are selected
  useEffect(() => {
    if (payload.startingPoint && payload.endingPoint && payload.selectedDate) {
      dispatch(
        update({
          startingPoint: payload.startingPoint,
          endingPoint: payload.endingPoint,
          selectedDate: payload.selectedDate,
        })
      );
      loadingRouteData(payload);
    }
  }, [
    payload,
    payload.startingPoint,
    payload.endingPoint,
    payload.selectedDate,
    dispatch,
    loadingRouteData,
  ]);

  useEffect(() => {
    if (
      selectedDate &&
      startingPoint &&
      endingPoint &&
      startingPoint !== endingPoint
    ) {
      loadingRouteData({
        starting_point: startingPoint,
        ending_point: endingPoint,
        selected_date: selectedDate,
      });
    }
  }, [selectedDate, startingPoint, endingPoint, loadingRouteData]);

  // 🔹 Filter counters to avoid same start/end
  useEffect(() => {
    const filteredStarting = counter?.filter(
      (p) => p.id !== payload.endingPoint
    );
    const filteredEnding = counter?.filter(
      (p) => p.id !== payload.startingPoint
    );
    setStartingPointOptions(filteredStarting);
    setEndingPointOptions(filteredEnding);
  }, [payload.startingPoint, payload.endingPoint, counter]);

  // 🔹 Control loading based on required fields
  useEffect(() => {
    const isIncomplete =
      !payload.selectedDate || !payload.route_id || !payload.sideToLock;
    setLoading(isIncomplete);
  }, [payload.selectedDate, payload.route_id, payload.sideToLock]);

  // 🔹 Handle Block / Unblock
  const handleBlockClick = async () => {
    setLoading(true);
    const result = await SaleCounterService.block(dispatch, payload);
    if (result.status === 200) setData(result.data);
    setLoading(false);
  };

  const handleUnblockClick = async () => {
    setLoading(true);
    const result = await SaleCounterService.unBlock(dispatch, payload);
    if (result.status === 200) setData(result.data);
    setLoading(false);
  };

  // 🔹 Update seat layout when route changes
  useEffect(() => {
    if (payload.route_id && routes.length > 0) {
      const selectedRoute = routes.find((r) => r.id === payload.route_id);
      if (selectedRoute) {
        setSeatLayout(selectedRoute.vehicles_type.seat_layout);
        setTotalSeat(selectedRoute.vehicles_type.total_seat);
      }
    }
  }, [payload.route_id, routes]);

  const handleSideChange = (e) => {
    payloadHandler(payload, e.target.value, "route_id", (updateValue) => {
      setPayload(updateValue);
    });
    dispatch(update({ selectedRoute: e.target.value }));
  };

  const formatName = (name) => {
    if (name.length > 25) {
      return name.substring(0, 22) + " ...";
    }
    return name;
  };

  // console.log("totalSeat", totalSeat);
  // console.log("seatLayout", seatLayout);
  return (
    <>
      <div className="grid">
        <Breadcrumb />

        <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
          <Grid container spacing={3} sx={{ p: 0 }}>
            {/* Starting Point */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Choose Departure *</InputLabel>
                <Select
                  id="startingPoint"
                  value={payload.startingPoint}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "startingPoint",
                      setPayload
                    )
                  }
                >
                  {startingPointOptions.map((value) => (
                    <MenuItem key={value.id} value={value.id}>
                      {value.name}
                    </MenuItem>
                  ))}
                </Select>
                <ValidationMessage field="startingPoint" />
              </Stack>
            </Grid>

            {/* Ending Point */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Choose Destination *</InputLabel>
                <Select
                  id="endingPoint"
                  value={payload.endingPoint}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "endingPoint",
                      setPayload
                    )
                  }
                >
                  {endingPointOptions.map((value) => (
                    <MenuItem key={value.id} value={value.id}>
                      {value.name}
                    </MenuItem>
                  ))}
                </Select>
                <ValidationMessage field="endingPoint" />
              </Stack>
            </Grid>

            {/* Date */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Date *</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      payload.selectedDate ? dayjs(payload.selectedDate) : null
                    }
                    onChange={(newValue) =>
                      payloadHandler(
                        payload,
                        newValue ? newValue.format("YYYY-MM-DD") : "",
                        "selectedDate",
                        setPayload
                      )
                    }
                    slotProps={{
                      textField: { size: "medium", placeholder: "Choose Date" },
                    }}
                  />
                </LocalizationProvider>
                <ValidationMessage field="selectedDate" />
              </Stack>
            </Grid>

            {/* End Date */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>End Date</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      payload.selectedEndDate
                        ? dayjs(payload.selectedEndDate)
                        : null
                    }
                    onChange={(newValue) =>
                      payloadHandler(
                        payload,
                        newValue ? newValue.format("YYYY-MM-DD") : "",
                        "selectedEndDate",
                        setPayload
                      )
                    }
                    slotProps={{
                      textField: { size: "medium", placeholder: "Choose Date" },
                    }}
                  />
                </LocalizationProvider>
                <ValidationMessage field="selectedEndDate" />
              </Stack>
            </Grid>

            {/* Route */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Choose Route *</InputLabel>
                <Select
                  id="route_id"
                  value={payload.route_id}
                  onChange={handleSideChange}
                >
                  {routes.map((value) => (
                    <MenuItem key={value.id} value={value.id}>
                      {formatName(value.name)} ({value.vehicles_type.name}) -{" "}
                      {formatTo12Hour(value.departure)}
                    </MenuItem>
                  ))}
                </Select>
                <ValidationMessage field="route_id" />
              </Stack>
            </Grid>

            {/* Side Selection */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Choose Side to Close</InputLabel>
                <Select
                  id="sideToLock"
                  value={payload.sideToLock}
                  onChange={(e) => {
                    payloadHandler(
                      payload,
                      e.target.value,
                      "sideToLock",
                      (updatedValue) => {
                        setPayload(updatedValue);
                      }
                    );
                    dispatch(update({ sideToLock: e.target.value }));
                  }}
                >
                  {["custom", "left", "right"].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
                <ValidationMessage field="sideToLock" />
              </Stack>
            </Grid>

            {/* Buttons */}
            <Grid item xs={12} sx={{ display: "flex", gap: 2, mt: 2, px: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(paths.blockSeatsPage)}
              >
                Cancel
              </Button>
              <PermissionGate permission="Lock_Seat">
                <Button
                  onClick={handleBlockClick}
                  variant="contained"
                  color="error"
                >
                  Lock Seats
                </Button>
              </PermissionGate>
              <PermissionGate permission="Unlock_Seat">
                <Button
                  onClick={handleUnblockClick}
                  variant="contained"
                  color="success"
                >
                  Unlock Seats
                </Button>
              </PermissionGate>
            </Grid>

            {/* Seat Layout Render */}
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                px: 3,
              }}
            >
              {seatLayout === "2:1"
                ? totalSeat !== null && (
                    <AdminVipSeatLock totalSeat={totalSeat} />
                  )
                : totalSeat !== null && (
                    <AdminStdSeatLock totalSeat={totalSeat} />
                  )}
            </Grid>
          </Grid>
        </Paper>

        {/* <Grid container spacing={2}>
          {data.length == 0 && !before ? (
            <Grid item xs={12}>
              <Paper
                elevation={3}
                style={{
                  padding: 20,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#888",
                }}
              >
                No Data Found
              </Paper>
            </Grid>
          ) : (
            data?.map((payload, index) => (
              <Paper
                elevation={5}
                style={{ padding: 10, margin: 10 }}
                key={index}
              >
                <Grid item xs={12} key={index}>
                  <InputLabel sx={{ fontSize: "18px", fontWeight: "bold" }}>
                    Route Name - {payload?.route?.name}(
                    {payload?.route?.vehicles_type?.name})
                  </InputLabel>
                  <InputLabel sx={{ fontSize: "18px", fontWeight: "bold" }}>
                    Date - {payload?.start_date}
                  </InputLabel>
                  <InputLabel sx={{ fontSize: "18px", fontWeight: "bold" }}>
                    Car No - {payload?.car_no}
                  </InputLabel>
                  <InputLabel sx={{ fontSize: "18px", fontWeight: "bold" }}>
                    Driver Name - {payload?.driver_name}
                  </InputLabel>
                  <Box
                    id="seat-layout-pdf"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    {(() => {
                      const seatLayout =
                        payload?.route?.vehicles_type?.seat_layout || "2:1";
                      const totalSeats =
                        payload?.route?.vehicles_type?.total_seat || 0;
                      const seatMap = new Map();

                      payload?.payment_histories?.forEach((history) => {
                        const seatList = JSON.parse(history.seat || "[]");
                        seatList.forEach(({ number, type }, index) => {
                          const seat = seatList[index];
                          seatMap.set(number, {
                            type,
                            id: history?.id,
                            original: seatList,
                            arrayNo: index,
                            name: seat?.name || history?.name,
                            address: seat?.address || history?.address,
                            phone: seat?.phone || history?.phone,
                            nrc: seat?.nrc || history?.nrc,
                            note: seat?.note || history?.note,
                            business_name:
                              history?.agent?.business_name || null,
                            total: history?.total || 0,
                            commission: history?.commission || 0,
                            seat: history?.seat,
                          });
                        });
                      });

                      const layout = seatLayout.split(":").map(Number);
                      const rowSize = layout.reduce((a, b) => a + b, 0);
                      const rows = Math.ceil(totalSeats / rowSize);

                      const seatCells = [];

                      let seatNo = 1;
                      for (let r = 0; r < rows; r++) {
                        const row = [];

                        for (let i = 0; i < layout[0]; i++) {
                          if (seatNo > totalSeats) break;
                          const seatInfo = seatMap.get(seatNo);
                          row.push(
                            <Box
                              key={`seat-${seatNo}`}
                              sx={{
                                width: 220,
                                height: 200,
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                p: 1,
                                textAlign: "center",
                                bgcolor: seatInfo ? "#e0f7fa" : "#ffeaea",
                                cursor: seatInfo ? "pointer" : "default",
                              }}
                              onClick={() => {
                                console.log(seatInfo);
                                if (seatInfo) {
                                  setSelectedSeat(seatInfo);
                                  setFormData({
                                    name: seatInfo.name || "",
                                    phone: seatInfo.phone || "",
                                    nrc: seatInfo.nrc || "",
                                    address: seatInfo.address || "",
                                    note: seatInfo.note || "",
                                  });
                                  setOpenModal(true);

                                  dispatch(
                                    updateBookingInformation({
                                      bookerName: seatInfo.name,
                                      phone: seatInfo.phone,
                                      selectedSeat: seatInfo.original,
                                      selectedRoute: payload.route,
                                      selectedDate: payload.start_date,
                                      nrc: seatInfo.nrc,
                                      specialRequest: seatInfo.specialRequest,
                                      commission: seatInfo.commission,
                                      totalAmount: seatInfo.total,
                                    })
                                  );
                                }
                              }}
                            >
                              <strong>Seat {seatNo}</strong>
                              <br />
                              {seatInfo ? (
                                <>
                                  <Chip
                                    label={seatInfo.type}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                  <br />
                                  <small>🧑‍💼 {seatInfo.name}</small>
                                  <br />
                                  <small>📞 {seatInfo.phone}</small>
                                  <br />
                                  <small>🆔 {seatInfo.nrc}</small>
                                  <br />
                                  {seatInfo?.address && (
                                    <small>🏠 {seatInfo?.address}</small>
                                  )}
                                  {seatInfo?.address && <br />}
                                  <small>📝 {seatInfo.note}</small>
                                  <small>
                                    {seatInfo?.business_name && (
                                      <>
                                        <hr />
                                        <small>
                                          🏢 {seatInfo.business_name}
                                        </small>
                                      </>
                                    )}
                                  </small>
                                </>
                              ) : (
                                <em>Empty</em>
                              )}
                            </Box>
                          );
                          seatNo++;
                        }

                        row.push(<Box key={`gap-${r}`} sx={{ width: 30 }} />);

                        for (let i = 0; i < layout[1]; i++) {
                          if (seatNo > totalSeats) break;
                          const seatInfo = seatMap.get(seatNo);
                          row.push(
                            <Box
                              key={`seat-${seatNo}`}
                              sx={{
                                width: 220,
                                height: 190,
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                p: 1,
                                textAlign: "center",
                                bgcolor: seatInfo ? "#e0f7fa" : "#ffeaea",
                                cursor: seatInfo ? "pointer" : "default",
                              }}
                              onClick={() => {
                                console.log(seatInfo);
                                if (seatInfo) {
                                  setSelectedSeat(seatInfo);
                                  setFormData({
                                    name: seatInfo.name || "",
                                    phone: seatInfo.phone || "",
                                    nrc: seatInfo.nrc || "",
                                    address: seatInfo.address || "",
                                    note: seatInfo.note || "",
                                  });
                                  setOpenModal(true);
                                }
                              }}
                            >
                              <strong>Seat {seatNo}</strong>
                              <br />
                              {seatInfo ? (
                                <>
                                  <Chip
                                    label={seatInfo.type}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                  <br />
                                  <small>🧑‍💼 {seatInfo.name}</small>
                                  <br />
                                  <small>📞 {seatInfo.phone}</small>
                                  <br />
                                  <small>🆔 {seatInfo.nrc}</small>
                                  <br />
                                  <small>📝 {seatInfo.note}</small>
                                </>
                              ) : (
                                <em>Empty</em>
                              )}
                            </Box>
                          );
                          seatNo++;
                        }

                        seatCells.push(
                          <Box
                            key={`row-${r}`}
                            sx={{ display: "flex", gap: 1 }}
                          >
                            {row}
                          </Box>
                        );
                      }

                      return seatCells;
                    })()}
                  </Box>
                </Grid>
              </Paper>
            ))
          )}
        </Grid> */}

        {/* <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Passenger Information</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              label="Phone"
              fullWidth
              margin="normal"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <TextField
              label="NRC"
              fullWidth
              margin="normal"
              value={formData.nrc}
              onChange={(e) =>
                setFormData({ ...formData, nrc: e.target.value })
              }
            />
            <TextField
              label="Address"
              fullWidth
              margin="normal"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
            <TextField
              label="Note"
              fullWidth
              margin="normal"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                UpdateSubmit();
                console.log("Update data:", formData);
                setOpenModal(false);
              }}
              variant="contained"
            >
              Update
            </Button>
          </DialogActions>
        </Dialog> */}
      </div>
    </>
  );
};

{
  /* <Grid
              xs={12}
              md={12}
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                mt: 2,
                px: 3,
                justifyContent: "center",
              }}
            >
              <Button
                variant={layout === "standard" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setLayout("standard")}
              >
                Standard Layout
              </Button>
              <Button
                variant={layout === "vip" ? "contained" : "outlined"}
                color="secondary"
                onClick={() => setLayout("vip")}
              >
                VIP Layout
              </Button>
            </Grid> */
}
