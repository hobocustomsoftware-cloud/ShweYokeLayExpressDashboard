import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { TablePaginationActions, emptyRows } from "../../../constants/config";
import { getData, setData } from "../../../helpers/localstorage";
import {
  setPaginate,
  updateAdminData,
  updateAgentData,
  updateAgentSummary,
  updateSummary,
} from "../dashboardSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AnalyticEcommerce from "../../../shares/AnalyticEcommerce";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import EmptyData from "../../../shares/EmptyData";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PermissionGate } from "../../../helpers/PermissionGate";
import ReloadData from "../../../shares/ReloadData";
import { SalesHistoryService } from "../../finance/SalesHistoryService";
import SkeletonDashboard from "../../../shares/SkeletonDashboard";
import StatusColor from "../../../shares/StatusColor";
import { TableCustomizeSetting } from "../../../shares/TableCustomizeSetting";
import { dashboardPayload } from "../dashboardPayload";
import { dashboardService } from "../dashboardService";
import dayjs from "dayjs";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { AirplaneTicketOutlined } from "@mui/icons-material";
import { Chip, Stack } from "@mui/material";

export const DashboardList = () => {
  const [openNoti, setOpenNoti] = useState(false);
  const [notiData, setNotiData] = useState([]);
  const [hasNoti, setHasNoti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = useSelector((state) => state.share.role);
  const dashboardData = useSelector((state) => state.dashboard);
  const user = useSelector((state) => state.share.user);
  const loggedInUserId = user?.id;
  const [tableData, setTableData] = useState([]);
  const [paginateParams, setPaginateParams] = useState({
    page: 1,
    per_page: 20,
    start_date: null,
    end_date: null,
  });
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState(true);
  const [columnIds, setColumnIds] = useState("");
  const dispatch = useDispatch();
  const [columns, setColumns] = useState(
    getData(dashboardPayload.columnsName) == null
      ? dashboardPayload.columns
      : getData(dashboardPayload.columnsName),
  );
  const [selectedDates, setSelectedDates] = useState({
    start_date: paginateParams.start_date,
    end_date: paginateParams.end_date,
  });

  // Loading Data
  const loadingData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await dashboardService.dashboardData(dispatch, {
        ...paginateParams,
        loggedInUserId: loggedInUserId,
        role: userRole,
      });
      if (result.status) {
        const noti = result?.data?.dashboard_noti;

        if (noti) {
          setHasNoti(noti.has_new_noti);
          setNotiData(noti.pending_histories || []);
        }

        const paymentHistories = result.data?.payment_histories;
        setTotal(paymentHistories?.total ?? 0);

        if (getData(dashboardPayload.columnsName) == null) {
          setData(dashboardPayload.columnsName, dashboardPayload.columns);
        }
        setTableData(paymentHistories?.data ?? []);

        dispatch(
          updateAdminData([
            //  ! company data starts
            {
              color: "bg-orange-100",
              label: "Today Total Ticket Count",
              // label: "နေ့စဉ် လက်မှတ်အရောင်း",
              value: result?.data?.company_summary?.com_today_seat_count || 0,
            },
            {
              color: "bg-orange-100",
              label: "Weekly Total Ticket Count",
              // label: "အပတ်စဉ် လက်မှတ်အရောင်း",
              value: result?.data?.company_summary?.com_weekly_seat_count || 0,
            },
            {
              color: "bg-orange-100",
              label: "Monthly Total Ticket Count",
              // label: "လစဉ် လက်မှတ်အရောင်း",
              value: result?.data?.company_summary?.com_monthly_seat_count || 0,
            },
            {
              color: "bg-orange-100",
              label: "Yearly Total Ticket Count",
              // label: "နှစ်စဉ် လက်မှတ်အရောင်း",
              value:
                result?.data?.company_summary?.com_yearly_seat_count?.toLocaleString() ||
                0,
            },
            {
              color: "bg-orange-100",
              label: "Total Sales Amount",
              // label: "စပေါ်ငွေ လက်ကျန်",
              value:
                result?.data?.company_summary?.com_total_sale_amount?.toLocaleString() ||
                0,
            },
            // ! company data ends
            {
              color: "bg-orange-100",
              label: "User Used Commission",
              // label: "စပေါ်ငွေ လက်ကျန်",
              value:
                result?.data?.company_summary?.com_total_commission_amount?.toLocaleString() ||
                0,
            },
            {
              color: "bg-blue-100",
              label: "User Today Ticket Count",
              // label: "နေ့စဉ် လက်မှတ်အရောင်း",
              value: result?.data?.today_seat_count || 0,
            },
            {
              color: "bg-blue-100",
              label: "User Weekly Ticket Count",
              // label: "အပတ်စဉ် လက်မှတ်အရောင်း",
              value: result?.data?.weekly_seat_count || 0,
            },
            {
              color: "bg-blue-100",
              label: "User Monthly Ticket Count",
              // label: "လစဉ် လက်မှတ်အရောင်း",
              value: result?.data?.monthly_seat_count || 0,
            },
            {
              color: "bg-blue-100",
              label: "User Yearly Ticket Count",
              // label: "နှစ်စဉ် လက်မှတ်အရောင်း",
              value: result?.data?.yearly_seat_count?.toLocaleString() || 0,
            },
            {
              color: "bg-green-100",
              label: "User Used Commission",
              // label: "စပေါ်ငွေ လက်ကျန်",
              value: result?.data?.total_commission?.toLocaleString() || 0,
            },
            // ! super_admin ends
            {
              color: "bg-green-100",
              label: "User Credit Amount",
              // label: "ကြိုသုံးငွေ",
              value: result?.data?.credit_amount?.toLocaleString() || 0,
            },
            {
              color: "bg-green-100",
              label: "User Credit Balance",
              // label: "ကြိုသုံးပြီးငွေ ပမာဏ",
              value: result?.data?.credit_balance?.toLocaleString() || 0,
            },
          ]),
        );
        dispatch(
          updateSummary([
            {
              color: "border border-blue-400",
              label: "Total Ticket Amount",
              value:
                result?.data?.sales_detail_summary?.total?.toLocaleString() ||
                0,
            },
            {
              color: "border border-blue-400",
              label: "Total Purchased Amount",
              value:
                result?.data?.sales_detail_summary?.total_purchased_amount?.toLocaleString() ||
                0,
            },
            {
              color: "border border-blue-400",
              label: "Total Commission",
              value:
                result?.data?.sales_detail_summary?.total_commission?.toLocaleString() ||
                0,
            },
            {
              color: "border border-blue-400",
              label: "Total Tickets",
              value:
                result?.data?.sales_detail_summary?.total_seat_count?.toLocaleString() ||
                0,
            },
          ]),
        );
        // console.log("result?.data >>> ", result);
        dispatch(
          updateAgentData([
            {
              label: "Today Ticket Count",
              // label: "နေ့စဉ် လက်မှတ်အရောင်း",
              value: result?.data?.today_seat_count || 0,
            },
            {
              label: "Weekly Ticket Count",
              // label: "အပတ်စဉ် လက်မှတ်အရောင်း",
              value: result?.data?.weekly_seat_count || 0,
            },
            {
              label: "Monthly Ticket Count",
              // label: "လစဉ် လက်မှတ်အရောင်း",
              value: result?.data?.monthly_seat_count || 0,
            },
            {
              label: "Yearly Ticket Count",
              // label: "နှစ်စဉ် လက်မှတ်အရောင်း",
              value: result?.data?.yearly_seat_count || 0,
            },
            {
              label: "Commission Per Ticket",
              value: result?.data?.user_commission_rate || 0,
            },
            {
              label: "Deposit Amount",
              value: result?.data?.deposit_amount || 0,
            },
            {
              label: "Total Purchased Amount",
              value:
                result?.data?.total_amount - result?.data?.total_commission ||
                0,
            },
            {
              label: "Total Commission Earned",
              value: result?.data?.total_commission || 0,
            },
            {
              label: "Deposit Balance",
              value: result?.data?.deposit_balance || 0,
            },
            // for vip agents
            {
              label: "Credit Amount",
              // label: "ကြိုသုံးငွေ",
              value: result?.data?.credit_amount || 0,
            },
            {
              label: "Credit Balance",
              // label: "ကြိုသုံးပြီးငွေ ပမာဏ",
              value: result?.data?.credit_balance || 0,
            },
          ]),
        );

        dispatch(
          updateAgentSummary([
            {
              label: "Total Ticket Amount",
              value: result?.data?.agent_sales_summary?.total ?? 0,
            },
            {
              label: "Total Purchased Amount",
              value:
                result?.data?.agent_sales_summary?.total_purchased_amount ?? 0,
            },
            {
              label: "Total Commission",
              value: result?.data?.agent_sales_summary?.total_commission ?? 0,
            },
          ]),
        );
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, paginateParams, loggedInUserId, userRole]);

  const reloadData = () => {
    // Reset both Redux paginateParams + local state
    const resetParams = {
      ...dashboardPayload.paginateParams,
      start_date: null,
      end_date: null,
    };

    setPaginateParams(resetParams); // reset local state
    dispatch(setPaginate(resetParams)); // reset redux state
    loadingData();
  };

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    setData(dashboardPayload.columnsName, columns);
  }, [columns]);

  const handleDateChange = (field, date) => {
    const formatted = date ? date.format("YYYY-MM-DD") : null;
    setSelectedDates((prev) => ({ ...prev, [field]: formatted }));
  };
  const applyFilters = () => {
    const updatedParams = {
      ...paginateParams,
      start_date: selectedDates.start_date,
      end_date: selectedDates.end_date,
      page: 1, // reset page if you want
    };
    setPaginateParams(updatedParams);
    dispatch(setPaginate(updatedParams));
    loadingData();
  };

  const onRowPerPageChange = (event) => {
    dispatch(
      setPaginate({
        ...paginateParams,
        page: 1,
        per_page: parseInt(event.target.value, 20),
      }),
    );
  };

  const onPageChange = (event, newPage) => {
    dispatch(
      setPaginate({
        ...paginateParams,
        page: newPage,
      }),
    );
  };

  const onHandleSort = (event, label) => {
    setSort(!sort);
    dispatch(
      setPaginate({
        ...paginateParams,
        sort: sort ? "ASC" : "DESC",
        order: label?.toLowerCase(),
      }),
    );
  };

  const ColumnSortHandle = (id) => {
    if (columnIds === id) {
      return sort ? "asc" : "desc";
    }
  };

  const confirmTicket = async (id) => {
    setIsLoading(true);
    const confirm = await SalesHistoryService.show(dispatch, id, "confirm");
    if (confirm.status === 200) {
      loadingData();
    }
    setIsLoading(false);
  };

  const rejectTicket = async (id) => {
    setIsLoading(true);
    const reject = await SalesHistoryService.destory(dispatch, id);
    if (reject.status === 200) {
      loadingData();
    }
    setIsLoading(false);
  };

  const renderCards = (dataList) =>
    dataList.map((data, index) => (
      <div key={index} className={`w-full max-w-[295px] sm:w-1/2 lg:w-1/3 p-2`}>
        <AnalyticEcommerce
          title={data.label}
          count={data.value}
          color={data.color}
        />
      </div>
    ));

  const seatMapping = (number, routeType) => {
    if (routeType === 1) {
      const rowIndex = Math.floor((number - 1) / 3);
      const rowLetter = String.fromCharCode(65 + rowIndex);
      const seatPos = ((number - 1) % 3) + 1;
      return `${rowLetter}${seatPos}`;
    }
    return number;
  };

  const parseSeats = (seatStr) => {
    try {
      return JSON.parse(seatStr || "[]");
    } catch {
      return [];
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";

    const [hourStr, minute] = timeStr.trim().split(":");
    let hour = parseInt(hourStr, 10);

    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${period}`;
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-start mb-3">
        <IconButton onClick={() => setOpenNoti(true)}>
          <NotificationsIcon
            sx={{
              color: hasNoti ? "red" : "action.active",
            }}
          />
        </IconButton>
      </div>
      <Breadcrumb />

      {isLoading ? (
        <SkeletonDashboard />
      ) : (
        <div>
          <PermissionGate permission="Dashboard_All">
            <div>
              {" "}
              {/* counts */}
              <div className="font-semibold text-xl py-5">
                {user?.name}&nbsp;Statistics
              </div>
              {userRole === "SUPER_ADMIN" && (
                <>
                  <div className="max-w-[1000px] flex flex-col xl:flex-row flex-wrap -m-2">
                    {renderCards(dashboardData?.adminData?.slice(0, 11) || [])}
                  </div>

                  <hr className="mt-6 mb-3 border-gray-300" />
                  <div className="font-semibold text-xl pb-5">
                    Searched Summary
                  </div>

                  <div className="max-w-[1000px] flex flex-col xl:flex-row flex-wrap -m-2">
                    {renderCards(dashboardData?.summary || [])}
                  </div>
                </>
              )}
              {userRole === "SALES" && (
                <>
                  <div className="max-w-[1000px] flex flex-col xl:flex-row flex-wrap -m-2">
                    {renderCards(dashboardData?.adminData?.slice(6, 13) || [])}
                  </div>

                  <hr className="mt-6 mb-3 border-gray-300" />
                  <div className="font-semibold text-xl pb-5">
                    Searched Summary
                  </div>

                  <div className="max-w-[1000px] flex flex-col xl:flex-row flex-wrap -m-2">
                    {renderCards(dashboardData?.summary || [])}
                  </div>
                </>
              )}
              {userRole === "AGENT" && (
                <>
                  <div className="max-w-[1000px] flex flex-col xl:flex-row flex-wrap -m-2">
                    {renderCards(dashboardData?.agentData || [])}
                  </div>

                  <hr className="mt-6 mb-3 border-gray-300" />
                  <div className="font-semibold text-xl pb-5">
                    Searched Summary
                  </div>

                  <div className="max-w-[1000px] flex flex-col xl:flex-row flex-wrap -m-2">
                    {renderCards(dashboardData?.agentSummary || [])}
                  </div>
                </>
              )}
            </div>
          </PermissionGate>

          {/* table */}
          {/* overflow-scroll */}
          <div className="pt-10 max-w-[350px] md:max-w-[768px] lg:max-w-full">
            {/* Date Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <TableCustomizeSetting
                payload={dashboardPayload.columns}
                columns={columns}
                setColumns={(e) => setColumns(e)}
              />

              {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    paginateParams.start_date
                      ? dayjs(paginateParams.start_date)
                      : null
                  }
                  onChange={(date) => handleDateChange("start_date", date)}
                  slotProps={{
                    textField: { size: "small", placeholder: "From" },
                  }}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    paginateParams.end_date
                      ? dayjs(paginateParams.end_date)
                      : null
                  }
                  onChange={(date) => handleDateChange("end_date", date)}
                  slotProps={{
                    textField: { size: "small", placeholder: "To" },
                  }}
                />
              </LocalizationProvider> */}

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    selectedDates.start_date != null
                      ? dayjs(selectedDates.start_date)
                      : null
                  }
                  onChange={(date) => handleDateChange("start_date", date)}
                  slotProps={{
                    textField: { size: "small", placeholder: "From" },
                  }}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    selectedDates.end_date != null
                      ? dayjs(selectedDates.end_date)
                      : null
                  }
                  onChange={(date) => handleDateChange("end_date", date)}
                  slotProps={{
                    textField: { size: "small", placeholder: "To" },
                  }}
                />
              </LocalizationProvider>

              <Button
                variant="contained"
                onClick={applyFilters} // Only fetch when clicked
                sx={{ textTransform: "none" }}
              >
                Apply Filter
              </Button>

              <ReloadData reloadData={reloadData} />
            </div>

            {/* Table */}
            <TableContainer sx={{ maxHeight: 540, overflowX: "auto" }}>
              <Table
                stickyHeader
                aria-label="payment history table"
                sx={{ minWidth: 1000 }}
              >
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        <TableSortLabel
                          active={true}
                          direction={ColumnSortHandle(column.id)}
                          onClick={(e) => {
                            onHandleSort(e, column.id);
                            setColumnIds(column.id);
                          }}
                        >
                          {column.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                {total !== 0 && (
                  <TableBody>
                    {tableData.map((row) => {
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row.id}
                        >
                          {columns.map((column) => {
                            const value = row[column.id];
                            const seatMapping = (number) => {
                              if (row.route?.vehicles_type_id === 1) {
                                const rowIndex = Math.floor((number - 1) / 3); // which row (0 = A, 1 = B, etc.)
                                const rowLetter = String.fromCharCode(
                                  65 + rowIndex,
                                ); // 65 = 'A'
                                const seatPos = 3 - ((number - 1) % 3); // 3, 2, 1
                                return `${rowLetter}${seatPos}`;
                              }
                              return number; // fallback if not type 1
                            };
                            const switchCase = ({ column, value }) => {
                              switch (column.id) {
                                case "member_name":
                                  return `${value} (${
                                    row["member"]?.is_agent
                                      ? `Agent : ${row["member"]?.commission}`
                                      : "Member"
                                  })`;

                                case "created_at":
                                  if (!value) return '""';
                                  try {
                                    const date = new Date(value);

                                    // Add 6.5 hours for Yangon
                                    date.setHours(date.getHours());
                                    date.setMinutes(date.getMinutes());

                                    const dd = String(date.getDate()).padStart(
                                      2,
                                      "0",
                                    );
                                    const mm = String(
                                      date.getMonth() + 1,
                                    ).padStart(2, "0");
                                    const yyyy = date.getFullYear();

                                    let hh = date.getHours();
                                    const min = String(
                                      date.getMinutes(),
                                    ).padStart(2, "0");
                                    const ss = String(
                                      date.getSeconds(),
                                    ).padStart(2, "0");

                                    const ampm = hh >= 12 ? "PM" : "AM";
                                    hh = hh % 12;
                                    hh = hh ? hh : 12;
                                    hh = String(hh).padStart(2, "0");

                                    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss} ${ampm}`;
                                  } catch (err) {
                                    return '"Invalid date"';
                                  }

                                case "seat":
                                  return (
                                    <p>
                                      {Array.isArray(value)
                                        ? value
                                            .map(
                                              (seat) =>
                                                `${seatMapping(seat.number)}`,
                                            )
                                            .join(", ")
                                        : Array.isArray(JSON.parse(value))
                                          ? JSON.parse(value)
                                              .map(
                                                (seat) =>
                                                  `${seatMapping(seat.number)}`,
                                              )
                                              .join(", ")
                                          : "No data"}
                                    </p>
                                  );
                                case "start_time":
                                  return (
                                    <p>
                                      {value
                                        ? value.split("T")[0]
                                        : "No date available"}
                                      (
                                      {row["route"]?.departure
                                        ? ((h, m) =>
                                            `${h % 12 || 12}:${m
                                              .toString()
                                              .padStart(2, "0")} ${
                                              h >= 12 ? "PM" : "AM"
                                            }`)(
                                            ...row["route"]?.departure
                                              .split(":")
                                              .map(Number),
                                          )
                                        : "No time available"}
                                      )
                                    </p>
                                  );
                                case "status":
                                  return <StatusColor value={value} />;
                                case "option":
                                  return (
                                    <>
                                      {row["status"] === "PENDING" && (
                                        <>
                                          <IconButton
                                            sx={{
                                              cursor: "pointer",
                                              marginRight: 1,
                                            }}
                                            onClick={() => {
                                              if (
                                                window.confirm(
                                                  "ဤလက်မှတ်၏ ငွေပေးချေမှု မှန်ကန်သည်မှာ သေချာပါသလား?",
                                                )
                                              ) {
                                                confirmTicket(row.id);
                                              }
                                            }}
                                          >
                                            <CheckCircleIcon
                                              style={{ color: "#1876D2" }}
                                            />
                                          </IconButton>

                                          <IconButton
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => {
                                              if (
                                                window.confirm(
                                                  "ဤလက်မှတ်ကို ပယ်ဖျက်ရန် သေချာပါသလား?",
                                                )
                                              ) {
                                                rejectTicket(row.id);
                                              }
                                            }}
                                          >
                                            <CancelIcon
                                              style={{ color: "red" }}
                                            />
                                          </IconButton>
                                        </>
                                      )}

                                      {(row["status"] === "SUCCESS" ||
                                        row["status"] === "BLOCKED" ||
                                        row["status"] === "BOOKED") && (
                                        <>
                                          <IconButton
                                            sx={{
                                              cursor: "pointer",
                                              marginRight: 1,
                                            }}
                                            onClick={() => {
                                              if (
                                                window.confirm(
                                                  "ဤလက်မှတ်ကို ပယ်ဖျက်ရန် သေချာပါသလား?",
                                                )
                                              ) {
                                                rejectTicket(row.id);
                                              }
                                            }}
                                          >
                                            <HighlightOffIcon
                                              style={{ color: "red" }}
                                            />
                                          </IconButton>
                                        </>
                                      )}
                                    </>
                                  );
                                default:
                                  return value;
                              }
                            };

                            return (
                              <TableCell
                                key={column.id}
                                align={column.align}
                                sx={{ paddingY: 0 }}
                              >
                                {switchCase({ column, value })}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                    {(() => {
                      const emptyRowsCount = emptyRows(
                        paginateParams.page ?? 1,
                        paginateParams.per_page ?? 20,
                        tableData,
                      );
                      return emptyRowsCount > 0 ? (
                        <TableRow style={{ height: 53 * emptyRowsCount }}>
                          <TableCell colSpan={columns.length} />
                        </TableRow>
                      ) : null;
                    })()}
                  </TableBody>
                )}
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                      <TablePagination
                        sx={{ width: "100%" }}
                        rowsPerPageOptions={[20, 50, 100]}
                        count={total ?? 0}
                        rowsPerPage={paginateParams?.per_page ?? 20}
                        page={(paginateParams?.page ?? 1) - 1}
                        onPageChange={onPageChange}
                        onRowsPerPageChange={onRowPerPageChange}
                        ActionsComponent={TablePaginationActions}
                        SelectProps={{
                          inputProps: { "aria-label": "rows per page" },
                          native: true,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>

            {total === 0 && <EmptyData />}
          </div>
        </div>
      )}

      <Dialog
        open={openNoti}
        onClose={() => setOpenNoti(false)}
        fullWidth
        maxWidth="sm"
      >
        {notiData.length > 0 && <DialogTitle>Pending Tickets</DialogTitle>}
        <DialogContent>
          {notiData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AirplaneTicketOutlined color="error" sx={{ fontSize: 40 }} />
              <h2 className="text-xl font-semibold text-gray-700">
                No Pending Tickets
              </h2>
              <p className="text-gray-400 mt-1">
                You don’t have any pending tickets at the moment.
              </p>
            </div>
          ) : (
            notiData.map((item) => {
              const seats = parseSeats(item.seat);
              const routeType = item.route?.vehicles_type_id;

              return (
                <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
                  <p>
                    <strong>ID:</strong> {item.id}
                  </p>

                  <p className="flex gap-2">
                    <strong>Seat:</strong>{" "}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {seats.map((s, idx) => (
                        <Chip
                          key={idx}
                          label={seatMapping(s.number, routeType)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Stack>
                  </p>

                  <p>
                    <strong>Departure:</strong> {item.start_time || "-"}{" "}
                    <span className="text-orange-600">
                      {formatTime(item.route?.departure)}
                    </span>
                  </p>

                  <p>
                    <strong>Name:</strong> {item.name}
                  </p>

                  <p>
                    <strong>Phone:</strong> {item.phone}
                  </p>

                  <p>
                    <strong>NRC:</strong> {item.nrc}
                  </p>

                  <p>
                    <strong>Note:</strong> {item.note ?? "-"}
                  </p>

                  <p>
                    <strong>Purchased Amount:</strong> {item.purchased_amount}
                  </p>

                  <p>
                    <strong>Route:</strong> {item.route?.name}
                  </p>
                </Paper>
              );
            })
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
