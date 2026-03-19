import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { TablePaginationActions, emptyRows } from "../../../constants/config";
import { alertToggle, setDateFilter } from "../../../shares/shareSlice";
import { getData, setData } from "../../../helpers/localstorage";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AlertDialog from "../../../shares/AlertDialog";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmptyData from "../../../shares/EmptyData";
import { FilterByDate } from "../../../shares/FilterByDate";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ReloadData from "../../../shares/ReloadData";
import { SalesHistoryPayload } from "../SalesHistoryPayload";
import { SalesHistoryService } from "../SalesHistoryService";
import ScreenshotPreview from "../../../shares/ScreenshotPreview";
import SkeletonTable from "../../../shares/SkeletonTable";
import StatusColor from "../../../shares/StatusColor";
import { TableCustomizeSetting } from "../../../shares/TableCustomizeSetting";
import { TableSearch } from "../../../shares/TableSearch";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import dayjs from "dayjs";
import { setPaginate } from "../SalesHistorySlice";
import { useParams } from "react-router-dom";
import IsSettledColor from "../../../shares/IsSettledColor";

export const SalesHistory = () => {
  const { salesHistories, paginateParams, summary } = useSelector(
    (state) => state.salesHistory
  );
  // const { id, role } = useParams();

  const { startFilterDate, endFilterDate, selectedId } = useSelector(
    (state) => state.share
  );
  const params = useParams();
  console.log("params", params);
  const dispatch = useDispatch();

  const loadingData = useCallback(async () => {
    const result = await SalesHistoryService.index(
      dispatch,
      params.id,
      paginateParams
    );
    if (result.status === 200) {
      setTotal(result.data.histories.total);
    }
    setIsLoading(false);
    if (getData(SalesHistoryPayload.columnsName) == null) {
      setData(SalesHistoryPayload.columnsName, SalesHistoryPayload.columns);
    }
  }, [dispatch, params.id, paginateParams]);

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

  const currentRole = salesHistories.length > 0 ? salesHistories[0].role : null;

  const agentInfo = salesHistories.length > 0 ? salesHistories[0].agent : null;

  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [columnIds, setColumnIds] = useState("");
  const [sort, setSort] = useState(true);

  const [columns, setColumns] = useState(
    getData(SalesHistoryPayload.columnsName) == null
      ? SalesHistoryPayload.columns
      : getData(SalesHistoryPayload.columnsName)
  );

  const [selectedFilters, setSelectedFilters] = useState(["all"]);

  //name Filter
  const [nameOptions, setNameOptions] = useState([]); // names to display in dropdown
  const [selectedNames, setSelectedNames] = useState([]); // selected names

  useEffect(() => {
    if (!salesHistories) return;

    let names = [];

    if (selectedFilters.includes("sale")) {
      const users = salesHistories
        .filter((r) => r.user_f)
        .map((r) => ({
          id: r.user_id,
          name: r.user_f.name,
        }));
      names = names.concat(users);
    }

    if (selectedFilters.includes("agent")) {
      const agents = salesHistories
        .filter((r) => r.agent)
        .map((r) => ({
          id: r.agent_id,
          name: r.agent.name,
        }));
      names = names.concat(agents);
    }

    if (selectedFilters.includes("member")) {
      const members = salesHistories
        .filter((r) => r.member_id && r.member_id !== "Unknown")
        .map((r) => ({ id: r.member_id, name: r.member_id }));
      names = names.concat(members);
    }

    if (selectedFilters.includes("kpay")) {
      const kpays = salesHistories
        .filter((r) => r.kpay_member_id)
        .map((r) => ({
          id: r.kpay_member_id,
          name: r.kpay_member_id,
        }));
      names = names.concat(kpays);
    }

    // remove duplicates
    const uniqueNames = Array.from(
      new Map(names.map((n) => [n.id, n])).values()
    );
    setNameOptions(uniqueNames);

    // DO NOT select anything by default
    setSelectedNames([]);
  }, [selectedFilters, salesHistories]);

  const onPageChange = (event, newPage) => {
    dispatch(
      setPaginate({
        ...paginateParams,
        page: newPage,
      })
    );
  };

  const onRowPerPageChange = (event) => {
    dispatch(
      setPaginate({
        ...paginateParams,
        page: 1,
        per_page: parseInt(event.target.value, 10),
      })
    );
  };

  const onHandleSort = (event, label) => {
    setSort(!sort);
    dispatch(
      setPaginate({
        ...paginateParams,
        sort: sort ? "ASC" : "DESC",
        order: label?.toLowerCase(),
      })
    );
  };

  const ColumnSortHandle = (id) => {
    if (columnIds === id) {
      return sort ? "asc" : "desc";
    }
  };

  const onSearchChange = (event) => {
    dispatch(
      setPaginate({
        ...paginateParams,
        search: event,
      })
    );
  };

  const reloadData = () => {
    dispatch(setDateFilter(""));
    dispatch(setPaginate(SalesHistoryPayload.paginateParams));
  };

  const deleteData = async () => {
    setIsLoading(true);
    const result = await SalesHistoryService.destory(dispatch, selectedId);
    if (result.status === 200) {
      dispatch(alertToggle());
      loadingData();
      setIsLoading(false);
    } else {
      setIsLoading(false);
      dispatch(alertToggle());
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    setData(SalesHistoryPayload.columnsName, columns);
  }, [columns]);

  const filteredPaymentHistorys = salesHistories.filter((row) => {
    // 1️⃣ First time: "all" or no filters selected → show all rows
    if (
      !selectedFilters ||
      selectedFilters.length === 0 ||
      selectedFilters.includes("all")
    ) {
      return true;
    }

    // 2️⃣ Prepare individual checks
    const saleCheck =
      selectedFilters.includes("sale") &&
      row.user_id != null &&
      row.user_id !== "Unknown" &&
      (!selectedNames ||
        selectedNames.length === 0 ||
        selectedNames.includes(row.user_id));

    const agentCheck =
      selectedFilters.includes("agent") &&
      row.agent_id != null &&
      row.agent_id !== "Unknown" &&
      (!selectedNames ||
        selectedNames.length === 0 ||
        selectedNames.includes(row.agent_id));

    const memberCheck =
      selectedFilters.includes("member") &&
      row.member_id != null &&
      row.member_id !== "Unknown" &&
      (!selectedNames ||
        selectedNames.length === 0 ||
        selectedNames.includes(row.member_id));

    const kpayCheck =
      selectedFilters.includes("kpay") &&
      row.kpay_member_id != null &&
      row.kpay_member_id !== "Unknown" &&
      (!selectedNames ||
        selectedNames.length === 0 ||
        selectedNames.includes(row.kpay_member_id));

    // 3️⃣ Role-based logic (optional)
    if (row.role === "AGENT") {
      if (row.agent?.is_agent === 1) return memberCheck; // agent sees member
      return kpayCheck; // agent sees kpay
    }

    // 4️⃣ For SUPER_ADMIN or other roles → all applicable checks
    return saleCheck || agentCheck || memberCheck || kpayCheck;
  });

  const printAllData = () => {
    if (!filteredPaymentHistorys || !filteredPaymentHistorys.length) {
      alert("No data to print");
      return;
    }

    // Open a new print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    // Build table rows safely
    const tableRows = filteredPaymentHistorys
      .map((row) => {
        const seatMapping = (number) => {
          if (row.route?.vehicles_type_id === 1) {
            const rowIndex = Math.floor((number - 1) / 3); // which row (0 = A, 1 = B, etc.)
            const rowLetter = String.fromCharCode(65 + rowIndex); // 65 = 'A'
            const seatPos = 3 - ((number - 1) % 3); // 3, 2, 1
            return `${rowLetter}${seatPos}`;
          }
          return number; // fallback if not type 1
        };
        return `<tr>
          ${columns
            .map((col) => {
              let value = row[col.id];

              try {
                switch (col.id) {
                  case "created_at":
                    if (!value) return '""';
                    try {
                      const date = new Date(value);

                      // Add 6.5 hours for Yangon
                      date.setHours(date.getHours());
                      date.setMinutes(date.getMinutes());

                      const dd = String(date.getDate()).padStart(2, "0");
                      const mm = String(date.getMonth() + 1).padStart(2, "0");
                      const yyyy = date.getFullYear();

                      let hh = date.getHours();
                      const min = String(date.getMinutes()).padStart(2, "0");
                      const ss = String(date.getSeconds()).padStart(2, "0");

                      const ampm = hh >= 12 ? "PM" : "AM";
                      hh = hh % 12;
                      hh = hh ? hh : 12;
                      hh = String(hh).padStart(2, "0");

                      return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss} ${ampm}`;
                    } catch (err) {
                      return '"Invalid date"';
                    }

                  case "seat":
                    let seats = [];
                    if (Array.isArray(value)) seats = value;
                    else if (typeof value === "string")
                      seats = JSON.parse(value || "[]");

                    return `<td>${
                      seats.length
                        ? seats
                            .map(
                              (s) => `${seatMapping(Number(s.number))}` // (${s.type})
                            )
                            .join(", ")
                        : "No data"
                    }</td>`;
                  case "start_time":
                    const date = value ? value.split("T")[0] : "No date";
                    const time = row.route?.departure
                      ? (() => {
                          const [h, m] = row.route.departure
                            .split(":")
                            .map(Number);
                          return `${h % 12 || 12}:${m
                            .toString()
                            .padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
                        })()
                      : "No time";
                    return `<td>${date} (${time})</td>`;
                  case "status":
                    let color = "#000";
                    if (value === "SUCCESS") color = "green";
                    else if (value === "PENDING") color = "orange";
                    else if (value === "REJECTED") color = "red";
                    return `<td style="color:${color}; font-weight:bold;">${value}</td>`;
                  case "screenshot":
                    return `<td>${
                      value ? `<img src="${value}" width="60" />` : "No data"
                    }</td>`;
                  default:
                    return `<td>${value ?? ""}</td>`;
                }
              } catch (err) {
                return "<td>Error</td>";
              }
            })
            .join("")}
        </tr>`;
      })
      .join("");

    // Full HTML
    const tableHtml = `
      <html>
        <head>
          <title>Payment History</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h3 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h3>Payment History</h3>
          <table>
            <thead>
              <tr>
                ${columns.map((col) => `<th>${col.label}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // CSV Export Function
  const exportCsvData = () => {
    if (!filteredPaymentHistorys || !filteredPaymentHistorys.length) {
      alert("No data to export");
      return;
    }

    // Build CSV header
    const headers = columns.map((col) => `"${col.label}"`).join(",");

    // Build CSV rows
    const rows = filteredPaymentHistorys.map((row) =>
      columns
        .map((col) => {
          let value = row[col.id];
          const seatMapping = (number) => {
            if (row.route?.vehicles_type_id === 1) {
              const rowIndex = Math.floor((number - 1) / 3); // which row (0 = A, 1 = B, etc.)
              const rowLetter = String.fromCharCode(65 + rowIndex); // 65 = 'A'
              const seatPos = 3 - ((number - 1) % 3); // 3, 2, 1
              return `${rowLetter}${seatPos}`;
            }
            return number; // fallback if not type 1
          };
          try {
            switch (col.id) {
              case "created_at":
                if (!value) return '""';
                try {
                  const date = new Date(value);

                  // Add 6.5 hours for Yangon
                  date.setHours(date.getHours() + 6);
                  date.setMinutes(date.getMinutes() + 30);

                  const dd = String(date.getDate()).padStart(2, "0");
                  const mm = String(date.getMonth() + 1).padStart(2, "0");
                  const yyyy = date.getFullYear();

                  let hh = date.getHours();
                  const min = String(date.getMinutes()).padStart(2, "0");
                  const ss = String(date.getSeconds()).padStart(2, "0");

                  const ampm = hh >= 12 ? "PM" : "AM";
                  hh = hh % 12;
                  hh = hh ? hh : 12;
                  hh = String(hh).padStart(2, "0");

                  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss} ${ampm}`;
                } catch (err) {
                  return '"Invalid date"';
                }

              case "updated_at":
                if (!value) return '""';
                try {
                  const date = new Date(value);

                  // Add 6.5 hours for Yangon
                  date.setHours(date.getHours());
                  date.setMinutes(date.getMinutes());

                  const dd = String(date.getDate()).padStart(2, "0");
                  const mm = String(date.getMonth() + 1).padStart(2, "0");
                  const yyyy = date.getFullYear();

                  let hh = date.getHours();
                  const min = String(date.getMinutes()).padStart(2, "0");
                  const ss = String(date.getSeconds()).padStart(2, "0");

                  const ampm = hh >= 12 ? "PM" : "AM";
                  hh = hh % 12;
                  hh = hh ? hh : 12;
                  hh = String(hh).padStart(2, "0");

                  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss} ${ampm}`;
                } catch (err) {
                  return '"Invalid date"';
                }

              case "seat":
                let seats = [];
                if (Array.isArray(value)) seats = value;
                else if (typeof value === "string")
                  seats = JSON.parse(value || "[]");

                return `"${
                  seats.length
                    ? seats
                        .map(
                          (s) => `${seatMapping(s.number)}` // (${s.type})
                        )
                        .join(", ")
                    : "No data"
                }"`;
              case "start_time":
                const date = value ? value.split("T")[0] : "No date";
                const time = row.route?.departure
                  ? (() => {
                      const [h, m] = row.route.departure.split(":").map(Number);
                      return `${h % 12 || 12}:${m
                        .toString()
                        .padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
                    })()
                  : "No time";
                return `"${date} (${time})"`;
              case "status":
                return `"${value ?? ""}"`;
              case "screenshot":
                return `"${value ?? ""}"`; // URLs or empty
              default:
                return `"${value ?? ""}"`;
            }
          } catch (err) {
            return `"Error"`;
          }
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "payment_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Breadcrumb />

      {isLoading ? (
        <SkeletonTable />
      ) : (
        <Paper
          sx={{
            width: "100%",
            marginTop: "10px",
          }}
        >
          <div className="flex flex-col justify-start items-start md:flex-row md:items-center gap-5 flex-wrap md:max-w-[768px] xl:max-w-[1440px]">
            <TableCustomizeSetting
              payload={SalesHistoryPayload.columns}
              columns={columns}
              setColumns={(e) => setColumns(e)}
            />
            <ReloadData reloadData={reloadData} />

            {/* <FilterByDate onFilter={onFilterByDate} /> */}
            <div>
              {/* <InputLabel>From Date</InputLabel> */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    paginateParams.start_date
                      ? dayjs(paginateParams.start_date)
                      : null
                  }
                  onChange={(date) =>
                    dispatch(
                      setPaginate({
                        ...paginateParams,
                        start_date: date ? date.format("YYYY-MM-DD") : null,
                      })
                    )
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "From",
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
              <ValidationMessage field={"start_date"} />
            </div>

            <div>
              {/* <InputLabel>To Date</InputLabel> */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={
                    paginateParams.end_date
                      ? dayjs(paginateParams.end_date)
                      : null
                  }
                  onChange={(date) =>
                    dispatch(
                      setPaginate({
                        ...paginateParams,
                        end_date: date ? date.format("YYYY-MM-DD") : null,
                      })
                    )
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "To",
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
              <ValidationMessage field={"end_date"} />
            </div>

            <Button variant="contained" color="primary" onClick={printAllData}>
              Print All
            </Button>
            <Button variant="outlined" color="success" onClick={exportCsvData}>
              Export CSV
            </Button>
          </div>

          {summary && (
            <div className="py-3 flex flex-col lg:flex-row gap-4">
              <Paper
                elevation={3}
                className="p-4 flex flex-col justify-center items-center shadow-md rounded-xl min-w-[250px]"
              >
                <p className="text-sm font-medium text-gray-500">
                  Total (Overall)
                </p>
                <h2 className="text-2xl font-bold text-blue-600 mt-1">
                  {Number(summary.total).toLocaleString()} Ks
                </h2>
              </Paper>

              <Paper
                elevation={3}
                className="p-4 flex flex-col justify-center items-center shadow-md rounded-xl min-w-[250px]"
              >
                <p className="text-sm font-medium text-gray-500">
                  Total Purchased Amount
                </p>
                <h2 className="text-2xl font-bold text-green-600 mt-1">
                  {Number(summary.total_purchased_amount).toLocaleString()} Ks
                </h2>
              </Paper>

              <Paper
                elevation={3}
                className="p-4 flex flex-col justify-center items-center shadow-md rounded-xl min-w-[250px]"
              >
                <p className="text-sm font-medium text-gray-500">
                  Total Commission
                </p>
                <h2 className="text-2xl font-bold text-red-600 mt-1">
                  {Number(summary.total_commission).toLocaleString()} Ks
                </h2>
              </Paper>
            </div>
          )}

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
                  {filteredPaymentHistorys.map((row) => {
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
                                65 + rowIndex
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
                                    "0"
                                  );
                                  const mm = String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0");
                                  const yyyy = date.getFullYear();

                                  let hh = date.getHours();
                                  const min = String(
                                    date.getMinutes()
                                  ).padStart(2, "0");
                                  const ss = String(date.getSeconds()).padStart(
                                    2,
                                    "0"
                                  );

                                  const ampm = hh >= 12 ? "PM" : "AM";
                                  hh = hh % 12;
                                  hh = hh ? hh : 12;
                                  hh = String(hh).padStart(2, "0");

                                  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss} ${ampm}`;
                                } catch (err) {
                                  return '"Invalid date"';
                                }

                              case "updated_at":
                                if (!value) return '""';
                                try {
                                  const date = new Date(value);

                                  // Add 6.5 hours for Yangon
                                  date.setHours(date.getHours() + 6);
                                  date.setMinutes(date.getMinutes() + 30);

                                  const dd = String(date.getDate()).padStart(
                                    2,
                                    "0"
                                  );
                                  const mm = String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0");
                                  const yyyy = date.getFullYear();

                                  let hh = date.getHours();
                                  const min = String(
                                    date.getMinutes()
                                  ).padStart(2, "0");
                                  const ss = String(date.getSeconds()).padStart(
                                    2,
                                    "0"
                                  );

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
                                              `${seatMapping(seat.number)}`
                                          )
                                          .join(", ")
                                      : Array.isArray(JSON.parse(value))
                                      ? JSON.parse(value)
                                          .map(
                                            (seat) =>
                                              `${seatMapping(seat.number)}`
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
                                            .map(Number)
                                        )
                                      : "No time available"}
                                    )
                                  </p>
                                );
                              case "status":
                                return <StatusColor value={value} />;
                              case "is_settled":
                                return <IsSettledColor value={value ?? "NO"} />;
                              case "screenshot":
                                return <ScreenshotPreview value={value} />;
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
                                                "ဤလက်မှတ်၏ ငွေပေးချေမှု မှန်ကန်သည်မှာ သေချာပါသလား?"
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
                                                "ဤလက်မှတ်ကို ပယ်ဖျက်ရန် သေချာပါသလား?"
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
                                                "ဤလက်မှတ်ကို ပယ်ဖျက်ရန် သေချာပါသလား?"
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
                  {emptyRows(
                    paginateParams.page,
                    paginateParams.rowsPerPage,
                    salesHistories
                  ) > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              )}
            </Table>
          </TableContainer>
          {total === 0 && <EmptyData />}
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"right"}
            sx={{
              width: "100%",
            }}
          >
            <TableRow>
              <TableCell>
                <TablePagination
                  sx={{
                    width: "100%",
                  }}
                  rowsPerPageOptions={[5, 10, 25]}
                  colSpan={3}
                  count={total}
                  rowsPerPage={paginateParams.per_page}
                  page={paginateParams ? paginateParams.page - 1 : 0}
                  SelectProps={{
                    inputProps: {
                      "aria-label": "rows per page",
                    },
                    native: true,
                  }}
                  onPageChange={onPageChange}
                  onRowsPerPageChange={onRowPerPageChange}
                  ActionsComponent={TablePaginationActions}
                />
              </TableCell>
            </TableRow>
          </Box>
        </Paper>
      )}
      <AlertDialog
        onAgree={() => deleteData()}
        title="အတည်ပြုရန်"
        // body="Are You Want to Delete All Seats from this ticket?"
        body="ဤလက်မှတ်တွင် ပါဝင်သော ခုံနံပါတ်များအားလုံးကို ဖျက်ရန်သေချာပါသလား?"
        //title="WARNING!"
        //body="This action will permanently delete the selected data. This process cannot be undone.
      />
    </div>
  );
};
