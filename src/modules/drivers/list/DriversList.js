import {
  Grid,
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
import React, { useCallback, useEffect, useState } from "react";
import { TablePaginationActions, emptyRows } from "../../../constants/config";
import { alertToggle, setDateFilter } from "../../../shares/shareSlice";
import { getData, setData } from "../../../helpers/localstorage";
import { useDispatch, useSelector } from "react-redux";

import AlertDialog from "../../../shares/AlertDialog";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import EmptyData from "../../../shares/EmptyData";
import { FilterByDate } from "../../../shares/FilterByDate";
import { NavigateId } from "../../../shares/NavigateId";
import ReloadData from "../../../shares/ReloadData";
import SkeletonTable from "../../../shares/SkeletonTable";
import StatusColor from "../../../shares/StatusColor";
import { TableCustomizeSetting } from "../../../shares/TableCustomizeSetting";
import { TableSearch } from "../../../shares/TableSearch";
import TimetoAmPm from "../../../shares/TimetoAmPm";
import { paths } from "../../../constants/paths";
import { driverPayload } from "../driversPayload";
import { driverService } from "../driversService";
import { setPaginate } from "../driversSlice";

export const DriverList = () => {
  const { drivers, paginateParams } = useSelector((state) => state.drivers);
  const { startFilterDate, selectedId } = useSelector(
    (state) => state.share
  );
  const dispatch = useDispatch();

  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [columnIds, setColumnIds] = useState("");
  const [sort, setSort] = useState(true);

  const [columns, setColumns] = useState(
    getData(driverPayload.columnsName) == null
      ? driverPayload.columns
      : getData(driverPayload.columnsName)
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
    dispatch(setPaginate(driverPayload.paginateParams));
  };

  const deleteData = async () => {
    setIsLoading(true);
    const result = await driverService.destory(dispatch, selectedId);
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
    const result = await driverService.index(dispatch, paginateParams);
    if (result.status === 200) {
      console.log(result);
      setData(result.data.data)
      setTotal(result.data.total);
    }
    setIsLoading(false);
    if (getData(driverPayload.columnsName) == null) {
      setData(driverPayload.columnsName, driverPayload.columns);
    }
  }, [dispatch, paginateParams]);

  useEffect(() => {
    setIsLoading(true);
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    setData(driverPayload.columnsName, columns);
  }, [columns]);

  return (
    <div>
      <Breadcrumb />

      {isLoading ? (
        <SkeletonTable />
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden", marginTop: "10px" }}>
          <TableContainer sx={{ maxHeight: 540 }}>
            <Table sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={12}>
                    <Grid
                      container
                      spacing={2}
                      direction="row"
                      sx={{ paddingTop: 1 }}
                    >
                      <Grid
                        container
                        spacing={0.5}
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={7}
                        xl={7}
                        direction="row"
                      >
                        <Grid item xs={1}>
                          <TableCustomizeSetting
                            payload={driverPayload.columns}
                            columns={columns}
                            setColumns={(e) => setColumns(e)}
                          />
                        </Grid>
                        <Grid item xs={8}>
                          <FilterByDate onFilter={onFilterByDate} />
                        </Grid>

                        <Grid item xs={1}>
                          <ReloadData reloadData={reloadData} />
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        spacing={0.5}
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={5}
                        xl={5}
                        direction="row"
                      >
                        <Grid>
                          <TableSearch
                            paginateParams={paginateParams}
                            onSearchChange={onSearchChange}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
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
                  {drivers.map((row) => {
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
                              case "open_time":
                                return TimetoAmPm(value);
                              case "close_time":
                                return TimetoAmPm(value);
                              case "status":
                                return <StatusColor value={value} />;
                                case "option":
                                return (
                                  <NavigateId
                                    url={`${paths.drivers}/${row.id}`}
                                    id={row.id}
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
                    drivers
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

          <TablePagination
            component="div"
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
