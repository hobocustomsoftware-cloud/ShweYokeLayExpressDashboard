import { baseURL, endpoints } from "../../../constants/endpoints";
import {
  calculateArrivalTime,
  convertTo12HourFormat,
  formatDateToDdMmmYyyy,
} from "../../../helpers/datetime";
import { capitalize, seatTypeColors } from "../../../helpers/otherHelpers";
// import { resetTimer, startCountdown } from "../../redux/slices/countdownSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import AirlineSeatReclineExtraIcon from "@mui/icons-material/AirlineSeatReclineExtra";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CircularProgress from "@mui/material/CircularProgress";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import { PermissionGate } from "../../../helpers/PermissionGate";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import StandardSeatLayout from "../../../helpers/StandardSeatLayout";
import VipSeatLayout from "../../../helpers/VipSeatLayout";
import { dashboardService } from "../../dashboard/dashboardService";
import { postRequest } from "../../../helpers/api";
import { roleService } from "../../role/roleService";
import { townshipData } from "../../../helpers/TownshipData";
import { update } from "../../user/userSlice";
import { updateBookingInformation } from "../bookingInformationSlice";
import { updateNotification } from "../../../shares/shareSlice";
import { useNavigate } from "react-router-dom";

// import { useTranslation } from "react-i18next";

const SeatSelectionPage = () => {
  // const { language } = useSelector((state) => state.share);
  // const { t, i18n } = useTranslation();
  // useEffect(() => {
  //   i18n.changeLanguage(language);
  // }, [language, i18n]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    bookerName,
    phone,
    nrcRegion,
    nrcTownship,
    nrcCitizen,
    nrcNumber,
    selectedSeat,
    // bookedSeats,
    nationality,
    selectedRoute,
    selectedDate,
    specialRequest,
    commission,
  } = useSelector((state) => state.bookingInformation);
  const agent = useSelector((state) => state.agent);
  const userRole = useSelector((state) => state.share.role);
  const user = useSelector((state) => state.share.user);
  const loggedInUserId = user?.id;

  // console.log("loggedInUserId >>", loggedInUserId);

  const [errors, setErrors] = useState({});
  const [phError, setPhError] = useState("");
  const [loading, setLoading] = useState(false);
  const [townships, setTownships] = useState([]);
  const regions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  useEffect(() => {
    setTownships(townshipData[nrcRegion] || []);
  }, [dispatch, nrcRegion]);

  useEffect(() => {
    // If the page is loaded fresh (no state), redirect to "/"
    if (!selectedRoute || !selectedDate || loggedInUserId === undefined) {
      navigate("/", { replace: true });
    }
  }, [selectedRoute, selectedDate, navigate, loggedInUserId]);

  const validateForm = () => {
    let newErrors = {};

    if (!bookerName.trim())
      newErrors.bookerName = "Traveller Name is required.";
    if (!phone.trim()) newErrors.phone = "Phone Number is required.";

    if (nationality === "local") {
      if (!nrcRegion) newErrors.nrcRegion = "Region Required";
      if (!nrcTownship) newErrors.nrcTownship = "Township Required";
      if (!nrcCitizen) newErrors.nrcCitizen = "Citizen Required";
      if (!nrcNumber.trim()) newErrors.nrcNumber = "Number Required";
      if (nrcNumber.length !== 6) newErrors.nrcInvalid = "Invalid NRC Number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhoneNumbers = (value, { strictSeparator = false } = {}) => {
    const cleaned = value.replace(/[^0-9,+ ]/g, "");
    if (strictSeparator) {
      const sepPattern = /^([^,]+)(, [^,]+)*$/;
      if (!sepPattern.test(cleaned)) {
        // setPhError("invalid_separator_format");
        setPhError(
          "Invalid Separator Format. Use comma and space as separator."
        );
        return { cleaned, isValid: false };
      }
    }

    const numbers = cleaned
      .split(", ")
      .map((num) => num.trim())
      .filter(Boolean);

    if (numbers.length > 2) {
      setPhError("extra_phone_numbers");
      return { cleaned, isValid: false };
    }

    const isValid = numbers.every((num) => {
      const digitsOnly = num.replace(/\D/g, "");
      if (/^(\d)\1+$/.test(digitsOnly)) return false;
      if (num.startsWith("+959")) {
        return num.length === 13;
      }
      return digitsOnly.length >= 8 && digitsOnly.length <= 11;
    });
    // setPhError(isValid ? "" : "invalid_phone_number");
    setPhError(isValid ? "" : "Invalid Phone Number");
    return { cleaned, isValid };
  };

  const handlePhNoChange = (e) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^0-9,+ ]/g, "");
    const numbers = cleaned
      .split(", ")
      .map((num) => num.trim())
      .filter(Boolean);

    if (numbers.length > 2) {
      setPhError("extra_phone_numbers");
      return;
    }

    setPhError(phError === "Invalid Separator Format" ? "" : phError);
    dispatch(updateBookingInformation({ phone: cleaned }));
  };

  const handlePhNoBlur = () => {
    const { cleaned, isValid } = validatePhoneNumbers(phone, {
      strictSeparator: true,
    });
    if (!isValid) return;
    dispatch(updateBookingInformation({ phone: cleaned }));
  };

  const loadDepositBalance = async () => {
    try {
      const result = await dashboardService.userBalance(dispatch, {
        loggedInUserId: loggedInUserId,
        role: userRole,
      });
      if (result.status === 200) {
        console.log("loadDepositBalance >> ", result?.data?.depositBalance);
        dispatch(
          updateBookingInformation({
            depositBalance: result?.data?.depositBalance || 0,
            creditBalance: result?.data?.creditBalance || 0,
          })
        );
      }
    } catch (error) {
      console.error("Error loading deposit balance:", error);
    }
  };

  // useEffect(() => {
  //   loadDepositBalance();
  // }, []);

  const seatCount = selectedSeat.length;
  const totalAmount = seatCount * selectedRoute.ticket_fee;

  // console.log("agent.agent.agent_commission", agent.agent.agent_commission);

  const submitClicked = async (status) => {
    setLoading(true);

    loadDepositBalance();

    const { cleaned, isValid } = validatePhoneNumbers(phone, {
      strictSeparator: true,
    });

    if (!validateForm()) {
      setLoading(false);
      return;
    }
    if (!isValid) {
      setLoading(false);
      return;
    }

    const fullNrc = `${nrcRegion}/${nrcTownship}${nrcCitizen}${nrcNumber}`;

    // Number(
    //   nationality === "local" ? selectedRoute.price : selectedRoute.fprice
    // );
    let salePlatform = "";
    if (userRole === "SUPER_ADMIN" || userRole === "SALES") {
      salePlatform = "Shwe Yoke Lay Counter";
    } else if (userRole === "AGENT") {
      salePlatform = "Agent Sales";
    }
    console.log("platform before dispatch >>> ", salePlatform);
    dispatch(
      updateBookingInformation({
        nrc: fullNrc,
        phone: cleaned,
        selectedSeats: selectedSeat,
        totalAmount: status === "BOOKED" ? 0 : totalAmount,
        commission:
          status === "BOOKED"
            ? 0
            : agent?.agent?.agent_commission
            ? agent?.agent?.agent_commission
            : commission,
        saleMaker: user,
        userRole: userRole,
        salePlatform,
        start: selectedRoute.start,
        destination: selectedRoute.destination,
      })
    );

    const formData = new FormData();
    // formData.append("member_id", getData(keys.USER)?.id);
    formData.append("status", status);
    formData.append("route_id", selectedRoute.id);
    formData.append("total", totalAmount);
    formData.append("nrc", fullNrc);
    formData.append("phone", cleaned);
    formData.append("name", bookerName);
    formData.append("note", specialRequest || "");
    formData.append("commission", commission || "");
    formData.append("start_time", selectedDate);
    formData.append("loggedInUserId", loggedInUserId);
    formData.append(
      "seat",
      JSON.stringify(selectedSeat.filter((seat) => !seat.sold))
    );

    if (totalAmount === 0) {
      dispatch(
        updateNotification({
          variant: "error",
          message: "Please choose at least one seat.",
        })
      );
      alert("Please choose at least one seat.");
      setLoading(false);
      return;
    }

    // if (isUserValid) {
    if (selectedSeat.length < 0) {
      setLoading(false);
      return;
    }

    try {
      const result = await postRequest(
        `${baseURL}/${
          userRole === "AGENT" ? endpoints.agentSale : endpoints.sylCounterSale
        }`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      // console.log("result >>>", result);
      // .then((result) => {
      if (result.status === 201) {
        // console.log("in 201 block > result", result);
        const noti =
          status === "BOOKED"
            ? "Booking Successful!"
            : "Ticket Successfully Bought!";
        dispatch(
          updateNotification({
            variant: "success",
            message: noti,
          })
        );
        dispatch(
          updateBookingInformation({
            commission: commission * seatCount,
          })
        );
        navigate("/saleCounter/printTicket");
      } else if (result.status === 409) {
        // console.log("in 409 block > result", result);
        dispatch(
          updateNotification({
            variant: "error",
            message: "Please choose another seat. Seat is already booked.",
          })
        );
        return;
      } else if (result.status === 322) {
        // console.log("in 322 block > result", result);
        dispatch(
          updateNotification({
            variant: "error",
            message: "Please fill traveller information as suggested.",
          })
        );
        return;
      } else if (result.status === 400) {
        // console.log("in 400 block > result", result);
        dispatch(
          updateNotification({
            variant: "error",
            message: result.message ? result.message : "Insufficient Balance",
          })
        );
        navigate("/");
      }
      // });
    } catch (error) {
      // console.log("error >> ", error);
      if (error.response && error.response.status === 500) {
        dispatch(
          updateNotification({
            variant: "error",
            message: error.response.data.message,
          })
        );
      } else {
        console.error("Error Zero Payment:", error);
      }
    }
    // }
  };

  useEffect(() => {
    dispatch(
      updateBookingInformation({
        totalAmount: totalAmount,
      })
    );
    loadDepositBalance();
  }, [seatCount, dispatch, totalAmount]);

  // useEffect(() => {
  //   console.log(selectedRoute)
  // }, []);

  // const role = selectedRoute.role;
  // const permissions = selectedRoute.permissions;

  // const canBuy = role === "SUPER_ADMIN" || permissions?.includes("Buy_Ticket");
  // const canBook =
  //   role === "SUPER_ADMIN" || permissions?.includes("Booking_Ticket");

  // const loadPermission = async () => {
  //   const result = await roleService.buttonPermission(dispatch);

  //   dispatch(
  //     update({
  //       permission: result?.data?.permissions,
  //       role: result?.data?.role,
  //     })
  //   );
  // };

  // useEffect(() => {
  //   loadPermission();
  // }, []);

  const role = selectedRoute?.role;
  const permissions = selectedRoute?.permissions;
  // console.log("permissions", permissions);
  const canBuy = role === "SUPER_ADMIN" || permissions?.includes("Buy_Ticket");
  const canBook =
    role === "SUPER_ADMIN" || permissions?.includes("Booking_Ticket");

  // seat labeling
  const formatSeatLabel = (seatNumber, seatsPerRow) => {
    const index = seatNumber - 1; // convert seat number back to 0-based index
    const rowIndex = Math.floor(index / seatsPerRow);
    const seatIndex = index % seatsPerRow;
    const rowLetter = String.fromCharCode(65 + rowIndex);
    const seatNum = seatsPerRow - seatIndex;
    return `${rowLetter}${seatNum}`;
  };

  // to reset nrc
  useEffect(() => {
    // Whenever the page is loaded or navigated back to
    dispatch(
      updateBookingInformation({
        nrcRegion: "",
        nrcTownship: "",
        nrcCitizen: "",
        nrcNumber: "",
      })
    );
  }, [dispatch]);

  // console.log("canBuy", canBuy);
  // console.log("canBook", canBook);
  return (
    <>
      <div className="col-12">
        <Breadcrumb />
      </div>

      {/* Search Edit Section */}
      <div className="p-2 mb-3 select-none">
        <div className="mb-3">
          {/* Origin and Destination */}
          <div className="w-full ">
            <div className="w-full flex mb-1 ">
              <LocationOnIcon
                color="#000"
                size={30}
                className="block  w-6 h-6 mr-3"
              />
              {/* {selectedRoute?.counter_pivots?.map((pivot, index) => (
                <div key={index} className="mr-1">
                  {pivot.starting_counter?.name}
                </div>
              ))} */}
              <div className="mr-10">{selectedRoute?.start}</div>
              <div className="grow">
                {" "}
                Departure -
                {selectedRoute &&
                  `${convertTo12HourFormat(
                    selectedRoute?.departure
                  )} ${formatDateToDdMmmYyyy(selectedDate)}`}
              </div>
            </div>
            <div className="h-6 my-2">
              <ArrowDownwardIcon />
            </div>
            <div className="flex pb-3">
              <MapIcon color="#000" size={30} className="block  w-6 h-6 mr-3" />
              {/* {selectedRoute?.counter_pivots?.map((pivot, index) => (
                <div key={index} className="mr-1">
                  {pivot.ending_counter?.name}
                </div>
              ))} */}
              <div className="mr-10">{selectedRoute?.destination}</div>

              {/* <div className="grow">Departure - {selectedRoute?.departure?.trim() || ""}</div>
              <div className="grow">Arrivals - {selectedRoute?.arrivals?.trim() || ""}</div> */}
              <div className="grow">
                Arrivals -
                {selectedRoute &&
                  calculateArrivalTime(
                    selectedDate,
                    selectedRoute?.departure,
                    selectedRoute?.duration
                  )}
              </div>
            </div>
          </div>

          <div className="flex justify-between pb-3 text-primary-0 font-semibold text-title">
            <div>{selectedRoute?.busType}</div>
            <div>
              {selectedRoute?.ticket_fee} / Seat
              {/* {t("seat")} */}
            </div>
          </div>

          {/* Trip Info */}
          <div className="flex gap-4">
            <div className="flex items-center">
              <CalendarMonthIcon className="inline-block mr-2" />
              <span>{formatDateToDdMmmYyyy(selectedDate)}</span>
            </div>
            <div className="flex items-center">
              <PersonPinCircleIcon className="inline-block mr-2" />
              <span>{capitalize(nationality)}</span>
            </div>
            {selectedSeat && (
              <div className="flex items-center">
                <AirlineSeatReclineExtraIcon className="inline-block mr-2" />
                <span>{selectedSeat?.length} Seat</span>
              </div>
            )}
          </div>
        </div>
        {/* Seat Selection */}
        {selectedRoute?.vehicles_type?.seat_layout === "2:1" ? (
          <VipSeatLayout />
        ) : (
          <StandardSeatLayout />
        )}

        {/* selected seats */}
        {selectedSeat.length > 0 ? (
          <div className="flex flex-col gap-3 mt-5">
            <div className="flex items-center">
              <div className="w-[40%] font-semibold text-subtitle">
                Selected Seat
              </div>
              <div className="w-[60%] flex flex-wrap gap-2">
                {selectedSeat &&
                  selectedRoute?.vehicles_type?.seat_layout === "2:1" &&
                  selectedSeat?.map((seat) => (
                    <p
                      className={`inline-block min-w-[40px] text-center px-3 py-1 border border-gray-500 rounded-lg ${
                        seatTypeColors[seat.type]?.color || "bg-gray-300"
                      }`}
                      key={seat.number}
                    >
                      {formatSeatLabel(seat.number, 3)}
                    </p>
                  ))}
                {selectedSeat &&
                  selectedRoute?.vehicles_type?.seat_layout !== "2:1" &&
                  selectedSeat?.map((seat) => (
                    <p
                      className={`inline-block min-w-[40px] text-center px-3 py-1 border border-gray-500 rounded-lg ${
                        seatTypeColors[seat.type]?.color || "bg-gray-300"
                      }`}
                      key={seat.number}
                    >
                      {seat.number}
                    </p>
                  ))}
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="w-[40%] font-semibold text-subtitle">
                Total Amount
              </div>
              <div className="w-[60%] font-semibold text-title">
                {selectedSeat?.length * selectedRoute?.ticket_fee}
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        {/* <button
          type="button"
          onClick={handleContinue}
          className="w-full bg-primary-0 hover:bg-secondary-0 px-5 py-[10px] border-none rounded-md text-subtitle font-semibold transition-colors duration-400 "
        >
          Continue
          {t("continue_btn")}
        </button> */}
      </div>

      {/* Traveller information section */}
      <div className="w-full select-none mt-10 mx-auto max-w-[500px]">
        {/* Traveller Info */}
        <div className="flex flex-col border border-black p-2 md:p-5">
          <div className="w-full">
            <div className="flex flex-col gap-4">
              <p className="mb-5 py-3 border-b border-b-black text-title font-bold text-center">
                {/* {t("traveller_info_form_title")} */}
                Traveller Info
              </p>

              {/* Traveller Name */}
              <div className="flex items-center gap-3">
                <div className="w-[30%]">
                  <label className="font-semibold">
                    {/* {t("traveller_name")} */}
                    Name
                    <span className="text-red-500">&nbsp;*</span>
                  </label>
                </div>
                <div className="w-[70%]">
                  <input
                    type="text"
                    name="bookerName"
                    value={bookerName}
                    // placeholder={`${t("traveller_name_placeholder")}`}
                    placeholder={`Traveller Name`}
                    onChange={(e) =>
                      dispatch(
                        updateBookingInformation({ bookerName: e.target.value })
                      )
                    }
                    className="w-full p-1 border border-stone-500 text-inputs"
                  />
                  {errors.bookerName && (
                    <p className="text-red-500 text-inputs mt-1">
                      {/* {t("traveller_name_required")} */}
                      Traveller Name is required
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-center gap-3">
                <div className="w-[30%]">
                  <label className="font-semibold">
                    {/* {t("phone_number")} */}
                    Phone Number
                    <span className="text-red-500">&nbsp;*</span>
                  </label>
                </div>
                <div className="w-[70%]">
                  <input
                    type="text"
                    name="phone"
                    value={phone}
                    placeholder="+959XXX..., 09XXX..., 01XXX..."
                    onChange={handlePhNoChange}
                    onBlur={handlePhNoBlur}
                    className="w-full p-1 border border-stone-500 text-inputs"
                  />
                  {phError && (
                    <p className="text-red-600 text-inputs mt-1">
                      {/* {phError && t(phError)} */}
                      {phError}
                    </p>
                  )}
                  {!phError && (
                    <p className="text-black-500 mt-1 text-inputs">
                      {/* {t("multi_phone_number")} */}1 or 2 phone numbers are
                      allowed
                    </p>
                  )}
                </div>
              </div>

              {/* NRC */}
              {nationality === "local" && (
                <div className="flex items-center gap-3">
                  <div className="w-[30%]">
                    <label className="font-semibold">
                      {/* {t("nrc_number")} */}
                      NRC Number
                      {role !== "SUPER_ADMIN" && role !== "SALES" ? (
                        <span className="text-red-500">&nbsp;*</span>
                      ) : (
                        ""
                      )}
                    </label>
                  </div>
                  <div className="w-[70%]">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1">
                        {/* region */}
                        <div className="w-full">
                          <select
                            id="region"
                            value={nrcRegion}
                            required
                            onChange={(e) =>
                              dispatch(
                                updateBookingInformation({
                                  nrcRegion: e.target.value,
                                })
                              )
                            }
                            className="p-1 border border-stone-500 bg-transparent w-full text-inputs"
                          >
                            <option value="" disabled className="text-inputs">
                              {/* {t("please_choose")} */}
                              Choose
                            </option>

                            {regions.map((r) => (
                              <option key={r} value={r} className="text-inputs">
                                {/* {t(`${r}`)} */}
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Township */}
                        <div className="w-full">
                          <select
                            id="code"
                            value={nrcTownship}
                            required
                            onChange={(e) =>
                              dispatch(
                                updateBookingInformation({
                                  nrcTownship: e.target.value,
                                })
                              )
                            }
                            className="p-1 border border-stone-500 bg-transparent w-full text-inputs"
                          >
                            <option value="" disabled className="text-inputs">
                              {/* {t("please_choose")} */}
                              Choose
                            </option>
                            {townships.length > 0 ? (
                              townships.map((township, index) => (
                                <option
                                  key={index}
                                  value={township}
                                  className="text-inputs"
                                >
                                  {/* {t(`${township}`)} */}
                                  {township}
                                </option>
                              ))
                            ) : (
                              <option value="">
                                Not Available
                                {/* {t("not_available")} */}
                              </option>
                            )}
                          </select>
                        </div>

                        {/* type */}
                        <div className="w-full">
                          <select
                            id="nrcCitizen"
                            value={nrcCitizen}
                            required
                            onChange={(e) =>
                              dispatch(
                                updateBookingInformation({
                                  nrcCitizen: e.target.value,
                                })
                              )
                            }
                            className="p-1 border border-stone-500 bg-transparent w-full text-inputs"
                          >
                            <option value="">
                              {/* {t("please_choose")} */}
                              Choose
                            </option>
                            <option value="(နိုင်)">
                              {/* {t("(နိုင်)")} */}
                              (နိုင်)
                            </option>
                            <option value="(ဧည့်)">
                              {/* {t("(ဧည့်)")} */}
                              (ဧည့်)
                            </option>
                            <option value="(ပြု)">
                              {/* {t("(ပြု)")} */}
                              (ပြု)
                            </option>
                            <option value="(သာသနာ)">
                              {/* {t("(သာသနာ)")} */}
                              (သာသနာ)
                            </option>
                            <option value="(ယာယီ)">
                              {/* {t("(ယာယီ)")} */}
                              (ယာယီ)
                            </option>
                            <option value="(စ)">
                              {/* {t("(စ)")} */}
                              (စ)
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Card no. */}
                      <div className="w-full">
                        <input
                          type="text"
                          id="nrcNumber"
                          minLength="6"
                          maxLength="6"
                          required
                          value={nrcNumber}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const filtered = raw.replace(/[^0-9]/g, "");

                            dispatch(
                              updateBookingInformation({ nrcNumber: filtered })
                            );
                          }}
                          className="w-full p-1 border border-stone-500 text-inputs"
                          placeholder="123456"
                        />
                      </div>
                    </div>
                    {errors.nrcRegion && (
                      <p className="text-red-500 text-inputs mt-1">
                        {/* {t(errors.nrcRegion)} */}
                        {errors.nrcRegion}
                      </p>
                    )}
                    {errors.nrcTownship && (
                      <p className="text-red-500 text-inputs mt-1">
                        {/* {t(errors.nrcTownship)} */}
                        {errors.nrcTownship}
                      </p>
                    )}
                    {errors.nrcCitizen && (
                      <p className="text-red-500 text-inputs mt-1">
                        {/* {t(errors.nrcCitizen)} */}
                        {errors.nrcCitizen}
                      </p>
                    )}
                    {errors.nrcNumber && (
                      <p className="text-red-500 text-inputs mt-1">
                        {/* {t(errors.nrcNumber)} */}
                        {errors.nrcNumber}
                      </p>
                    )}
                    {errors.nrcInvalid && (
                      <p className="text-red-500 text-inputs mt-1">
                        {/* {t(errors.nrcInvalid)} */}
                        {errors.nrcInvalid}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Special Request */}
              <div className="flex items-center gap-3">
                <div className="w-[30%]">
                  <label className="font-semibold">
                    {/* {t("special_request")} */}
                    Special Request
                  </label>
                </div>
                <div className="w-[70%]">
                  <textarea
                    name="specialRequest"
                    id="specialRequest"
                    value={specialRequest}
                    rows={3}
                    onChange={(e) =>
                      dispatch(
                        updateBookingInformation({
                          specialRequest: e.target.value,
                        })
                      )
                    }
                    className="w-full p-1 border border-stone-500 text-inputs"
                    // placeholder={`${t("special_request_placeholder")}`}
                    placeholder="Add your special request here..."
                  ></textarea>
                </div>
              </div>

              {/* Commission */}
              {userRole !== "AGENT" ? (
                <div className="flex items-center gap-3">
                  <div className="w-[30%]">
                    <label className="font-semibold">Commission</label>
                  </div>
                  <div className="w-[70%]">
                    <input
                      type="number"
                      min={0}
                      max={selectedRoute.ticket_fee}
                      name="commission"
                      value={commission}
                      // placeholder={`${t("traveller_name_placeholder")}`}
                      placeholder={`Commission`}
                      onChange={(e) => {
                        const value = e.target.value; // string
                        if (value === "") {
                          // let user clear input
                          dispatch(
                            updateBookingInformation({ commission: "" })
                          );
                          return;
                        }

                        const num = Number(value); // convert to number for comparisons

                        if (num > 5000 || num < 0) {
                          // reset to 0 if invalid // num > selectedRoute.ticket_fee || num < 0
                          dispatch(updateBookingInformation({ commission: 0 }));
                        } else {
                          // keep it numeric in redux
                          dispatch(
                            updateBookingInformation({ commission: num })
                          );
                        }
                      }}
                      className="w-full p-1 border border-stone-500 text-inputs"
                    />
                    {errors.commission && (
                      <p className="text-red-500 text-inputs mt-1">
                        {/* {t("traveller_name_required")} */}
                        Commission is required
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                ""
              )}

              <div className="w-full flex justify-center text-title pb-5">
                {userRole !== "AGENT" && (
                  <PermissionGate permission="Booking_Ticket">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full px-5 py-2 mx-5 border-none rounded-md text-subtitle font-semibold transition-colors duration-400 
        ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gray-400 hover:bg-gray-500"
        }`}
                      onClick={() => submitClicked("BOOKED")}
                    >
                      {loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Book"
                      )}
                    </button>
                  </PermissionGate>
                )}
                <PermissionGate permission="Buy_Ticket">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-5 py-2 mx-5 border-none rounded-md text-subtitle font-semibold transition-colors duration-400 ${
                      loading
                        ? "bg-amber-400 cursor-not-allowed"
                        : "bg-amber-400 hover:bg-amber-500"
                    }`}
                    onClick={() => submitClicked("SUCCESS")}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Sale"
                    )}
                  </button>
                </PermissionGate>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="w-full text-center mt-3 p-3 bg-stone-50 rounded-md shadow-md select-none">
        <h1 className="text-orange-400 font-semibold text-subtitle">
          {/* {t("warning")}! */}
          Warning
        </h1>
        <p>Take your NRC</p>
        {/* <p>- {t("take_your_nrc")}</p>
        <p>- {t("proceed_your_booking")}</p> */}
      </div>
    </>
  );
};

export default SeatSelectionPage;
