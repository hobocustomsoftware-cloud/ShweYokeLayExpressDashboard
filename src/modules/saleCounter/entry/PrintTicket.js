import { Link, useNavigate } from "react-router-dom";
import { getData, removeAllData } from "../../../helpers/localstorage";
import { keys, laravelDecrypt } from "../../../constants/config";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Breadcrumb } from "../../../shares/Breadcrumbs";
import { PermissionGate } from "../../../helpers/PermissionGate";
import dayjs from "dayjs";
import { endpoints } from "../../../constants/endpoints";
import { formatTo12Hour } from "../../../helpers/datetime";
import { getRequest } from "../../../helpers/api";
import html2canvas from "html2canvas";
import { paths } from "../../../constants/paths";
import { roleService } from "../../role/roleService";
import { update } from "../../user/userSlice";
import { updateBookingInformation } from "../bookingInformationSlice";

// import { useTranslation } from "react-i18next";

const PrintTicket = () => {
  const [loading, setLoading] = useState(false);
  // const { language } = useSelector((state) => state.share);
  // const { t, i18n } = useTranslation();
  // useEffect(() => {
  //   i18n.changeLanguage(language);
  // }, [language, i18n]);

  const {
    bookerName,
    phone,
    selectedSeat,
    nationality,
    selectedRoute,
    selectedDate,
    nrc,
    specialRequest,
    commission,
    totalAmount,
    salePlatform,
    depositBalance,
    creditBalance,
    userRole,
    startingPoint,
    endingPoint,
  } = useSelector((state) => state.bookingInformation);
  // const userRole = useSelector((state) => state.share.role);
  const agent = useSelector((state) => state.agent.agent);
  const [storeData, setStoreData] = useState({});
  const [openAlert, setOpenAlert] = useState(false);
  const navigate = useNavigate();
  // console.log("agent >> ", agent);
  const logout = async () => {
    removeAllData();
    navigate(paths.adminLogout);
  };
  useEffect(() => {
    const init = async () => {
      if (Object.keys(storeData).length === 0) {
        const decrypted = await laravelDecrypt(getData(keys.CODE));
        if (!decrypted) {
          setOpenAlert(true);
          logout();
        } else {
          setStoreData(decrypted);
          // setToken(decrypted?.token);
        }
      }
    };
    init();
  }, []);

  const NrcDisplay = (nrc) => {
    if (!nrc || typeof nrc !== "string") {
      return null;
    }
    // Capture region, townshipCode, citizenType, and number
    const match = nrc.match(/^(\d+)\/([^()]+)\(([^)]+)\)(\d+)$/);
    if (!match) {
      return <span>{nrc}</span>;
    }

    const region = match[1]; // e.g. '8'
    const townshipCode = match[2]; // e.g. 'မမန'
    const citizenType = match[3]; // e.g. 'ဧည့်'
    const number = match[4]; // e.g. '776658'

    return (
      <span>
        {region}/{townshipCode}
        {`(${citizenType})`}
        {number}
      </span>
    );
  };
  const [printing, setPrinting] = useState(null);
  const currentTime = dayjs().format("DD-MM-YYYY h:mm A");
  const seatCount = Array.isArray(selectedSeat) ? selectedSeat.length : 0;

  // printing
  const divRef = useRef(null);
  const divRefCompany = useRef(null);

  // helper: sanitize inline + computed styles
  const sanitizeColors = (element) => {
    if (!element) return;

    const all = element.querySelectorAll("*");
    all.forEach((el) => {
      const style = getComputedStyle(el);

      // override invalid values (color, bg, border)
      if (style.color && style.color.startsWith("oklch(")) {
        el.style.color = "#000000";
      }
      if (style.backgroundColor && style.backgroundColor.startsWith("oklch(")) {
        el.style.backgroundColor = "#ffffff";
      }
      if (style.borderColor && style.borderColor.startsWith("oklch(")) {
        el.style.borderColor = "#000000";
      }
    });
  };

  const handleSaveTicket = async (ref, type) => {
    if (printing) {
      alert("⚠️ Printing Processing! Please wait until it's done.");
      return; // block second click
    }

    setPrinting(type);

    if (!ref.current) {
      setPrinting(null);
      return;
    }

    try {
      await document.fonts.ready;

      sanitizeColors(ref.current); // sanitize BEFORE html2canvas

      const printerWidthInches = 3; // 3-inch paper
      const printerDPI = 192;
      const printerWidthPx = printerWidthInches * printerDPI; // 576px

      // temporarily adjust width for scaling
      const originalWidth = ref.current.style.width;
      ref.current.style.width = `${printerWidthPx}px`;

      const canvas = await html2canvas(ref.current, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 1,
        onclone: (clonedDoc) => {
          sanitizeColors(clonedDoc.body);
        },
      });

      // reset width after snapshot
      ref.current.style.width = originalWidth || "";

      const dataUrl = canvas.toDataURL("image/png");
      const base64Image = dataUrl.split(",")[1];

      sendToFlutterPrinter(base64Image);
      console.log(`✅ ${type} ticket ready to print`);
    } catch (err) {
      console.error(`❌ Failed to generate ${type} ticket:`, err);
      setPrinting(null);
    } finally {
      setTimeout(() => setPrinting(null), 6000);
    }
  };

  const sendToFlutterPrinter = (base64) => {
    if (
      window.PrinterChannel &&
      typeof window.PrinterChannel.postMessage === "function"
    ) {
      window.PrinterChannel.postMessage(base64);
      console.log("📩 Sent to Flutter WebView successfully");
    } else {
      console.warn(
        "⚠️ PrinterChannel not available. Are you outside Flutter WebView?",
      );
    }
  };

  const dispatch = useDispatch();
  const handleBuyNewTicket = () => {
    loadingRouteData();
    navigate(paths.saleCounterCreate);
  };

  const loadingRouteData = useCallback(async () => {
    if (startingPoint === endingPoint) {
      return;
    }

    try {
      const routeResult = await getRequest(
        `${endpoints.saleCounterRouteSearch}`,
        {
          starting_point: startingPoint,
          ending_point: endingPoint,
          user_type: nationality,
          selected_date: selectedDate,
        },
      );

      if (routeResult.status === 200) {
        const routes = Array.isArray(routeResult?.data?.routes)
          ? routeResult.data.routes
          : [];

        // filter route by selectedRoute.id
        const filteredRoute = routes.find((r) => r.id === selectedRoute?.id);

        if (!filteredRoute) {
          console.warn("No route found with selectedRoute.id");
          return;
        }

        // map orders
        const orders = Array.isArray(filteredRoute.orders)
          ? filteredRoute.orders.flatMap((order) => {
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
            })
          : [];

        dispatch(
          updateBookingInformation({
            bookedSeats: orders,
            selectedSeat: [],
            bookerName: "",
            phone: "",
            nrc: "",
            specialRequest: "",
            // commission: "",
          }),
        );
      }
    } catch (err) {
      console.error("Error loading route data:", err);
    }
  }, [
    startingPoint,
    endingPoint,
    nationality,
    selectedDate,
    selectedRoute?.id,
    dispatch,
  ]);

  // seat labeling
  const formatSeatLabel = (seatNumber, seatsPerRow) => {
    const index = seatNumber - 1; // convert seat number back to 0-based index
    const rowIndex = Math.floor(index / seatsPerRow);
    const seatIndex = index % seatsPerRow;
    const rowLetter = String.fromCharCode(65 + rowIndex);
    const seatNum = seatsPerRow - seatIndex;
    return `${rowLetter}${seatNum}`;
  };

  console.log("selectedSeat", selectedSeat);

  return (
    <div className="">
      <div className="col-12">
        <Breadcrumb />
      </div>

      {/* Search Edit Section */}
      <div className="w-full overflow-x-auto">
        {/* <h3 className="text-center my-3 text-green-600">
          Ticket {status} Successfully.
        </h3> */}
        <div className="min-w-max flex gap-5 flex-col items-center lg:flex-row">
          {/* counter print */}
          <div>
            <h3 className="text-center mt-3 font-semibold">
              Company Receipt Print Preview
            </h3>
            <div
              ref={divRefCompany}
              className="w-[576px] rounded-2xl shadow-lg overflow-hidden bg-white border border-gray-200"
              style={{ marginTop: "20px", marginBottom: "40px" }}
            >
              {/* Brand */}
              <div className="pb-3 flex flex-row gap-5 border-b border-gray-400">
                <div className="w-1/2">
                  <img
                    src="/ticket-logo.png"
                    alt="logo"
                    className="h-auto pt-4 mb-2"
                  />
                </div>
                <div className="w-1/2 my-auto text-base">
                  <div>
                    <p>Customer Hotlines</p>
                    <p>09 40 88000 95</p>
                    <p>09 40 88000 98</p>
                  </div>
                </div>
              </div>

              {/* Content Wrapper with padding */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* left side */}
                  <div className=" border-r border-gray-400 pr-3">
                    <h2 className="text-center font-semibold">Route</h2>
                    <div className="flex justify-between mb-4">
                      <div>From</div>
                      <div>to</div>
                    </div>
                    {/* from - to */}
                    <div className="flex justify-between mb-4">
                      <div>
                        {/* <GrLocation size={20} className="inline-block mr-2" /> */}
                        <span>{selectedRoute?.start}</span>
                      </div>
                      {/* <FaArrowRight size={15} /> */}
                      <div>
                        {/* <GrMapLocation
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                        <span>{selectedRoute?.destination}</span>
                      </div>
                    </div>

                    <div className="flex justify-between mb-4">
                      <div>
                        {/* <IoCalendarClearOutline
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                        <span>Departure Date</span>
                      </div>
                      <span>
                        {new Date(selectedDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between mb-4">
                      <div>
                        {/* <MdOutlineDepartureBoard
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                        <span>Boarding Time</span>
                      </div>
                      <span>{formatTo12Hour(selectedRoute?.departure)}</span>
                    </div>

                    {/* Seat + Price */}
                    <div>
                      <div className="flex justify-between mb-4">
                        <div>
                          {/* <BsTicket size={20} className="inline-block mr-2" /> */}
                          <span>Seat No.</span>
                        </div>
                        <span className="font-semibold">
                          {selectedRoute?.vehicles_type?.seat_layout === "2:1"
                            ? selectedSeat
                                .map((s) => formatSeatLabel(s.number, 3))
                                .join(", ")
                            : selectedSeat.map((s) => s.number).join(", ")}
                        </span>
                      </div>

                      <div className="pb-3 flex justify-between">
                        <div>
                          {/* <CiMoneyBill
                            size={20}
                            className="inline-block mr-2"
                          /> */}
                          <span>Ticket Price</span>
                        </div>
                        <span>{totalAmount}</span>
                      </div>

                      <div className="pb-3 flex justify-between">
                        <div>
                          {/* <CiPercent size={20} className="inline-block mr-2" /> */}
                          <span>Commission</span>
                        </div>
                        {!agent?.agent_commission && (
                          <span>{commission ? commission : 0}</span>
                        )}
                        {agent?.agent_commission && (
                          <span>
                            {agent?.agent_commission
                              ? agent?.agent_commission * seatCount
                              : 0}
                          </span>
                        )}
                      </div>

                      <div className="pb-3 flex justify-between">
                        <div>
                          {!agent?.agent_commission ? (
                            <span>Sale Amount</span>
                          ) : (
                            <span>Purchased Amount</span>
                          )}
                        </div>
                        {!agent?.agent_commission && (
                          <span className="font-bold">
                            {commission ? totalAmount - commission : 0}
                          </span>
                        )}
                        {agent?.agent_commission && (
                          <span className="font-bold">
                            {agent?.agent_commission
                              ? totalAmount - seatCount * agent.agent_commission
                              : 0}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* right side */}
                  <div>
                    {/* Traveller Info */}
                    <div>
                      <h2 className="text-center font-semibold">
                        Traveller Information
                      </h2>
                      <div className="mt-[40px] flex justify-between mb-4">
                        <div>
                          {/* <HiOutlineUserCircle
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                          <span>Traveller Name</span>
                        </div>
                        <span>{bookerName}</span>
                      </div>

                      <div className="flex justify-between mb-4">
                        <div>
                          {/* <MdOutlinePhone
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                          <span>Phone</span>
                        </div>
                        <span>{phone}</span>
                      </div>

                      {nrc !== "/" && (
                        <div className="flex justify-between mb-4">
                          <div>
                            {/* <LiaIdCardSolid
                            size={20}
                            className="inline-block mr-2"
                          /> */}
                            <span>NRC</span>
                          </div>
                          <span>{NrcDisplay(nrc)}</span>
                        </div>
                      )}
                    </div>

                    {/* Agent Info */}
                    <div
                      className={`${userRole !== "AGENT" ? "hidden" : "block"}`}
                    >
                      <h2 className="mt-10 mb-5 text-center font-semibold">
                        Agent Information
                      </h2>
                      {agent?.is_super_agent !== true ? (
                        <div className="flex justify-between mb-4">
                          <div>
                            <span>Available Deposit</span>
                          </div>
                          <span>{depositBalance}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between mb-4">
                          <div>
                            <span>Available Credit</span>
                          </div>
                          <span>{creditBalance}</span>
                        </div>
                      )}

                      <div className="flex justify-between mb-4">
                        <div>
                          <span>Purchase Amount</span>
                        </div>
                        {!agent?.agent_commission && (
                          <span>{totalAmount - commission * seatCount}</span>
                        )}
                        {agent?.agent_commission && (
                          <span>
                            {totalAmount - agent?.agent_commission * seatCount}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between mb-4">
                        <div>
                          <span>Commission Earned</span>
                        </div>

                        {!agent?.agent_commission && (
                          <span className="font-bold">
                            {commission ? seatCount * commission : 0}
                          </span>
                        )}
                        {agent?.agent_commission && (
                          <span className="font-bold">
                            {agent?.agent_commission
                              ? seatCount * agent.agent_commission
                              : 0}
                          </span>
                        )}
                      </div>

                      {agent?.is_super_agent !== true ? (
                        <div className="flex justify-between mb-4">
                          <div>
                            <span>Deposit Balance</span>
                          </div>
                          {console.log("agent data", agent)}
                          {!agent?.agent_commission && (
                            <span className="font-bold">
                              {creditBalance -
                                (totalAmount - commission * seatCount)}
                            </span>
                          )}
                          {agent?.agent_commission && (
                            <span className="font-bold">
                              {depositBalance -
                                (totalAmount -
                                  agent?.agent_commission * seatCount)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-between mb-4">
                          <div>
                            <span>Credit Balance</span>
                          </div>

                          {!agent?.agent_commission && (
                            <span className="font-bold">
                              {creditBalance -
                                (totalAmount + commission * seatCount)}
                            </span>
                          )}
                          {agent?.agent_commission && (
                            <span className="font-bold">
                              {creditBalance -
                                (totalAmount - commission * seatCount)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Request */}
                  {specialRequest && (
                    <div className="col-start-1 col-span-2 mt-1">
                      <div className="flex flex-col">
                        <div>Note</div>
                        <div>{specialRequest}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 pt-3 pb-24 text-start text-[16px] font-semibold bg-gray-50 border-t border-gray-400">
                <p>Arrive at least 30 mins before departure.</p>
                <p className="text-[15px]">
                  (ယာဥ်ထွက်ချိန်မတိုင်မီ အနည်းဆုံး ၃၀
                  မိနစ်ခန့်ကြိုရောက်လာပေးပါရန်)
                </p>
                <p>Bring your NRC/ Passport.</p>
                <p className="text-[15px]">
                  (မှတ်ပုံတင်/ပတ်စပို့ ယူဆောင်လာပေးပါရန်)
                </p>
                <div className="flex items-center justify-between">
                  <p>Tickets are non-refundable.</p>
                  <p className="text-center text-xl font-bold">
                    {totalAmount === 0 ? "UNPAID BOOKING" : "PAID"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[15px]">
                    (ဝယ်ယူပြီးလက်မှတ်အတွက် ငွေပြန်မအမ်းပါ)
                  </p>
                  <p className="text-center text-base font-bold">
                    {salePlatform}
                  </p>
                </div>
              </div>
            </div>
            {/* divRefCompany ends here */}
          </div>

          {/* customer print */}
          <div className={`${userRole === "AGENT" ? "hidden" : "block"}`}>
            <h3 className="text-center mt-3 font-semibold">
              Customer Receipt Print Preview
            </h3>
            <div
              ref={divRef}
              className="w-[576px] rounded-2xl shadow-lg overflow-hidden bg-white border border-gray-200"
              style={{ marginTop: "20px", marginBottom: "40px" }}
            >
              {/* Brand */}
              <div className="pb-3 flex flex-row gap-5 border-b border-gray-400">
                <div className="w-1/2">
                  <img
                    src="/ticket-logo.png"
                    alt="logo"
                    className="h-auto pt-4 mb-2"
                  />
                </div>
                <div className="w-1/2 my-auto text-base">
                  <div>
                    <p>Customer Hotlines</p>
                    <p>09 40 88000 95</p>
                    <p>09 40 88000 98</p>
                  </div>
                </div>
              </div>

              {/* Content Wrapper with padding */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Left side */}
                  <div className=" border-r border-gray-400 pr-3">
                    <h2 className="text-center font-semibold">Route</h2>
                    <div className="flex justify-between mb-4">
                      <div>From</div>
                      <div>to</div>
                    </div>
                    <div className="flex justify-between mb-4">
                      <div>
                        {/* <GrLocation size={20} className="inline-block mr-2" /> */}
                        <span>{selectedRoute?.start}</span>
                      </div>
                      {/* <FaArrowRight size={15} /> */}
                      <div>
                        {/* <GrMapLocation
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                        <span>{selectedRoute?.destination}</span>
                      </div>
                    </div>

                    <div className="flex justify-between mb-4">
                      <div>
                        {/* <IoCalendarClearOutline
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                        <span>Departure Date</span>
                      </div>
                      <span className="font-semibold">
                        {new Date(selectedDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between mb-4">
                      <div>
                        {/* <MdOutlineDepartureBoard
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                        <span>Boarding Time</span>
                      </div>
                      <span className="font-semibold">
                        {formatTo12Hour(selectedRoute?.departure)}
                      </span>
                    </div>

                    {/* Seat + Price */}
                    <div>
                      <div className="flex justify-between mb-4">
                        <div>
                          {/* <BsTicket size={20} className="inline-block mr-2" /> */}
                          <span>Seat No.</span>
                        </div>
                        <span className="font-semibold">
                          {selectedRoute?.vehicles_type?.seat_layout === "2:1"
                            ? selectedSeat
                                .map((s) => formatSeatLabel(s.number, 3))
                                .join(", ")
                            : selectedSeat.map((s) => s.number).join(", ")}
                        </span>
                      </div>

                      <div className="pb-3 flex justify-between">
                        <div>
                          {/* <CiMoneyBill
                            size={20}
                            className="inline-block mr-2"
                          /> */}
                          <span>Total Price</span>
                        </div>
                        <span className="font-bold">{totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* right side */}
                  <div>
                    <h2 className="text-center font-semibold">
                      Traveller Information
                    </h2>
                    <div className="mt-[40px] flex justify-between mb-4">
                      <div>
                        {/* <HiOutlineUserCircle
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                        <span>Traveller Name</span>
                      </div>
                      <span>{bookerName}</span>
                    </div>

                    <div className="flex justify-between mb-4">
                      <div>
                        {/* <MdOutlinePhone
                          size={20}
                          className="inline-block mr-2"
                        /> */}
                        <span>Phone</span>
                      </div>
                      <span>{phone}</span>
                    </div>

                    {nrc !== "/" && (
                      <div className="flex justify-between mb-4">
                        <div>
                          {/* <LiaIdCardSolid
                            size={20}
                            className="inline-block mr-2"
                          /> */}
                          <span>NRC</span>
                        </div>
                        <span>{NrcDisplay(nrc)}</span>
                      </div>
                    )}
                  </div>

                  {/* Special Request */}
                  {specialRequest && (
                    <div className="col-start-1 col-span-2 mt-1">
                      <div className="flex flex-col">
                        <div>Note</div>
                        <div>{specialRequest}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 pt-3 pb-20 text-start text-[16px] font-semibold bg-gray-50 border-t border-gray-400">
                <p>Arrive at least 30 mins before departure.</p>
                <p className="text-[15px]">
                  (ယာဥ်ထွက်ချိန်မတိုင်မီ အနည်းဆုံး ၃၀
                  မိနစ်ခန့်ကြိုရောက်လာပေးပါရန်)
                </p>
                <p>Bring your NRC/ Passport.</p>
                <p className="text-[15px]">
                  (မှတ်ပုံတင်/ပတ်စပို့ ယူဆောင်လာပေးပါရန်)
                </p>
                <div className="flex items-center justify-between">
                  <p>Tickets are non-refundable.</p>
                  <p className="text-center text-xl font-bold">
                    {totalAmount === 0 ? "UNPAID BOOKING" : "PAID"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[15px]">
                    (ဝယ်ယူပြီးလက်မှတ်အတွက် ငွေပြန်မအမ်းပါ)
                  </p>
                  <p className="text-center text-base font-bold">
                    {salePlatform}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* print view end */}

      <div className="py-1 flex flex-col gap-3 w-full lg:mx-auto lg:max-w-[500px]">
        <div className="flex gap-x-3 vertical-center justify-center text-center">
          <PermissionGate permission="Print_Company_Receipt">
            <button
              type="button"
              disabled={!!printing}
              onClick={() => handleSaveTicket(divRefCompany, "company")}
              className="w-1/2 bg-yellow-400 hover:bg-yellow-500 px-5 py-2 border-none rounded-sm text-subtitle font-semibold transition-colors duration-400 "
            >
              {printing === "company" ? "Printing..." : "Print Company Receipt"}
            </button>
          </PermissionGate>
          <PermissionGate permission="Print_Customer_Receipt">
            <button
              type="button"
              disabled={!!printing}
              onClick={() => handleSaveTicket(divRef, "client")}
              className="w-1/2 bg-green-500 hover:bg-green-600 px-5 py-2 border-none rounded-sm text-subtitle font-semibold transition-colors duration-400 "
            >
              {printing === "client" ? "Printing..." : "Print Client Receipt"}
            </button>
          </PermissionGate>
        </div>
        {/* handleBuyNewTicket */}
        <PermissionGate permission="New_Ticket">
          <button
            type="button"
            onClick={handleBuyNewTicket}
            className="w-full text-center bg-blue-500 hover:bg-blue-600 px-5 py-2 border-none rounded-sm text-subtitle font-semibold transition-colors duration-400"
          >
            Buy New Ticket
          </button>
        </PermissionGate>
      </div>
    </div>
  );
};

export default PrintTicket;
