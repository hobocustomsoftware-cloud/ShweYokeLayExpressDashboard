import {
  Box,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Breadcrumb } from "../../../shares/Breadcrumbs";
import FormMainAction from "../../../shares/FormMainAction";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { dailyRoutePayload } from "../dailyRoutePayload";
import { dailyRouteService } from "../dailyRouteService";
import dayjs from "dayjs";
import { formBuilder } from "../../../helpers/formBuilder";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";

export const DailyRouteUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [payload, setPayload] = useState(dailyRoutePayload.update);
  const { dailyRoute } = useSelector((state) => state.dailyRoute);
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const seatLayoutRef = useRef(null);

  const submitDailyRoute = async () => {
    setLoading(true);
    try {
      const formData = formBuilder(payload, dailyRoutePayload.update);
      const response = await dailyRouteService.update(
        dispatch,
        params.id,
        formData
      );
      if (response.status === 200) {
        navigate(paths.dailyRoute);
      }
    } catch (error) {
      console.error("Error occurred while submitting:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    await dailyRouteService.show(dispatch, params.id);
    setLoading(false);
  }, [dispatch, params.id]);

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    if (dailyRoute) {
      const updatePayload = { ...dailyRoute };
      setPayload(updatePayload);
    }
  }, [dailyRoute]);

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    // Prevent duplicate driver/subdriver
    if (field === "subdriver_name" && value === payload.driver_name) {
      setErrors((prev) => ({
        ...prev,
        subdriver_name: "Sub driver cannot be the same as driver",
      }));
    }
    // Prevent duplicate spare/subspare
    else if (field === "subspare_name" && value === payload.spare_name) {
      setErrors((prev) => ({
        ...prev,
        subspare_name: "Sub spare cannot be the same as spare",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    payloadHandler(payload, value, field, (updateValue) => {
      setPayload(updateValue);
    });
  };

  const formatSeatLabel = (seatNumber, seatsPerRow) => {
    const index = seatNumber - 1; // convert seat number back to 0-based index
    const rowIndex = Math.floor(index / seatsPerRow);
    const seatIndex = index % seatsPerRow;
    const rowLetter = String.fromCharCode(65 + rowIndex);
    const seatNum = seatsPerRow - seatIndex;
    return `${rowLetter}${seatNum}`;
  };

  const totalSeats = payload?.dailyRoute?.route?.vehicles_type?.total_seat || 0;
  console.log("payload >>> ", payload?.dailyRoute);

  return (
    <>
      <div className="flex flex-col w-full">
        <Breadcrumb />

        <Paper elevation={3} style={{ padding: 20, margin: 0 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Driver Name</InputLabel>
                <Select
                  value={payload.driver_name || ""}
                  onChange={(e) => handleChange("driver_name", e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Driver</em>
                  </MenuItem>
                  {dailyRoute?.driver?.map((drv) => (
                    <MenuItem key={drv.id} value={drv.name}>
                      {drv.name}
                    </MenuItem>
                  ))}
                </Select>
                <ValidationMessage
                  field="driver_name"
                  message={errors.driver_name}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Sub Driver Name</InputLabel>
                <Select
                  value={payload.subdriver_name || ""}
                  onChange={(e) =>
                    handleChange("subdriver_name", e.target.value)
                  }
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Sub Driver</em>
                  </MenuItem>
                  {dailyRoute?.driver
                    ?.filter((drv) => drv.name !== payload.driver_name) // exclude selected driver
                    .map((drv) => (
                      <MenuItem key={drv.id} value={drv.name}>
                        {drv.name}
                      </MenuItem>
                    ))}
                </Select>
                <ValidationMessage
                  field="subdriver_name"
                  message={errors.subdriver_name}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Spare Name</InputLabel>
                <Select
                  value={payload.spare_name || ""}
                  onChange={(e) => handleChange("spare_name", e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Spare</em>
                  </MenuItem>
                  {dailyRoute?.spare?.map((sp) => (
                    <MenuItem key={sp.id} value={sp.name}>
                      {sp.name}
                    </MenuItem>
                  ))}
                </Select>
                <ValidationMessage
                  field="spare_name"
                  message={errors.spare_name}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Sub Spare Name</InputLabel>
                <Select
                  value={payload.subspare_name || ""}
                  onChange={(e) =>
                    handleChange("subspare_name", e.target.value)
                  }
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Sub Spare</em>
                  </MenuItem>
                  {dailyRoute?.subspare
                    ?.filter((sp) => sp.name !== payload.spare_name) // exclude selected spare
                    .map((sp) => (
                      <MenuItem key={sp.id} value={sp.name}>
                        {sp.name}
                      </MenuItem>
                    ))}
                </Select>
                <ValidationMessage
                  field="subspare_name"
                  message={errors.subspare_name}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Car Number (required)</InputLabel>
                <Select
                  value={payload.car_no || ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "car_no",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Car Number</em>
                  </MenuItem>
                  {dailyRoute?.car?.map((car) => (
                    <MenuItem key={car.id} value={car.name}>
                      {car.name}
                    </MenuItem>
                  ))}
                </Select>
                <ValidationMessage field={"car_no"} />
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

            {/* download pdf */}
            <Grid item xs={12}>
              <button
                onClick={async () => {
                  setPdfLoading(true);

                  if (!seatLayoutRef.current) return;

                  // Use ref instead of getElementById
                  const canvas = await html2canvas(seatLayoutRef.current, {
                    scale: 3, // lower scale = smaller file size
                    useCORS: true, // ensures images/fonts load properly
                    logging: false,
                  });

                  const imgData = canvas.toDataURL("image/jpeg", 0.8); // JPEG smaller than PNG

                  const pdf = new jsPDF("p", "mm", [356, 216]);
                  const pageWidth = 216;
                  const pageHeight = 356;
                  const marginTop = 3;
                  // const marginTop = 45;
                  const marginSide = 3;

                  const imgProps = pdf.getImageProperties(imgData);
                  const imgWidth = imgProps.width;
                  const imgHeight = imgProps.height;

                  const maxWidth = pageWidth - marginSide * 2;
                  const maxHeight = pageHeight - marginTop - 20;
                  const scale = Math.min(
                    maxWidth / imgWidth,
                    maxHeight / imgHeight
                  );

                  const finalWidth = imgWidth * scale;
                  const finalHeight = imgHeight * scale;

                  pdf.setFontSize(32);
                  const x = (pageWidth - finalWidth) / 2;
                  const y = marginTop;
                  pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight);

                  pdf.save("vehicle-seat-layout-legal.pdf");
                  setPdfLoading(false);
                }}
                className={`px-4 py-2 bg-[#1976d2] text-white border-none rounded-md cursor-pointer mb-2 hover:bg-[#0d7ff0ff] ${
                  pdfLoading ? "bg-yellow-500" : ""
                }`}
              >
                Download PDF (Legal)
              </button>
            </Grid>

            {/* download csv */}
            <Grid item xs={12}>
              <button
                onClick={() => {
                  // Map seatNo → passenger info
                  const seatMap = new Map();
                  payload?.dailyRoute?.payment_histories?.forEach((history) => {
                    const seatList = JSON.parse(history.seat || "[]");
                    seatList.forEach(({ number, type }) => {
                      seatMap.set(number, {
                        type,
                        name: history.name,
                        phone: history.phone,
                        nrc: history.nrc,
                        address: history.address,
                        note: history.note,
                      });
                    });
                  });

                  // Build CSV rows
                  const headers = [
                    "Seat No",
                    "Gender",
                    "Name",
                    "Phone",
                    "NRC",
                    "Address",
                    "Note",
                  ];

                  const rows = [headers];

                  for (let seatNo = 1; seatNo <= totalSeats; seatNo++) {
                    const seatInfo = seatMap.get(seatNo);
                    rows.push([
                      seatNo,
                      seatInfo?.type?.toUpperCase() || "-",
                      seatInfo?.name || "-",
                      seatInfo?.phone || "-",
                      seatInfo?.nrc || "-",
                      seatInfo?.address || "-",
                      seatInfo?.note || "-",
                    ]);
                  }

                  // Convert to CSV string
                  const csvContent = rows
                    .map((row) =>
                      row
                        .map((cell) =>
                          typeof cell === "string" && cell.includes(",")
                            ? `"${cell}"` // quote if contains comma
                            : cell
                        )
                        .join(",")
                    )
                    .join("\n");

                  // Trigger download
                  const blob = new Blob([csvContent], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", "vehicle-seat-layout.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 bg-green-600 text-white border-none rounded-md cursor-pointer mb-2 hover:bg-green-700"
              >
                Export CSV
              </button>
            </Grid>

            <Grid item xs={12} sx={{ overflow: "scroll" }}>
              <InputLabel>Vehicle Seat Layout</InputLabel>
              <Box
                id="seat-layout-pdf"
                ref={seatLayoutRef}
                sx={{
                  display: "flex",
                  width: "full",
                  flexDirection: "column",
                  gap: 1,
                  mt: 2,
                  minWidth: 2400,
                }}
              >
                <div
                  className="text-base md:text-xl lg:text-3xl"
                  style={{ fontFamily: "'Pyidaungsu', sans-serif" }}
                >
                  <div>
                    {`Date: ${
                      dayjs(payload?.dailyRoute?.start_date).format(
                        "DD MMM YYYY"
                      ) || "-"
                    }`}
                  </div>
                  <div className="flex gap-3 pb-2">
                    <div className="w-1/2">
                      {`Route: ${payload?.dailyRoute?.route?.name || "-"}
                      ${
                        payload?.dailyRoute?.route?.vehicles_type?.name || "-"
                      } (
                      ${payload?.dailyRoute?.route?.departure || "-"}) `}
                    </div>
                    <div className="w-1/2">
                      {`Car Number: ${payload?.dailyRoute?.car_no || "-"}`}
                    </div>
                  </div>
                  <div className="flex gap-3 pb-2">
                    <div className="w-1/2">
                      {`Driver Name: ${
                        payload?.dailyRoute?.driver_name || "-"
                      }`}
                    </div>
                    <div className="w-1/2">
                      {`Secondary Driver Name: ${
                        payload?.dailyRoute?.subdriver_name || "-"
                      }`}
                    </div>
                  </div>
                  <div className="flex gap-3 pb-2">
                    <div className="w-1/2">
                      {`Spare Name: ${payload?.dailyRoute?.spare_name || "-"}`}
                    </div>
                    <div className="w-1/2">
                      {`Secondary Spare Name: ${
                        payload?.dailyRoute?.subspare_name || "-"
                      }`}
                    </div>
                  </div>
                </div>
                {(() => {
                  const seatLayout =
                    payload?.dailyRoute?.route?.vehicles_type?.seat_layout ||
                    "2:1";
                  // const totalSeats =
                  //   payload?.route?.vehicles_type?.total_seat || 0;
                  const seatMap = new Map();

                  payload?.dailyRoute?.payment_histories?.forEach((history) => {
                    const seatList = JSON.parse(history.seat || "[]");
                    seatList.forEach(({ number, type }) => {
                      seatMap.set(number, {
                        type,
                        name: history.name,
                        phone: history.phone,
                        nrc: history.nrc,
                        note: history.note,
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
                            // width: 550, // bigger block
                            // height: 350, // bigger block
                            minWidth: { xs: 300, sm: 350, md: 450, lg: 600 },
                            height: { xs: 300, sm: 350, md: 400, lg: 400 },
                            border: "1px solid #ccc",
                            borderRadius: 2,
                            p: 1,
                            bgcolor: seatInfo ? "#e0f7fa" : "#ffeaea",
                          }}
                        >
                          <div className="text-center font-bold text-base md:text-xl lg:text-3xl">
                            {seatLayout === "2:1"
                              ? formatSeatLabel(seatNo, 3)
                              : seatNo}
                          </div>
                          {seatInfo ? (
                            <>
                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                ⚥ {seatInfo.type.toUpperCase()}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                🧑‍💼 {seatInfo.name}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                📞 {seatInfo.phone}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                🆔 {seatInfo.nrc}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                🏠 {seatInfo.address || "-"}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                📝 {seatInfo.note}
                              </div>
                            </>
                          ) : (
                            ""
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
                            // width: 550, // bigger block
                            // height: 350, // bigger block
                            minWidth: { xs: 300, sm: 350, md: 450, lg: 600 },
                            height: { xs: 300, sm: 350, md: 400, lg: 400 },
                            border: "1px solid #ccc",
                            borderRadius: 2,
                            p: 1,
                            bgcolor: seatInfo ? "#e0f7fa" : "#ffeaea",
                          }}
                        >
                          <div className="text-center text-base md:text-xl lg:text-3xl font-bold">
                            {seatLayout === "2:1"
                              ? formatSeatLabel(seatNo, 3)
                              : seatNo}
                          </div>
                          {seatInfo ? (
                            <>
                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                ⚥ {seatInfo.type.toUpperCase()}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                🧑‍💼 {seatInfo.name}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                📞 {seatInfo.phone}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                🆔 {seatInfo.nrc}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                🏠 {seatInfo.address || "-"}
                              </div>

                              <div className="text-base md:text-xl lg:text-3xl pt-3">
                                📝 {seatInfo.note}
                              </div>
                            </>
                          ) : (
                            ""
                          )}
                        </Box>
                      );
                      seatNo++;
                    }

                    seatCells.push(
                      <Box key={`row-${r}`} sx={{ display: "flex", gap: 1 }}>
                        {row}
                      </Box>
                    );
                  }

                  return seatCells;
                })()}
              </Box>
            </Grid>

            <FormMainAction
              cancel="Cancle"
              cancelClick={() => navigate(paths.dailyRoute)}
              submit="Update"
              submitClick={submitDailyRoute}
              loading={loading}
            />
          </Grid>
        </Paper>
      </div>
    </>
  );
};
