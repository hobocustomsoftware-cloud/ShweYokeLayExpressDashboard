import * as XLSX from "xlsx";

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TablePaginationActions, emptyRows } from "../../../constants/config";
import { alertToggle, setDateFilter } from "../../../shares/shareSlice";
import { getData, setData } from "../../../helpers/localstorage";
import { useDispatch, useSelector } from "react-redux";

import AlertDialog from "../../../shares/AlertDialog";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmptyData from "../../../shares/EmptyData";
import ExcelJS from "exceljs";
import { FilterByDate } from "../../../shares/FilterByDate";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { PermissionGate } from "../../../helpers/PermissionGate";
import ReloadData from "../../../shares/ReloadData";
import ScreenshotPreview from "../../../shares/ScreenshotPreview";
import SkeletonTable from "../../../shares/SkeletonTable";
import StatusColor from "../../../shares/StatusColor";
import { TableCustomizeSetting } from "../../../shares/TableCustomizeSetting";
import { TableSearch } from "../../../shares/TableSearch";
import { paymentHistoryPayload } from "../paymentHistoryPayload";
import { paymentHistoryService } from "../paymentHistoryService";
import { setPaginate } from "../paymentHistorySlice";

export const PaymentHistoryList = () => {
  const { paymentHistorys, paginateParams } = useSelector(
    (state) => state.paymentHistory
  );
  const { startFilterDate, endFilterDate, selectedId } = useSelector(
    (state) => state.share
  );

  const dispatch = useDispatch();

  const currentRole =
    paymentHistorys.length > 0 ? paymentHistorys[0].role : null;

  const agentInfo =
    paymentHistorys.length > 0 ? paymentHistorys[0].agent : null;

  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [columnIds, setColumnIds] = useState("");
  const [sort, setSort] = useState(true);

  const [columns, setColumns] = useState(
    getData(paymentHistoryPayload.columnsName) == null
      ? paymentHistoryPayload.columns
      : getData(paymentHistoryPayload.columnsName)
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const filterOptions =
    currentRole === "AGENT"
      ? agentInfo?.is_agent === 1
        ? [
            { id: "all", label: "All" },
            { id: "member", label: "Member" },
          ]
        : [
            { id: "all", label: "All" },
            { id: "kpay", label: "KPay" },
          ]
      : [
          { id: "all", label: "All" },
          { id: "sale", label: "Sales" },
          { id: "agent", label: "Agent" },
          { id: "member", label: "Member" },
          { id: "kpay", label: "KPay" },
        ];

  const [selectedFilters, setSelectedFilters] = useState(["all"]);

  // Menu handlers
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedFilters(filterOptions.map((f) => f.id));
    else setSelectedFilters([]);
  };

  const handleToggle = (id) => {
    setSelectedFilters((prev) => {
      let updated = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev.filter((f) => f !== "all"), id];
      if (updated.length === 0) updated = ["all"];
      return updated;
    });
  };

  //name Filter
  const [nameOptions, setNameOptions] = useState([]); // names to display in dropdown
  const [selectedNames, setSelectedNames] = useState([]); // selected names

  useEffect(() => {
    if (!paymentHistorys) return;

    let names = [];

    if (selectedFilters.includes("sale")) {
      const users = paymentHistorys
        .filter((r) => r.user_f)
        .map((r) => ({ id: r.user_id, name: r.user_f.name }));
      names = names.concat(users);
    }

    if (selectedFilters.includes("agent")) {
      const agents = paymentHistorys
        .filter((r) => r.agent)
        .map((r) => ({ id: r.agent_id, name: r.agent.name }));
      names = names.concat(agents);
    }

    if (selectedFilters.includes("member")) {
      const members = paymentHistorys
        .filter((r) => r.member_id && r.member_id !== "Unknown")
        .map((r) => ({ id: r.member_id, name: r.member_id }));
      names = names.concat(members);
    }

    if (selectedFilters.includes("kpay")) {
      const kpays = paymentHistorys
        .filter((r) => r.kpay_member_id)
        .map((r) => ({ id: r.kpay_member_id, name: r.kpay_member_id }));
      names = names.concat(kpays);
    }

    // remove duplicates
    const uniqueNames = Array.from(
      new Map(names.map((n) => [n.id, n])).values()
    );
    setNameOptions(uniqueNames);

    // DO NOT select anything by default
    setSelectedNames([]);
  }, [selectedFilters, paymentHistorys]);

  const paymentHistoryStatus = useRef(["ALL"]);

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

  const onFilter = (e) => {
    let updatePaginateParams = { ...paginateParams };

    if (e?.target?.value === "ALL") {
      updatePaginateParams.filter = "";
      updatePaginateParams.value = "";
    } else {
      updatePaginateParams.filter = "status";
      updatePaginateParams.value = e?.target?.value;
    }
    dispatch(setPaginate(updatePaginateParams));
  };

  const onFilterByDate = (e) => {
    let updatePaginateParams = { ...paginateParams };

    updatePaginateParams.start_date = e.startDate
      ? e.startDate.toISOString().split("T")[0]
      : "";
    updatePaginateParams.end_date = e.endDate
      ? e.endDate.toISOString().split("T")[0]
      : "";

    dispatch(setDateFilter(e));
    dispatch(setPaginate(updatePaginateParams));
  };

  const reloadData = () => {
    if (startFilterDate == undefined) {
      loadingData();
    }
    dispatch(setDateFilter(""));
    dispatch(setPaginate(paymentHistoryPayload.paginateParams));
  };

  const deleteData = async () => {
    setIsLoading(true);
    const result = await paymentHistoryService.destory(dispatch, selectedId);
    if (result.status == 200) {
      dispatch(alertToggle());
      loadingData();
      setIsLoading(false);
    } else {
      setIsLoading(false);
      dispatch(alertToggle());
    }
  };

  // const exportExcelData = async () => {
  //   await paymentHistoryService.exportexcel(dispatch);
  // };

  // const exportExcelParamsData = async () => {
  //   await paymentHistoryService.exportexcelparams(dispatch, paginateParams);
  // };

  // const exportPdfData = async () => {
  //   await paymentHistoryService.exportpdf(dispatch);
  // };

  // const exportPdfParamsData = async () => {
  //   await paymentHistoryService.exportpdfparams(dispatch, paginateParams);
  // };

  // const importData = async (e) => {
  //   setIsLoading(true);
  //   const formData = new FormData();
  //   formData.append("file", e);
  //   const create = await paymentHistoryService.import(formData, dispatch);
  //   if (create.status == 200) {
  //     loadingData();
  //   }
  //   setIsLoading(false);
  // };

  const loadingData = useCallback(async () => {
    // console.log("paginateParams", paginateParams);
    const result = await paymentHistoryService.index(dispatch, paginateParams);
    if (result.status === 200) {
      setTotal(result.data.total);
    }
    setIsLoading(false);
    if (getData(paymentHistoryPayload.columnsName) == null) {
      setData(paymentHistoryPayload.columnsName, paymentHistoryPayload.columns);
    }
  }, [dispatch, paginateParams]);

  const confirmTicket = async (id) => {
    setIsLoading(true);
    const confirm = await paymentHistoryService.show(dispatch, id, "confirm");
    if (confirm.status == 200) {
      loadingData();
    }
    setIsLoading(false);
  };

  const rejectTicket = async (id) => {
    setIsLoading(true);
    const reject = await paymentHistoryService.destory(dispatch, id);
    if (reject.status == 200) {
      loadingData();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    setData(paymentHistoryPayload.columnsName, columns);
  }, [columns]);

  // const filteredPaymentHistorys = paymentHistorys.filter((row) => {
  //   if (selectedFilters.includes("all")) return true;

  //   const agentCheck =
  //     selectedFilters.includes("agent") &&
  //     row.agent_id != null &&
  //     row.agent_id !== "Unknown";

  //   const memberCheck =
  //     selectedFilters.includes("member") &&
  //     row.member_id != null &&
  //     row.member_id !== "Unknown";

  //   const kpayCheck =
  //     selectedFilters.includes("kpay") &&
  //     row.kpay_member_id != null &&
  //     row.kpay_member_id !== "Unknown";

  //   return agentCheck || memberCheck || kpayCheck;
  // });
  // console.log("paymentHistorys :>> ", paymentHistorys);
  // const filteredPaymentHistorys = paymentHistorys.filter((row) => {
  //   if (selectedFilters.includes("all")) return true;

  //   const saleCheck =
  //     selectedFilters.includes("sale") &&
  //     row.user_id != null &&
  //     row.user_id !== "Unknown";

  //   const agentCheck =
  //     selectedFilters.includes("agent") &&
  //     row.agent_id != null &&
  //     row.agent_id !== "Unknown";

  //   const memberCheck =
  //     selectedFilters.includes("member") &&
  //     row.member_id != null &&
  //     row.member_id !== "Unknown";

  //   const kpayCheck =
  //     selectedFilters.includes("kpay") &&
  //     row.kpay_member_id != null &&
  //     row.kpay_member_id !== "Unknown";

  //   if (row.role === "AGENT") {
  //     // For AGENT role with agent.is_agent == 1 => only member
  //     if (row.agent?.is_agent == 1) return memberCheck;
  //     // For AGENT role but agent.is_agent != 1 => only kpay
  //     return kpayCheck;
  //   }

  //   // For SUPER_ADMIN or other roles => all checks
  //   return saleCheck || agentCheck || memberCheck || kpayCheck;
  // });

  const filteredPaymentHistorys = paymentHistorys.filter((row) => {
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

    // remove option column
    const printableColumns = columns.filter(
      (col) => !["option", "screenshot"].includes(col.id)
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    const tableRows = filteredPaymentHistorys
      .map((row) => {
        const seatMapping = (number) => {
          if (row.route?.vehicles_type_id === 1) {
            const rowIndex = Math.floor((number - 1) / 3);
            const rowLetter = String.fromCharCode(65 + rowIndex);
            const seatPos = 3 - ((number - 1) % 3);
            return `${rowLetter}${seatPos}`;
          }
          return number;
        };

        return `
        <tr>
          ${printableColumns
            .map((col) => {
              let value = row[col.id];

              try {
                switch (col.id) {
                  case "member_id":
                    return `<td>${
                      row.member?.is_agent
                        ? `${value} (Agent : ${row.member?.commission ?? "-"})`
                        : `${value} (Member)`
                    }</td>`;

                  case "seat":
                    let seats = [];
                    if (Array.isArray(value)) seats = value;
                    else if (typeof value === "string")
                      seats = JSON.parse(value || "[]");

                    return `<td>${
                      seats.length
                        ? seats
                            .map(
                              (s) =>
                                `${seatMapping(Number(s.number))} (${s.type})`
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

                  case "created_at":
                    if (!value) return `<td></td>`;
                    try {
                      const utcDate = new Date(value);
                      const ygDate = new Date(
                        utcDate.getTime() + 6.5 * 60 * 60 * 1000
                      );

                      const dd = String(ygDate.getUTCDate()).padStart(2, "0");
                      const mm = String(ygDate.getUTCMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const yyyy = ygDate.getUTCFullYear();
                      const hh = String(ygDate.getUTCHours()).padStart(2, "0");
                      const min = String(ygDate.getUTCMinutes()).padStart(
                        2,
                        "0"
                      );
                      const ss = String(ygDate.getUTCSeconds()).padStart(
                        2,
                        "0"
                      );

                      return `<td>${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}</td>`;
                    } catch {
                      return `<td>Invalid date</td>`;
                    }

                  case "updated_at":
                    if (!value) return `<td></td>`;
                    try {
                      const utcDate = new Date(value);
                      const ygDate = new Date(
                        utcDate.getTime() + 6.5 * 60 * 60 * 1000
                      );

                      const dd = String(ygDate.getUTCDate()).padStart(2, "0");
                      const mm = String(ygDate.getUTCMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const yyyy = ygDate.getUTCFullYear();
                      const hh = String(ygDate.getUTCHours()).padStart(2, "0");
                      const min = String(ygDate.getUTCMinutes()).padStart(
                        2,
                        "0"
                      );
                      const ss = String(ygDate.getUTCSeconds()).padStart(
                        2,
                        "0"
                      );

                      return `<td>${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}</td>`;
                    } catch {
                      return `<td>Invalid date</td>`;
                    }

                  default:
                    return `<td>${value ?? ""}</td>`;
                }
              } catch (err) {
                return "<td>Error</td>";
              }
            })
            .join("")}
        </tr>
      `;
      })
      .join("");

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
              ${printableColumns.map((col) => `<th>${col.label}</th>`).join("")}
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

  const exportXlsx = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Payment History");

    // Add header
    const headers = columns.map((c) => c.label);
    sheet.addRow(headers);

    // Add rows
    filteredPaymentHistorys.forEach((row) => {
      const rowData = columns.map((col) => row[col.id] ?? "");
      sheet.addRow(rowData);
    });

    // Apply Burmese-supported font to all cells
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.font = {
          name: "Pyidaungsu", // Unicode-safe
          size: 12,
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payment_history.xlsx";
    link.click();
  };

  console.log("clms", filteredPaymentHistorys);

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
              payload={paymentHistoryPayload.columns}
              columns={columns}
              setColumns={(e) => setColumns(e)}
            />
            <ReloadData reloadData={reloadData} />

            <FilterByDate onFilter={onFilterByDate} />

            <TableSearch
              paginateParams={paginateParams}
              onSearchChange={onSearchChange}
            />
            <Button variant="outlined" onClick={handleClick}>
              Filter
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  ml: 2,
                }}
              >
                <FormControlLabel
                  label="All"
                  control={
                    <Checkbox
                      checked={selectedFilters.includes("all")}
                      onChange={handleSelectAll}
                    />
                  }
                />
                {filterOptions
                  .filter((f) => f.id !== "all")
                  .map((f) => (
                    <FormControlLabel
                      key={f.id}
                      label={f.label}
                      control={
                        <Checkbox
                          checked={selectedFilters.includes(f.id)}
                          onChange={() => handleToggle(f.id)}
                        />
                      }
                    />
                  ))}
              </Box>
            </Menu>
            {/* <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Name</InputLabel>
              <Select
                sx={{ padding: 0, margin: 0 }}
                multiple
                value={selectedNames}
                onChange={(e) => setSelectedNames(e.target.value)}
                renderValue={(selected) =>
                  selected
                    .map((id) => nameOptions.find((n) => n.id === id)?.name)
                    .join(", ")
                }
              >
                {nameOptions.map((n) => (
                  <MenuItem key={n.id} value={n.id}>
                    <Checkbox checked={selectedNames.includes(n.id)} />
                    <ListItemText primary={n.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
            <div className="w-52">
              <select
                value={selectedNames}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions,
                    (option) => Number(option.value)
                  );
                  setSelectedNames(values);
                }}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option key="placeholder" disabled>
                  Names
                </option>
                {nameOptions.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>

              {/* Display selected values */}
              {/* <div className="mt-2 text-sm text-gray-700">
                {selectedNames
                  .map((id) => nameOptions.find((n) => n.id === id)?.name)
                  .join(", ")}
              </div> */}
            </div>
            <PermissionGate permission="Payment_History_Print">
              <Button
                variant="contained"
                color="primary"
                onClick={printAllData}
              >
                Print All
              </Button>
            </PermissionGate>
            <PermissionGate permission="Payment_History_CSV">
              <Button variant="outlined" color="success" onClick={exportXlsx}>
                Export CSV
              </Button>
            </PermissionGate>
          </div>
          <Box sx={{ mt: 1, pl: 2 }}>
            <strong>Selected Filters:</strong> {selectedFilters.join(", ")}
          </Box>
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
                              case "seat":
                                return (
                                  <p>
                                    {Array.isArray(value)
                                      ? value
                                          .map(
                                            (seat) =>
                                              `${seatMapping(seat.number)}(${
                                                seat.type
                                              })`
                                          )
                                          .join(", ")
                                      : Array.isArray(JSON.parse(value))
                                      ? JSON.parse(value)
                                          .map(
                                            (seat) =>
                                              `${seatMapping(seat.number)}(${
                                                seat.type
                                              })`
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
                              case "screenshot":
                                return <ScreenshotPreview value={value} />;
                              case "created_at":
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

                              case "option":
                                return (
                                  <>
                                    {row.status === "PENDING" && (
                                      <PermissionGate permission="Payment_History_Pending">
                                        <>
                                          <IconButton
                                            sx={{ cursor: "pointer", mr: 1 }}
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
                                      </PermissionGate>
                                    )}

                                    {(row.status === "SUCCESS" ||
                                      row.status === "BLOCKED" ||
                                      row.status === "BOOKED") && (
                                      <PermissionGate permission="Payment_History_Delete">
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
                                          <HighlightOffIcon
                                            style={{ color: "red" }}
                                          />
                                        </IconButton>
                                      </PermissionGate>
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
                    paymentHistorys
                  ) > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              )}
            </Table>
          </TableContainer>
          {total == 0 && <EmptyData />}
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
