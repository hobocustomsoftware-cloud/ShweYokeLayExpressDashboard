import {
  Box,
  Chip,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Switch,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Breadcrumb } from "../../../shares/Breadcrumbs";
import FormMainAction from "../../../shares/FormMainAction";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { endpoints } from "../../../constants/endpoints";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { routesPayload } from "../routesPayload";
import { routesService } from "../routesService";

export const RoutesUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(routesPayload.update);
  const [vehiclesType, setVehiclesType] = useState([]);
  const [counter, setCounter] = useState([]);
  const [startingPointOptions, setStartingPointOptions] = useState([]);
  const [endingPointOptions, setEndingPointOptions] = useState([]);
  const allDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [selectedDays, setSelectedDays] = useState([]);
  const { routesData } = useSelector((state) => state.routes);

  const params = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      const newDay = selectedDays.filter((d) => d !== day);
      setSelectedDays(newDay);
      payloadHandler(payload, newDay, "day_off", (updatedValue) =>
        setPayload(updatedValue)
      );
    } else {
      const newDay = [...selectedDays, day.trim()];
      setSelectedDays(newDay);
      payloadHandler(payload, newDay, "day_off", (updatedValue) =>
        setPayload(updatedValue)
      );
    }
  };

  const submitRoute = async () => {
    setLoading(true);
    if (payload.day_off && Array.isArray(payload.day_off)) {
      payload.day_off = JSON.stringify(payload.day_off);
    }
    try {
      const create = await routesService.update(dispatch, params.id, payload);

      if (create.status === 200) {
        navigate(paths.routes);
      }
    } catch (error) {
      console.error("Error occurred while submitting:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    const result = await routesService.show(dispatch, params.id);
    let dayOff = result?.data?.day_off;
    if (typeof dayOff === "string") {
      try {
        dayOff = JSON.parse(dayOff);
      } catch (e) {
        dayOff = [];
      }
    }

    if (Array.isArray(dayOff)) {
      dayOff = dayOff
        .filter(
          (day) => typeof day === "string" && allDays.includes(day.trim())
        )
        .map((day) => day.trim());
    } else {
      dayOff = [];
    }
    setSelectedDays(dayOff);

    const vehiclesTypeResult = await getRequest(`${endpoints.vehiclesType}`);
    if (vehiclesTypeResult.status === 200) {
      setVehiclesType(vehiclesTypeResult.data);
    }
    const counterResult = await getRequest(`${endpoints.counter}`);
    if (counterResult.status === 200) {
      // console.log("counterResult", counterResult);
      setCounter(counterResult.data);
      setStartingPointOptions(counterResult.data);
      setEndingPointOptions(counterResult.data);
    }
    setLoading(false);
  }, [dispatch, params.id]);

  // console.log(startingPointOptions, "startingPointOptions");
  // console.log(endingPointOptions, "endingPointOptions");

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    if (routesData) {
      // console.log("routesData", routesData);
      // const updatePayload = { ...routesData };
      const updatePayload = {
        id: routesData?.id,
        name: routesData?.name,
        vehicles_type_id: routesData?.vehicles_type_id,
        starting_point: Array.isArray(routesData?.starting_point)
          ? routesData?.starting_point
          : [],
        ending_point: Array.isArray(routesData?.ending_point)
          ? routesData?.ending_point
          : [],
        day_off: routesData?.day_off,
        distance: routesData?.distance,
        duration: routesData?.duration,
        is_ac: routesData?.is_ac,

        price: routesData?.price,
        fprice: routesData?.fprice,
        last_min: routesData?.last_min,
        cancle_booking: routesData?.cancle_booking,
        departure: routesData?.departure,
        arrivals: routesData?.arrivals,
        status: routesData?.status,
      };
      updatePayload.file_path = null;
      setPayload(updatePayload);
    }
  }, [routesData]);

  useEffect(() => {
    const selectedEndingPoints = payload.ending_point || [];
    setStartingPointOptions(
      counter.filter((point) => !selectedEndingPoints.includes(point.id))
    );
  }, [payload.ending_point, counter]);

  useEffect(() => {
    const selectedStartingPoints = payload.starting_point || [];
    setEndingPointOptions(
      counter.filter((point) => !selectedStartingPoints.includes(point.id))
    );
  }, [payload.starting_point, counter]);

  return (
    <>
      <div className="grid">
        <div className="mb-5">
          <Breadcrumb />
        </div>
        <Paper elevation={3} style={{ padding: 20 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Name (required)</InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.name ? payload.name : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "name",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="name"
                  placeholder="Enter Routes Name"
                />
                <ValidationMessage field={"name"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Choose Vehicles Type (required) </InputLabel>
                <Select
                  id="vehicles_type_id"
                  value={
                    payload.vehicles_type_id ? payload.vehicles_type_id : ""
                  }
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "vehicles_type_id",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="vehicles_type_id"
                >
                  {vehiclesType.map((value, index) => {
                    return (
                      <MenuItem
                        key={`vehicles_type_id${index}`}
                        value={value.id}
                      >
                        {" "}
                        {value.name}{" "}
                      </MenuItem>
                    );
                  })}
                </Select>
                <ValidationMessage field={"vehicles_type_id"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Choose Starting Point (required) </InputLabel>
                <Select
                  id="starting_point"
                  multiple
                  value={payload.starting_point || []} // must be array of IDs
                  onChange={(e) => {
                    const newValue = Array.from(new Set(e.target.value)); // deduplicate
                    payloadHandler(
                      payload,
                      newValue,
                      "starting_point",
                      setPayload
                    );
                  }}
                  name="starting_point"
                  renderValue={(selected) => {
                    const uniqueSelected = [...new Set(selected)];
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {uniqueSelected.map((id) => {
                          const option = startingPointOptions.find(
                            (opt) => opt.id === id
                          );
                          return (
                            <Chip
                              key={id}
                              label={option?.name}
                              onDelete={() => {
                                const newValue = (
                                  payload.starting_point || []
                                ).filter((item) => item !== id);
                                payloadHandler(
                                  payload,
                                  newValue,
                                  "starting_point",
                                  setPayload
                                );
                              }}
                            />
                          );
                        })}
                      </Box>
                    );
                  }}
                >
                  {startingPointOptions.map((value) => (
                    <MenuItem
                      key={`starting_point${value.id}`}
                      value={value.id}
                    >
                      {value.name}
                    </MenuItem>
                  ))}
                </Select>

                <ValidationMessage field={"starting_point"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Choose Ending Point (required) </InputLabel>
                <Select
                  id="ending_point"
                  multiple
                  value={payload.ending_point || []} // must be array of IDs
                  onChange={(e) => {
                    const newValue = Array.from(new Set(e.target.value)); // deduplicate
                    payloadHandler(
                      payload,
                      newValue,
                      "ending_point",
                      setPayload
                    );
                  }}
                  name="ending_point"
                  renderValue={(selected) => {
                    const uniqueSelected = [...new Set(selected)];
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {uniqueSelected.map((id) => {
                          const option = endingPointOptions.find(
                            (opt) => opt.id === id
                          );
                          return (
                            <Chip
                              key={id}
                              label={option?.name}
                              onDelete={() => {
                                const newValue = (
                                  payload.ending_point || []
                                ).filter((item) => item !== id);
                                payloadHandler(
                                  payload,
                                  newValue,
                                  "ending_point",
                                  setPayload
                                );
                              }}
                            />
                          );
                        })}
                      </Box>
                    );
                  }}
                >
                  {endingPointOptions.map((value, index) => (
                    <MenuItem key={`ending_point${index}`} value={value.id}>
                      {value.name}
                    </MenuItem>
                  ))}
                </Select>
                <ValidationMessage field={"ending_point"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Distance (required)</InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.distance ? payload.distance : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "distance",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="distance"
                  placeholder="Enter Routes Distance"
                />
                <ValidationMessage field={"distance"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Duration (required)</InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.duration ? payload.duration : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "duration",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="duration"
                  placeholder="Enter Routes Duration"
                />
                <ValidationMessage field={"duration"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <InputLabel>Is AC (required)</InputLabel>
                <Switch
                  checked={payload.is_ac === "1"}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.checked ? "1" : "0",
                      "is_ac",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  inputProps={{ "aria-label": "Toggle Feature" }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Select Open Days</InputLabel>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "8px",
                  }}
                >
                  {allDays.map((day) => (
                    <Chip
                      key={day}
                      label={day}
                      clickable
                      onClick={() => toggleDay(day)}
                      color={selectedDays.includes(day) ? "primary" : "default"}
                      sx={{ margin: "4px" }}
                    />
                  ))}
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Local Price</InputLabel>
                <OutlinedInput
                  type="number"
                  value={payload.price ? payload.price : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "price",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="price"
                  placeholder="Ente Routes Local Price"
                />
                <ValidationMessage field={"price"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Foreigner Price</InputLabel>
                <OutlinedInput
                  type="number"
                  value={payload.fprice ? payload.fprice : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "fprice",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="fprice"
                  placeholder="Ente Routes Foreigner Price"
                />
                <ValidationMessage field={"fprice"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Last Min For Buying</InputLabel>
                <OutlinedInput
                  type="number"
                  value={payload.last_min ? payload.last_min : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "last_min",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="last_min"
                  placeholder="Ente Routes Price"
                />
                <ValidationMessage field={"last_min"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Cancle Booking Day</InputLabel>
                <OutlinedInput
                  type="number"
                  value={payload.cancle_booking ? payload.cancle_booking : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "cancle_booking",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="cancle_booking"
                  placeholder="Ente Routes Price"
                />
                <ValidationMessage field={"cancle_booking"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Departure (required)</InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.departure ? payload.departure : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "departure",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="departure"
                  placeholder="Enter Routes Departure"
                />
                <ValidationMessage field={"departure"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Arrivals (required)</InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.arrivals ? payload.arrivals : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "arrivals",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="arrivals"
                  placeholder="Enter Routes Arrivals"
                />
                <ValidationMessage field={"arrivals"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Status (required)</InputLabel>
                <Select
                  id="status"
                  value={payload.status ? payload.status : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "status",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
                <ValidationMessage field={"status"} />
              </Stack>
            </Grid>

            <FormMainAction
              cancel="Cancle"
              cancelClick={() => navigate(paths.routes)}
              submit="Update"
              submitClick={submitRoute}
              loading={loading}
            />
          </Grid>
        </Paper>
      </div>
    </>
  );
};
