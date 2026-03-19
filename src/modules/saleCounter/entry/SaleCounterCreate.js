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
import {
  setSelectedRoute,
  updateBookingInformation,
} from "../bookingInformationSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import { SaleCounterPayload } from "../SaleCounterPayload";
import Ticket from "./Ticket";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import dayjs from "dayjs";
import { endpoints } from "../../../constants/endpoints";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { updateNotification } from "../../../shares/shareSlice";
import { useNavigate } from "react-router-dom";

export const SaleCounterCreate = () => {
  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [payload, setPayload] = useState(SaleCounterPayload.store);
  const [routes, setRoute] = useState([]);
  const [startingPointOptions, setStartingPointOptions] = useState([]);
  const [endingPointOptions, setEndingPointOptions] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const bookingInfo = useSelector((state) => state.bookingInformation);

  const handleSubmit = async (route) => {
    setLoading(true);

    if (!route) {
      console.log("no route found!");
    }
    dispatch(setSelectedRoute(route));

    const seats = (route.orders ?? []).flatMap((order) => {
      try {
        const parsedSeats = JSON.parse(order.seat);
        return parsedSeats.map((seat) => ({
          order_id: order?.id ?? null,
          number: seat?.number ?? null,
          type: seat?.type ?? "Unknown",
          sold: true,
          status: order?.status ?? null,
          order: order ?? null,
        }));
      } catch (error) {
        console.error("Error parsing seat JSON:", error);
        return [];
      }
    });
    dispatch(
      updateBookingInformation({
        bookedSeats: seats,
      })
    );
    setLoading(false);
    navigate(paths.seatSelectionPage);
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    const result = await getRequest(`${endpoints.counter}`);
    if (result.status === 200) {
      // setCounter(result.data);
      setStartingPointOptions(result.data);
      setEndingPointOptions(result.data);
    }
    setLoading(false);
  }, []);

  const userType = [{ name: "Local" }, { name: "Foreigner" }];

  const loadingRouteData = useCallback(
    async (payload) => {
      if (payload.starting_point === payload.ending_point) {
        return;
      }
      setRouteLoading(true);
      const routeResult = await getRequest(
        `${endpoints.saleCounterRouteSearch}`,
        payload
      );
      if (routeResult.status === 200) {
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

  useEffect(() => {
    if (payload.userType)
      dispatch(updateBookingInformation({ nationality: payload.userType }));
  }, [payload.userType, dispatch]);

  // useEffect(() => {
  //   if (
  //     bookingInfo?.selectedDate &&
  //     bookingInfo?.startingPoint &&
  //     bookingInfo?.endingPoint &&
  //     bookingInfo?.nationality &&
  //     bookingInfo?.startingPoint !== bookingInfo?.endingPoint
  //   ) {
  //     loadingRouteData({
  //       starting_point: bookingInfo.startingPoint,
  //       ending_point: bookingInfo.endingPoint,
  //       selected_date: bookingInfo.selectedDate,
  //       user_type: bookingInfo.nationality,
  //     });
  //   }
  // }, [bookingInfo, loadingRouteData]);

  useEffect(() => {
    if (payload.starting_point === payload.ending_point) {
      dispatch(
        updateNotification({
          variant: "warning",
          message: "ဂိတ်စနှင့် ဂိတ်ဆုံး မတူရပါ။",
        })
      );
    }
  }, [
    loadingRouteData,
    payload.starting_point,
    payload.ending_point,
    dispatch,
  ]);

  useEffect(() => {
    if (!bookingInfo?.startingPoint && payload.starting_point) {
      dispatch(
        updateBookingInformation({ startingPoint: payload.starting_point })
      );
    }
  }, [payload.starting_point, bookingInfo?.startingPoint, dispatch]);

  useEffect(() => {
    if (!bookingInfo?.endingPoint && payload.ending_point) {
      dispatch(updateBookingInformation({ endingPoint: payload.ending_point }));
    }
  }, [payload.ending_point, bookingInfo?.endingPoint, dispatch]);

  useEffect(() => {
    if (!bookingInfo?.selectedDate && payload.selectedDate) {
      dispatch(
        updateBookingInformation({ selectedDate: payload.selectedDate })
      );
    }
  }, [payload.selectedDate, bookingInfo?.selectedDate, dispatch]);

  useEffect(() => {
    if (!bookingInfo?.nationality && payload.userType) {
      dispatch(updateBookingInformation({ nationality: payload.userType }));
    }
  }, [payload.userType, bookingInfo?.nationality, dispatch]);

  // useEffect(() => {

  // }, submitClick, dispatch);

  const submitClick = () => {
    if (payload.starting_point === payload.ending_point) {
      dispatch(
        updateNotification({
          variant: "warning",
          message: "ဂိတ်စနှင့် ဂိတ်ဆုံး မတူရပါ။",
        })
      );
      return;
    }

    dispatch(
      updateBookingInformation({
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
      })
    );

    loadingRouteData({
      starting_point: payload.starting_point,
      ending_point: payload.ending_point,
      selected_date: payload.selectedDate,
      user_type: payload.userType,
    });
  };

  return (
    <>
      <div className=" grid">
        <Breadcrumb />

        <Paper elevation={3} style={{ padding: 20, marginBottom: 20 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Select Date</InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    minDate={dayjs().startOf("day")}
                    maxDate={dayjs().add(2, "month").endOf("month")}
                    value={
                      payload.selectedDate ? dayjs(payload.selectedDate) : null
                    }
                    onChange={(newValue) =>
                      payloadHandler(
                        payload,
                        newValue ? newValue.format("YYYY-MM-DD") : "",
                        "selectedDate",
                        (updateValue) => {
                          setPayload(updateValue);
                        }
                      )
                    }
                    slotProps={{
                      textField: { size: "medium", placeholder: "Choose Date" },
                    }}
                  />
                </LocalizationProvider>
                <ValidationMessage field={"selectedDate"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Choose Starting Point </InputLabel>
                <Select
                  id="starting_point"
                  value={payload.starting_point}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "starting_point",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="starting_point"
                >
                  {startingPointOptions.map((value, index) => {
                    return (
                      <MenuItem key={`starting_point${index}`} value={value.id}>
                        {" "}
                        {value.name}{" "}
                      </MenuItem>
                    );
                  })}
                </Select>
                <ValidationMessage field={"starting_point"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Choose Ending Ponit </InputLabel>
                <Select
                  id="ending_point"
                  value={payload.ending_point}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "ending_point",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="ending_point"
                >
                  {endingPointOptions.map((value, index) => {
                    return (
                      <MenuItem key={`ending_point${index}`} value={value.id}>
                        {" "}
                        {value.name}{" "}
                      </MenuItem>
                    );
                  })}
                </Select>
                <ValidationMessage field={"ending_point"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Passenger Type </InputLabel>
                <Select
                  id="userType"
                  value={payload.userType}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "userType",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="userType"
                >
                  {userType.map((value, index) => {
                    return (
                      <MenuItem
                        key={`userType${index}`}
                        value={value.name.toLowerCase()}
                      >
                        {value.name}
                      </MenuItem>
                    );
                  })}
                </Select>
                <ValidationMessage field={"userType"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={12}>
              <Stack
                justifyContent="flex-end"
                alignItems="center"
                spacing={1}
                direction="row"
                useFlexGap
                flexWrap="wrap"
              >
                <Button
                  disabled={loading}
                  onClick={submitClick}
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Search
                </Button>
              </Stack>
            </Grid>

            {/* <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Choose Routes</InputLabel>
                <Select
                  disabled={
                    routeLoading ||
                    !payload.selectedDate ||
                    !payload.vehicles_type_id
                  }
                  id="choseRoute"
                  value={payload.choseRoute}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "choseRoute",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="choseRoute"
                >
                  {routeLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
                    </MenuItem>
                  ) : (
                    Array.isArray(choseRoute) &&
                    choseRoute.map((value, index) => (
                      <MenuItem key={`choseRoute${index}`} value={value.id}>
                        {`${value.name} (${formatTo12Hour(value.departure)} - ${
                          value.vehicles_type.name
                        })`}
                      </MenuItem>
                    ))
                  )}
                </Select>
                <ValidationMessage field={"choseRoute"} />
              </Stack>
            </Grid> */}

            {/* <FormMainAction
              cancel="Cancle"
              cancelClick={() => navigate(paths.paymentHistory)}
              submit="Search"
              submitClick={handleSubmit}
              loading={loading || routeLoading}
            /> */}
          </Grid>
        </Paper>

        {routeLoading ? (
          <div className="flex justify-center items-center py-5">
            <p className="text-gray-500 animate-pulse">Loading...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {routes && routes.length > 0 ? (
              routes?.map((route, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(route);
                  }}
                >
                  <Ticket value={route} />
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500">No routes available.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};
