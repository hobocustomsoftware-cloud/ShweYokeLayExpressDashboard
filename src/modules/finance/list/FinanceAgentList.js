import {
  Avatar,
  Box,
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
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AlertDialog from "../../../shares/AlertDialog";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import EmptyData from "../../../shares/EmptyData";
import { FinanceAgentNavigateId } from "../../../shares/FinanceAgentNavigateId";
import { FinanceAgentPayload } from "../FinanceAgentPayload";
import { FinanceService } from "../FinanceService";
import ReloadData from "../../../shares/ReloadData";
import SkeletonTable from "../../../shares/SkeletonTable";
import StatusColor from "../../../shares/StatusColor";
import { TableCustomizeSetting } from "../../../shares/TableCustomizeSetting";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import dayjs from "dayjs";
import { endpoints } from "../../../constants/endpoints";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { setAgentPaginate } from "../FinanceAgentSlice";

export const FinanceAgentList = () => {
  const { agents, paginateParams } = useSelector((state) => state.financeAgent);
  const { selectedId } = useSelector((state) => state.share);
  const dispatch = useDispatch();
  // const [payload, setPayload] = useState(FinanceAgentPayload.search);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [columnIds, setColumnIds] = useState("");
  const [sort, setSort] = useState(true);
  const [agentPersonOptions, setAgentPersonOption] = useState([]);
  const [agentPerson, setAgentPerson] = useState("");

  const [columns, setColumns] = useState(
    getData(FinanceAgentPayload.columnsName) == null
      ? FinanceAgentPayload.columns
      : getData(FinanceAgentPayload.columnsName)
  );

  const onPageChange = (event, newPage) => {
    dispatch(
      setAgentPaginate({
        ...paginateParams,
        page: newPage,
      })
    );
  };

  const onRowPerPageChange = (event) => {
    dispatch(
      setAgentPaginate({
        ...paginateParams,
        page: 1,
        per_page: parseInt(event.target.value, 10),
      })
    );
  };

  const onAgentIdChange = (event) => {
    dispatch(
      setAgentPaginate({
        ...paginateParams,
        page: 1,
        agent_id: parseInt(event.target.value, 10),
      })
    );
  };

  const onHandleSort = (event, label) => {
    setSort(!sort);
    dispatch(
      setAgentPaginate({
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
    setAgentPerson("");
    dispatch(setDateFilter(""));
    dispatch(setAgentPaginate(FinanceAgentPayload.paginateParams));
  };

  const deleteData = async () => {
    setIsLoading(true);
    const result = await FinanceService.destory(dispatch, selectedId);
    if (result.status == 200) {
      dispatch(alertToggle());
      loadingData();
      setIsLoading(false);
    } else {
      setIsLoading(false);
      dispatch(alertToggle());
    }
  };

  const loadingData = useCallback(async () => {
    const result = await FinanceService.agentList(dispatch, paginateParams);
    if (result.status === 200) {
      setTotal(result.data.total);
    }
    setIsLoading(false);
    if (getData(FinanceAgentPayload.columnsName) == null) {
      setData(FinanceAgentPayload.columnsName, FinanceAgentPayload.columns);
    }
    const agentPersons = await getRequest(`${endpoints.member}`);
    if (agentPersons.status === 200) {
      const list = Array.isArray(agentPersons.data) ? agentPersons.data : [];
      setAgentPersonOption(list);
    }
  }, [dispatch, paginateParams]);

  useEffect(() => {
    setIsLoading(true);
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    setData(FinanceAgentPayload.columnsName, columns);
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
              payload={FinanceAgentPayload.columns}
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
                      setAgentPaginate({
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
                      setAgentPaginate({
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
              id="agent_id"
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
              value={agentPerson}
              onChange={(e) => {
                setAgentPerson(e.target.value);
                onAgentIdChange(e);
                // payloadHandler(
                //   payload,
                //   e.target.value,
                //   "salesperson_id",
                //   (updateValue) => {
                //     setPayload(updateValue);
                //   }
                // );
              }}
              name="agent_id"
              displayEmpty
            >
              <MenuItem value="" disabled>
                <em>Select Agent</em>
              </MenuItem>
              {agentPersonOptions.map((value, index) => (
                <MenuItem key={`agent_id${index}`} value={value.id}>
                  {value.name}
                </MenuItem>
              ))}
            </Select>

            <ReloadData reloadData={reloadData} />
          </div>

          <TableContainer sx={{ maxHeight: 540 }}>
            <Table sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={12}>
                    <div className="flex items-center gap-5">
                      <TableCustomizeSetting
                        payload={FinanceAgentPayload.columns}
                        columns={columns}
                        setColumns={(e) => setColumns(e)}
                      />

                      {/* <ReloadData reloadData={reloadData} /> */}
                    </div>
                  </TableCell>
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
                  {agents.map((row) => {
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={row.id}
                      >
                        {columns.map((column) => {
                          const value = row[column.id];

                          const switchCase = ({ column, value }) => {
                            switch (column.id) {
                              case "image":
                                return (
                                  <Avatar
                                    alt="icon"
                                    src={
                                      value
                                        ? `${endpoints.image}${value}`
                                        : null
                                    }
                                  />
                                );
                              case "status":
                                return <StatusColor value={value} />;
                              case "option":
                                return (
                                  <>
                                    <FinanceAgentNavigateId
                                      detailUrl={`${paths.agentHistory}/agent/${row.agent_id}`}
                                      editUrl={`${paths.financeAgentList}/${row.agent_id}`}
                                      id={row.agent_id}
                                      data={row}
                                      // detailUrl={`${paths.agentHistory}/${row.id}/${row.role_names}`}
                                      // editUrl={`${paths.financeAgentList}/${row.id}`}
                                      // id={row.id}
                                      detailPermission="Finance_Agent_Detail"
                                      editPermission="Finance_Agent_Update"
                                      deletePermission="Finance_Agent_Delete"
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
                    agents
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
        title="Are you sure?"
        body="Are You Want to Delete this Data ?"
      />
    </div>
  );
};
