import {
  Avatar,
  Box,
  Button,
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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { TablePaginationActions, emptyRows } from "../../../constants/config";
import { alertToggle, setDateFilter } from "../../../shares/shareSlice";
import { getData, setData } from "../../../helpers/localstorage";
import { resetUser, setPaginate, update } from "../FinanceUserSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AlertDialog from "../../../shares/AlertDialog";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import EmptyData from "../../../shares/EmptyData";
import { FinanceNavigateId } from "../../../shares/FinanceNavigateId";
import { FinanceService } from "../FinanceService";
import { FinanceUserPayload } from "../FinanceUserPayload";
import ReloadData from "../../../shares/ReloadData";
import SkeletonTable from "../../../shares/SkeletonTable";
import { TableCustomizeSetting } from "../../../shares/TableCustomizeSetting";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import dayjs from "dayjs";
import { endpoints } from "../../../constants/endpoints";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";

export const FinanceUserList = () => {
  const [loading, setLoading] = useState(false);
  const { users, paginateParams } = useSelector((state) => state.financeUser);
  const { startFilterDate, endFilterDate, selectedId } = useSelector(
    (state) => state.share
  );
  const dispatch = useDispatch();
  const [payload, setPayload] = useState(FinanceUserPayload.search);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [columnIds, setColumnIds] = useState("");
  const [sort, setSort] = useState(true);
  const [salesPersonOptions, setSalesPersonOption] = useState([]);
  const [salesPerson, setSalesPerson] = useState("");

  const [columns, setColumns] = useState(
    getData(FinanceUserPayload.columnsName) == null
      ? FinanceUserPayload.columns
      : getData(FinanceUserPayload.columnsName)
  );

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

  const onUserIdChange = (event) => {
    dispatch(
      setPaginate({
        ...paginateParams,
        page: 1,
        user_id: parseInt(event.target.value, 10),
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

  const reloadData = () => {
    // if (startFilterDate === undefined) {
    //   // loadingData();
    // }
    setSalesPerson("");
    dispatch(setDateFilter(""));
    dispatch(setPaginate(FinanceUserPayload.paginateParams));
  };

  const deleteData = async () => {
    setIsLoading(true);
    const result = await FinanceService.destory(dispatch, selectedId);
    if (result.status === 200) {
      dispatch(alertToggle());
      // loadingData();
      setIsLoading(false);
    } else {
      setIsLoading(false);
      dispatch(alertToggle());
    }
  };

  const loadingData = useCallback(async () => {
    setIsLoading(true);
    const result = await FinanceService.index(dispatch, paginateParams);
    if (result.status === 200) {
      setTotal(result.data.total);
    }
    setIsLoading(false);
    if (getData(FinanceUserPayload.columnsName) == null) {
      setData(FinanceUserPayload.columnsName, FinanceUserPayload.columns);
    }
    const salesPersons = await getRequest(`${endpoints.user}`);
    if (salesPersons.status === 200) {
      const list = Array.isArray(salesPersons.data) ? salesPersons.data : [];
      setSalesPersonOption(list);
    }
  }, [dispatch, paginateParams]);

  // const handleSearch = async (e) => {
  //   setLoading(true);
  //   const result = await FinanceService.index(dispatch, paginateParams);
  //   if (result.status === 200) {
  //     setData(result?.data);
  //   }
  //   setLoading(false);
  // };

  useEffect(() => {
    setIsLoading(true);
    dispatch(resetUser());
    loadingData();
  }, [loadingData, dispatch]);

  useEffect(() => {
    setData(FinanceUserPayload.columnsName, columns);
  }, [columns]);

  return (
    <div>
      <Breadcrumb />
      {isLoading ? (
        <SkeletonTable />
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden", marginTop: "10px" }}>
          <div className="flex items-center gap-5">
            <TableCustomizeSetting
              payload={FinanceUserPayload.columns}
              columns={columns}
              setColumns={(e) => setColumns(e)}
            />

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

            <Select
              id="user_id"
              size="small"
              sx={{ minWidth: 200 }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200, // sets max height
                    overflowY: "auto", // enables vertical scroll
                  },
                },
              }}
              value={salesPerson}
              onChange={(e) => {
                setSalesPerson(e.target.value);
                onUserIdChange(e);
                payloadHandler(
                  payload,
                  e.target.value,
                  "salesperson_id",
                  (updateValue) => {
                    setPayload(updateValue);
                  }
                );
              }}
              name="user_id"
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>Select Sales Person</em>
              </MenuItem>
              {salesPersonOptions.map((value, index) => (
                <MenuItem key={`user_id${index}`} value={value.id}>
                  {value.name}
                </MenuItem>
              ))}
            </Select>

            <ReloadData reloadData={reloadData} />

            {/* <Button
              disabled={loading}
              onClick={handleSearch}
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              Search
            </Button> */}
          </div>
          <TableContainer sx={{ maxHeight: 540 }}>
            <Table sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={12}></TableCell>
                </TableRow>
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
                  {users.map((row) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.user_id}
                      >
                        {columns.map((column) => {
                          const value = row[column.id];

                          const switchCase = ({ column, value }) => {
                            switch (column.id) {
                              case "option":
                                return (
                                  <>
                                    <FinanceNavigateId
                                      detailUrl={`${paths.salesHistory}/user/${row.user_id}`}
                                      editUrl={`${paths.financeSalesList}/${row.user_id}`}
                                      id={row.user_id}
                                      data={row}
                                      detailPermission="Finance_Counter_Detail"
                                      editPermission="Finance_Counter_Update"
                                      deletePermission="Finance_Counter_Delete"
                                    />
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
                    users
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
        title="Are you sure?"
        body="Are You Want to Delete this Data ?"
      />
    </div>
  );
};
