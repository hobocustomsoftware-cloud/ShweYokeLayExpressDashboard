import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  formatDateToDateTime,
  formatTo12Hour,
  formatUtcToYangon,
} from "../../../helpers/datetime";
import { getRequest, postRequest } from "../../../helpers/api";
import {
  resetBookingInformation,
  setSelectedRoute,
  updateBookingInformation,
} from "../bookingInformationSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import CircularProgress from "@mui/material/CircularProgress";
import FormMainAction from "../../../shares/FormMainAction";
import { PermissionGate } from "../../../helpers/PermissionGate";
import { SaleCounterPayload } from "../SaleCounterPayload";
import { SaleCounterService } from "../SaleCounterService";
import StandardSeatLayout from "../../../helpers/StandardSeatLayout";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import VipSeatLayout from "../../../helpers/VipSeatLayout";
import dayjs from "dayjs";
import { endpoints } from "../../../constants/endpoints";
import { formBuilder } from "../../../helpers/formBuilder";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { paymentHistoryService } from "../../paymentHistory/paymentHistoryService";
import { roleService } from "../../role/roleService";
import { seatTypeColors } from "../../../helpers/otherHelpers";
import { update } from "../SaleCounterSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export const SaleCheckPage = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(SaleCounterPayload.check);
  const [vehiclesType, setVehiclesType] = useState([]);
  const [data, setData] = useState([]);
  const [before, setBefore] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const { userRole } = useSelector((state) => state.bookingInformation);
  const role = useSelector((state) => state.share.role);
  const userPermissions = useSelector((state) => state.share.permissions);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nrc: "",
    address: "",
    note: "",
    saleCounterName: "",
    agentName: "",
    kpayMemberId: "",
    memberId: "",
    createdAt: "",
    seatNumber: null,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const UpdateSubmit = async () => {
    try {
      setLoading(true);

      // ✅ ALWAYS use formData as source of truth
      const updatedSeatList = [...formData.uiSeat];

      // ✅ Find seat by seatNumber (NOT arrayNo)
      const seatIndex = updatedSeatList.findIndex(
        (s) => s.number === formData.seatNumber,
      );

      if (seatIndex === -1) {
        toast.error("Seat not found");
        setLoading(false);
        return;
      }

      // ✅ Update ONLY the selected seat
      updatedSeatList[seatIndex] = {
        ...updatedSeatList[seatIndex],
        name: formData.name,
        phone: formData.phone,
        nrc: formData.nrc,
        address: formData.address,
        note: formData.note,
      };

      const formDataObj = new FormData();
      formDataObj.append("seat", JSON.stringify(updatedSeatList));

      const result = await postRequest(
        `${endpoints.paymentHistory}/${formData.id}`,
        formDataObj,
      );

      if (result?.status === 200) {
        toast.success("Updated successfully");
        submitGenre();
        setOpenModal(false);
      } else {
        toast.error("Update failed");
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Error updating seat!");
      setLoading(false);
    }
  };

  const submitGenre = async (e) => {
    setLoading(true);
    const result = await SaleCounterService.check(dispatch, payload);
    if (result.status === 200) {
      setBefore(false);
      setData(result?.data);
      dispatch(
        updateBookingInformation({
          role: result?.data[0]?.role,
          permissions: result?.data[0]?.permissions,
        }),
      );
    }
    setLoading(false);
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    const permissionResult = await roleService.permission(dispatch);
    if (permissionResult.status === 200) {
      setPermissions(permissionResult.data || []);
    }
    const vehiclesTypeResult = await getRequest(`${endpoints.vehiclesType}`);
    if (vehiclesTypeResult.status === 200) {
      setVehiclesType(vehiclesTypeResult.data);
    }
    setLoading(false);
  }, []);

  // cancle ticket
  const rejectTicket = async (seatInfo) => {
    setLoading(true);
    // console.log("Booking id >>>", seatInfo.id);
    const paymentHistoryId = seatInfo.id;

    const reject = await paymentHistoryService.destory(
      dispatch,
      paymentHistoryId,
    );
    if (reject.status === 200) {
      loadingData();
      setOpenModal(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    if (!payload.start_date || !payload.end_date || !payload.vehicles_type_id) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [payload.start_date, payload.end_date, payload.vehicles_type_id]);

  const printTicket = () => {
    // 🟩 Set Redux bookingInformation for print
    dispatch(
      updateBookingInformation({
        bookerName: formData.name,
        phone: formData.phone,
        nrc: formData.nrc,
        specialRequest: formData.note,
        selectedSeat: selectedSeat.original,
        selectedRoute: payload.route,
        selectedDate: payload.start_date,
        commission: selectedSeat.commission,
        totalAmount: selectedSeat.total,
        userRole,
        permissions,
      }),
    );
    sessionStorage.setItem(
      "saleCheckState",
      JSON.stringify({ payload, formData, selectedSeat }),
    );
    navigate("/saleCounter/printTicket");
    navigate("/saleCounter/printTicket");
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("saleCheckState");
    if (!saved) return;

    const {
      payload: savedPayload,
      formData: savedFormData,
      selectedSeat: savedSeat,
    } = JSON.parse(saved);
    setPayload((prev) => ({ ...prev, ...savedPayload }));
    setFormData(savedFormData);
    setSelectedSeat(savedSeat);
  }, []);

  const formatSeatLabel = (seatNumber, seatsPerRow) => {
    const index = seatNumber - 1; // convert seat number back to 0-based index
    const rowIndex = Math.floor(index / seatsPerRow);
    const seatIndex = index % seatsPerRow;
    const rowLetter = String.fromCharCode(65 + rowIndex);
    const seatNum = seatsPerRow - seatIndex;
    return `${rowLetter}${seatNum}`;
  };
  // console.log("permission", permissions);
  // console.log("canEditCustomerInfo", canEditCustomerInfo);
  const canEditName =
    role === "SUPER_ADMIN" || userPermissions?.includes("Edit_Customer_Name");

  const canEditPhone =
    role === "SUPER_ADMIN" || userPermissions?.includes("Edit_Customer_Phone");

  const canEditNRC =
    role === "SUPER_ADMIN" || userPermissions?.includes("Edit_Customer_NRC");

  const canEditAddress =
    role === "SUPER_ADMIN" ||
    userPermissions?.includes("Edit_Customer_Address");

  const canEditNote =
    role === "SUPER_ADMIN" || userPermissions?.includes("Edit_Customer_Note");

  console.log("formData", formData);
  const getPlatform = () => {
    // console.log("form data >>>>>", formData.memberId);
    if (formData.agentName) return "Agent";
    if (formData.kpayMemberId !== null) return "KBZ Pay Mini-app";
    if (formData.memberId !== null) return "Website";
    return "Shwe Yoke Lay Counter";
  };

  // console.log("v type >  ", payload.vehicles_type_id);

  return (
    <>
      <Breadcrumb />

      <Paper elevation={3} style={{ padding: 20 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>From Date</InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={payload.start_date ? dayjs(payload.start_date) : null}
                  onChange={(newValue) =>
                    payloadHandler(
                      payload,
                      newValue ? newValue.format("YYYY-MM-DD") : "",
                      "start_date",
                      (updateValue) => setPayload(updateValue),
                    )
                  }
                  slotProps={{
                    textField: {
                      size: "medium",
                      placeholder: "Choose Date",
                      fullWidth: true, // make input stretch on small screens
                    },
                  }}
                />
              </LocalizationProvider>
              <ValidationMessage field={"start_date"} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>To Date</InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={payload.end_date ? dayjs(payload.end_date) : null}
                  onChange={(newValue) =>
                    payloadHandler(
                      payload,
                      newValue ? newValue.format("YYYY-MM-DD") : "",
                      "end_date",
                      (updateValue) => setPayload(updateValue),
                    )
                  }
                  slotProps={{
                    textField: {
                      size: "medium",
                      placeholder: "Choose Date",
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
              <ValidationMessage field={"end_date"} />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Choose Vehicles Type (required)</InputLabel>
              <Select
                id="vehicles_type_id"
                value={payload.vehicles_type_id}
                onChange={(e) =>
                  payloadHandler(
                    payload,
                    e.target.value,
                    "vehicles_type_id",
                    (updateValue) => setPayload(updateValue),
                  )
                }
                name="vehicles_type_id"
                fullWidth
              >
                {vehiclesType.map((value, index) => (
                  <MenuItem key={`vehicles_type_id${index}`} value={value.id}>
                    {value.name}
                  </MenuItem>
                ))}
              </Select>
              <ValidationMessage field={"vehicles_type_id"} />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <FormMainAction
              cancel="Cancel"
              cancelClick={() => navigate(paths.saleCheckPage)}
              submit="Search"
              submitClick={submitGenre}
              loading={loading}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid sx={{ overflow: "scroll" }}>
        {data.length === 0 && !before ? (
          <Grid item xs={12}>
            <Paper
              elevation={3}
              style={{
                marginTop: 20,
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
              style={{
                padding: 10,
                marginTop: 20,
                minWidth: 1200,
                overflow: "scroll",
              }}
              key={index}
            >
              <Grid item xs={12} key={index}>
                {/* upper box */}
                <div className="space-y-2">
                  <div className="flex">
                    <div className="w-1/6 font-medium">Route Name:</div>
                    <div className="w-5/6">
                      {payload?.route?.name} (
                      {payload?.route?.vehicles_type?.name})
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-1/6 font-medium">Departure:</div>
                    <div className="w-5/6">
                      {dayjs(payload?.start_date.trim()).format("DD MMM YYYY")}
                      &nbsp;&#40;{formatTo12Hour(payload?.route?.departure)}
                      &#41;
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-1/6 font-medium">Car No:</div>
                    <div className="w-5/6">{payload?.car_no}</div>
                  </div>

                  <div className="flex">
                    <div className="w-1/6 font-medium">Driver Name:</div>
                    <div className="w-5/6">{payload?.driver_name}</div>
                  </div>
                </div>
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
                      // console.log("History user> seat >>>", history.seat);
                      const seatList = JSON.parse(history.seat || "[]");
                      seatList.forEach(({ number, type }, index) => {
                        const seat = seatList[index];
                        seatMap.set(number, {
                          type,
                          id: history?.id,
                          original: seatList,
                          arrayNo: index,
                          name: seat?.name || history?.name || "",
                          address: seat?.address || history?.address,
                          phone: seat?.phone || history?.phone,
                          nrc: seat?.nrc || history?.nrc,
                          note: seat?.note || history?.note,
                          total: history?.total || 0,
                          commission: history?.commission || 0,
                          seat: history?.seat,
                          seatNumber: number,
                          agentName: history?.agent?.business_name || null,
                          saleCounterName: history?.user?.name,
                          kpayMemberId: history?.kpay_member_id || null,
                          memberId: history?.member_id || null,
                          createdAt: history?.created_at,
                          userName: seat?.user_name,
                          lockedAt: seat?.locked_at,
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
                              width: 400,
                              height: 260,
                              border: "1px solid #ccc",
                              borderRadius: 2,
                              p: 1,
                              bgcolor: seatInfo ? "#e0f7fa" : "#ffeaea",
                              cursor: seatInfo ? "pointer" : "default",
                            }}
                            onClick={() => {
                              // console.log("left seatInfo onclick", seatInfo);
                              if (seatInfo) {
                                setSelectedSeat(seatInfo);
                                setFormData({
                                  id: seatInfo.id,
                                  seat: seatInfo.seat,
                                  uiSeat: seatInfo.original,
                                  name: seatInfo.name || "",
                                  phone: seatInfo.phone || "",
                                  nrc: seatInfo.nrc || "",
                                  address: seatInfo.address || "",
                                  note: seatInfo.note || "",
                                  agentName: seatInfo?.agentName || null,
                                  saleCounterName:
                                    seatInfo?.saleCounterName || "-",
                                  kpayMemberId: seatInfo?.kpayMemberId || null,
                                  memberId: seatInfo?.memberId || null,
                                  createdAt: seatInfo?.createdAt,
                                  seatNumber: seatInfo.seatNumber,
                                  userId: seatInfo.userId,
                                  lockedAt: seatInfo.lockedAt,
                                });
                                setOpenModal(true);

                                dispatch(
                                  updateBookingInformation({
                                    bookerName: seatInfo.name,
                                    phone: seatInfo.phone,
                                    selectedSeat: seatInfo.seat,
                                    selectedRoute: payload.route,
                                    selectedDate: payload.start_date,
                                    nrc: seatInfo.nrc,
                                    specialRequest: seatInfo.specialRequest,
                                    commission: seatInfo.commission,
                                    totalAmount: seatInfo.total,
                                  }),
                                );
                              }
                            }}
                          >
                            <div className="text-center font-bold">
                              {seatLayout === "2:1"
                                ? formatSeatLabel(seatNo, 3)
                                : seatNo}
                            </div>
                            <br />

                            {seatInfo ? (
                              <>
                                <div className="text-sm pt-1">
                                  {seatInfo.type === "locked"
                                    ? `🔒 LOCKED`
                                    : `⚤ ${seatInfo.type.toUpperCase()}`}
                                </div>

                                <div className="text-sm pt-1">
                                  {seatInfo.type === "locked"
                                    ? `🧑‍💼`
                                    : `🧑‍💼 ${seatInfo.name}`}
                                </div>

                                <div className="text-sm pt-1">
                                  📞 {seatInfo.phone}
                                </div>

                                <div className="text-sm pt-1">
                                  🆔 {seatInfo.nrc}
                                </div>

                                <div className="text-sm pt-1">
                                  🏠 {seatInfo.address || "-"}
                                </div>

                                <div className="text-sm pt-1">
                                  📝 {seatInfo.note}
                                </div>

                                <small>
                                  {seatInfo?.agentName && (
                                    <>
                                      <div className="flex min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>
                                          Agent:&nbsp;
                                          {seatInfo.agentName &&
                                            seatInfo.agentName}
                                        </div>
                                        <div>
                                          {formatUtcToYangon(
                                            seatInfo.createdAt,
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  {seatInfo?.saleCounterName && (
                                    <>
                                      <div className="flex min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>
                                          🖨️ Counter: {seatInfo.saleCounterName}
                                        </div>
                                        <div>
                                          {formatUtcToYangon(
                                            seatInfo.createdAt,
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  {seatInfo?.kpayMemberId && (
                                    <>
                                      <div className="flex min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>KBZ Pay Mini-app</div>
                                        <div>
                                          {formatUtcToYangon(
                                            seatInfo.createdAt,
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {seatInfo?.memberId && (
                                    <>
                                      <div className="flex min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>🌐 Shwe Yoke Lay Website</div>
                                        <div>
                                          {formatUtcToYangon(
                                            seatInfo.createdAt,
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {seatInfo?.type === "locked" && (
                                    <>
                                      <div className="flex text-red-600 min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>
                                          🔒{" "}
                                          {seatInfo.type === "locked" &&
                                            (seatInfo.lockedAt
                                              ? `${seatInfo.userName} @ ${seatInfo.lockedAt}`
                                              : "")}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </small>
                              </>
                            ) : (
                              <div className="w-full h-[70%] flex justify-center items-center">
                                <div>Empty</div>
                              </div>
                            )}
                          </Box>,
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
                              width: 400,
                              height: 260,
                              border: "1px solid #ccc",
                              borderRadius: 2,
                              p: 1,
                              bgcolor: seatInfo ? "#e0f7fa" : "#ffeaea",
                              cursor: seatInfo ? "pointer" : "default",
                            }}
                            onClick={() => {
                              // console.log("right seatInfo onclick", seatInfo);
                              if (seatInfo) {
                                setSelectedSeat(seatInfo);
                                setFormData({
                                  id: seatInfo.id,
                                  seat: seatInfo.seat,
                                  uiSeat: seatInfo.original,
                                  name: seatInfo.name || "",
                                  phone: seatInfo.phone || "",
                                  nrc: seatInfo.nrc || "",
                                  address: seatInfo.address || "",
                                  note: seatInfo.note || "",
                                  agentName: seatInfo?.agentName || null,
                                  saleCounterName:
                                    seatInfo?.saleCounterName || "-",
                                  kpayMemberId: seatInfo?.kpayMemberId || null,
                                  memberId: seatInfo?.memberId || null,
                                  createdAt: seatInfo?.createdAt,
                                  seatNumber: seatInfo.seatNumber,
                                  userName: seatInfo.userId,
                                  lockedAt: seatInfo.lockedAt,
                                });
                                setOpenModal(true);

                                dispatch(
                                  updateBookingInformation({
                                    bookerName: seatInfo.name,
                                    phone: seatInfo.phone,
                                    selectedSeat: seatInfo.seat,
                                    selectedRoute: payload.route,
                                    selectedDate: payload.start_date,
                                    nrc: seatInfo.nrc,
                                    specialRequest: seatInfo.specialRequest,
                                    commission: seatInfo.commission,
                                    totalAmount: seatInfo.total,
                                  }),
                                );
                              }
                            }}
                          >
                            <div className="text-center font-bold">
                              {seatLayout === "2:1"
                                ? formatSeatLabel(seatNo, 3)
                                : seatNo}
                            </div>

                            <br />
                            {seatInfo ? (
                              <>
                                <div className="text-sm pt-1">
                                  {seatInfo.type === "locked"
                                    ? `🔒 LOCKED`
                                    : `⚤ ${seatInfo.type.toUpperCase()}`}
                                </div>

                                <div className="text-sm pt-1">
                                  {seatInfo.type === "locked"
                                    ? `🧑‍💼`
                                    : `🧑‍💼 ${seatInfo.name}`}
                                </div>

                                <div className="text-sm pt-1">
                                  📞 {seatInfo.phone}
                                </div>

                                <div className="text-sm pt-1">
                                  🆔 {seatInfo.nrc}
                                </div>

                                <div className="text-sm pt-1">
                                  🏠 {seatInfo.address || "-"}
                                </div>

                                <div className="text-sm pt-1">
                                  📝 {seatInfo.note}
                                </div>
                                <small>
                                  {seatInfo?.agentName && (
                                    <>
                                      <div className="flex min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>
                                          Agent:&nbsp;
                                          {seatInfo.agentName &&
                                            seatInfo.agentName}
                                        </div>
                                        <div>
                                          {formatUtcToYangon(
                                            seatInfo.createdAt,
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  {seatInfo?.saleCounterName && (
                                    <>
                                      <div className="flex min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>
                                          🖨️ Counter: {seatInfo.saleCounterName}
                                        </div>
                                        <div>
                                          {formatUtcToYangon(
                                            seatInfo.createdAt,
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  {seatInfo?.kpayMemberId && (
                                    <>
                                      <div className="flex min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>KBZ Pay Mini-app</div>
                                        <div>
                                          {formatUtcToYangon(
                                            seatInfo.createdAt,
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {seatInfo?.memberId && (
                                    <>
                                      <div className="flex min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>🌐 Shwe Yoke Lay Website</div>
                                        <div>
                                          {formatUtcToYangon(
                                            seatInfo.createdAt,
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {seatInfo?.type === "locked" && (
                                    <>
                                      <div className="flex text-red-600 min-h-[50px] justify-between gap-5 pt-2 mt-2 mb-2 border-t border-gray-400">
                                        <div>
                                          🔒{" "}
                                          {seatInfo.type === "locked" &&
                                            (seatInfo.lockedAt
                                              ? `${seatInfo.userName} @ ${seatInfo.lockedAt}`
                                              : "")}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </small>
                              </>
                            ) : (
                              <div className="w-full h-[70%] flex justify-center items-center">
                                <div>Empty</div>
                              </div>
                            )}
                          </Box>,
                        );
                        seatNo++;
                      }

                      seatCells.push(
                        <Box key={`row-${r}`} sx={{ display: "flex", gap: 1 }}>
                          {row}
                        </Box>,
                      );
                    }

                    return seatCells;
                  })()}
                </Box>
              </Grid>
            </Paper>
          ))
        )}
      </Grid>

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Seller Information</DialogTitle>
        <DialogContent>
          <div className="flex justify-between">
            <div>Seat No:</div>
            <div className="flex gap-2 flex-wrap">
              {formData.uiSeat?.map((s) => {
                const isActive = s.number === formData.seat;

                return (
                  <span
                    key={s.number}
                    className={`px-2 py-1 border rounded text-sm
            ${isActive ? "bg-blue-500 text-white" : "bg-gray-100"}
          `}
                  >
                    {payload?.vehicles_type_id === 1
                      ? formatSeatLabel(s.number, 3)
                      : s.number}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <div>Platform:</div>
            <div>{getPlatform()}</div>
          </div>
          <div className="flex justify-between">
            <div>Sold By:</div>
            <div>{getPlatform()}</div>
          </div>
          <div className="flex justify-between">
            <div>Date:</div>
            <div>{formatUtcToYangon(formData.createdAt)}</div>
          </div>
        </DialogContent>

        <DialogTitle>Update Passenger Information</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            InputProps={{
              readOnly: !canEditName,
            }}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            InputProps={{
              readOnly: !canEditPhone,
            }}
          />
          <TextField
            label="NRC"
            fullWidth
            margin="normal"
            value={formData.nrc}
            onChange={(e) => setFormData({ ...formData, nrc: e.target.value })}
            InputProps={{
              readOnly: !canEditNRC,
            }}
          />
          <TextField
            label="Address"
            fullWidth
            margin="normal"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            InputProps={{
              readOnly: !canEditAddress,
            }}
          />
          <TextField
            label="Note"
            fullWidth
            margin="normal"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            InputProps={{
              readOnly: !canEditNote,
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
          <PermissionGate permission="Edit_Customer_Info">
            <Button
              onClick={() => {
                UpdateSubmit();
                // console.log("Update data:", formData);
                setOpenModal(false);
              }}
              variant="contained"
            >
              Update
            </Button>
          </PermissionGate>
          <PermissionGate permission="Cancel_Ticket">
            <Button
              onClick={() => {
                if (window.confirm("ဤလက်မှတ်ကို ပယ်ဖျက်ရန် သေချာပါသလား?")) {
                  rejectTicket(selectedSeat);
                }

                // console.log("Update data:", formData);
                setOpenModal(false);
              }}
              color="error"
              variant="contained"
            >
              Delete Seat
            </Button>
          </PermissionGate>
          <PermissionGate permission="Print_Customer_Receipt">
            <Button
              variant="contained"
              color="success"
              onClick={() => printTicket()}
            >
              Print
            </Button>
          </PermissionGate>
        </DialogActions>
      </Dialog>
    </>
  );
};
