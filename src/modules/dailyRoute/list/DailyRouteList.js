import {
  Avatar,
  Box,
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { TablePaginationActions, emptyRows } from "../../../constants/config";
import { alertToggle, setDateFilter } from "../../../shares/shareSlice";
import { getData, setData } from "../../../helpers/localstorage";
import { useDispatch, useSelector } from "react-redux";

import AlertDialog from "../../../shares/AlertDialog";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import EmptyData from "../../../shares/EmptyData";
import { FilterByDate } from "../../../shares/FilterByDate";
import { FilterByStatus } from "../../../shares/FilterByStatus";
import { NavigateId } from "../../../shares/NavigateId";
import ReloadData from "../../../shares/ReloadData";
import SkeletonTable from "../../../shares/SkeletonTable";
import StatusColor from "../../../shares/StatusColor";
import { TableCustomizeSetting } from "../../../shares/TableCustomizeSetting";
import { TableSearch } from "../../../shares/TableSearch";
import { dailyRoutePayload } from "../dailyRoutePayload";
import { dailyRouteService } from "../dailyRouteService";
import { endpoints } from "../../../constants/endpoints";
import { paths } from "../../../constants/paths";
import { setPaginate } from "../dailyRouteSlice";

export const DailyRouteList = () => {
  const { dailyRoutes, paginateParams } = useSelector(
    (state) => state.dailyRoute
  );
  const { startFilterDate, endFilterDate, selectedId } = useSelector(
    (state) => state.share
  );
  const dispatch = useDispatch();

  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [columnIds, setColumnIds] = useState("");
  const [sort, setSort] = useState(true);

  const [columns, setColumns] = useState(
    getData(dailyRoutePayload.columnsName) == null
      ? dailyRoutePayload.columns
      : getData(dailyRoutePayload.columnsName)
  );

  const dailyRouteStatus = useRef(["ALL", "ACTIVE", "INACTIVE"]);

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
    console.log(e);
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
    dispatch(setPaginate(dailyRoutePayload.paginateParams));
  };

  const deleteData = async () => {
    setIsLoading(true);
    const result = await dailyRouteService.destory(dispatch, selectedId);
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
    const result = await dailyRouteService.index(dispatch, paginateParams);
    if (result.status === 200) {
      setTotal(result.data.total);
    }
    setIsLoading(false);
    if (getData(dailyRoutePayload.columnsName) == null) {
      setData(dailyRoutePayload.columnsName, dailyRoutePayload.columns);
    }
  }, [dispatch, paginateParams]);

  useEffect(() => {
    setIsLoading(true);
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    setData(dailyRoutePayload.columnsName, columns);
  }, [columns]);

  return (
    <div>
      <Breadcrumb />

      {isLoading ? (
        <SkeletonTable />
      ) : (
        <div className="flex w-full">
          <Paper sx={{ width: "100%", overflow: "scroll", marginTop: "10px" }}>
            <TableContainer sx={{ maxHeight: 540, overflow: "scroll" }}>
              <Table sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={12}>
                      <div className="flex flex-col justify-start items-start md:flex-row md:items-center gap-5 flex-wrap max-w-[1000px]">
                        <TableCustomizeSetting
                          payload={dailyRoutePayload.columns}
                          columns={columns}
                          setColumns={(e) => setColumns(e)}
                        />
                        <FilterByDate onFilter={onFilterByDate} />
                        <TableSearch
                          paginateParams={paginateParams}
                          onSearchChange={onSearchChange}
                        />
                        <FilterByStatus
                          paginateParams={paginateParams}
                          status={dailyRouteStatus}
                          onFilter={onFilter}
                        />
                        <ReloadData reloadData={reloadData} />
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
                    {dailyRoutes.map((row) => {
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
                                case "start_date":
                                  return `${value}
                                (${
                                  row["route"]?.departure
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
                                    : "No time available"
                                })`;
                                case "route":
                                  return value?.name;
                                case "status":
                                  return <StatusColor value={value} />;
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
                                case "option":
                                  return (
                                    <NavigateId
                                      url={`${paths.dailyRoute}/${row.id}`}
                                      id={row.id}
                                      editPermission="Daily_Route_Update"
                                      deletePermission="Daily_Route_Delete"
                                    />
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
                      dailyRoutes
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
        </div>
      )}
      <AlertDialog
        onAgree={() => deleteData()}
        title="Are you sure?"
        body="Are You Want to Delete this Data ?"
      />
    </div>
  );
};
