import {
  Button,
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
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TablePaginationActions, emptyRows } from "../../../constants/config";
import { alertToggle, setDateFilter } from "../../../shares/shareSlice";
import { Breadcrumb } from "../../../shares/Breadcrumbs";
import AlertDialog from "../../../shares/AlertDialog";
import EmptyData from "../../../shares/EmptyData";
import ReloadData from "../../../shares/ReloadData";
import SkeletonTable from "../../../shares/SkeletonTable";
import { TableSearch } from "../../../shares/TableSearch";
import { TableCustomizeSetting } from "../../../shares/TableCustomizeSetting";
import { FilterByDate } from "../../../shares/FilterByDate";
import { paths } from "../../../constants/paths";
import { setPaginate } from "../couponSlice";
import { couponService } from "../couponService";
import { couponPayload } from "../couponPayload";
import { getData, setData } from "../../../helpers/localstorage";
import { NavigateId } from "../../../shares/NavigateId";

export const CouponList = () => {
  const { coupons, paginateParams } = useSelector((state) => state.coupons);
  const { startFilterDate, selectedId } = useSelector(
    (state) => state.share
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [columnIds, setColumnIds] = useState("");
  const [sort, setSort] = useState(true);

  const [columns, setColumns] = useState(
    getData(couponPayload.columnsName) === null
      ? couponPayload.columns
      : getData(couponPayload.columnsName)
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
    if (startFilterDate === undefined) {
      loadingData();
    }
    dispatch(setDateFilter(""));
    dispatch(setPaginate(couponPayload.paginateParams));
  };

  const deleteData = async () => {
    setIsLoading(true);
    const result = await couponService.destory(dispatch, selectedId);
    dispatch(alertToggle());
    if (result.status === 200) {
      loadingData();
    }
    setIsLoading(false);
  };

  const loadingData = useCallback(async () => {
    const result = await couponService.index(dispatch, paginateParams);
    if (result.status === 200) {
      setTotal(result.data.total ?? 0);
    }
    setIsLoading(false);
    if (getData(couponPayload.columnsName) === null) {
      setData(couponPayload.columnsName, couponPayload.columns);
    }
  }, [dispatch, paginateParams]);

  useEffect(() => {
    setIsLoading(true);
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    setData(couponPayload.columnsName, columns);
  }, [columns]);

  return (
    <>
      <div className="grid">
        <div className="col-12">
          <Breadcrumb />
        </div>

        <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Button
                variant="contained"
                onClick={() => navigate(paths.couponsCreate)}
              >
                New Coupon
              </Button>
            </Grid>
            <Grid item>
              <TableSearch
                paginateParams={paginateParams}
                onSearchChange={onSearchChange}
              />
            </Grid>
            <Grid item>
              <FilterByDate onFilter={onFilterByDate} />
            </Grid>
            <Grid item>
              <ReloadData reloadData={reloadData} />
            </Grid>
            <Grid item>
              <TableCustomizeSetting
                payload={couponPayload.columns}
                columns={columns}
                setColumns={setColumns}
              />
            </Grid>
          </Grid>

          {isLoading ? (
            <SkeletonTable />
          ) : (
            <Paper sx={{ width: "100%", overflow: "hidden", marginTop: "10px" }}>
              <TableContainer sx={{ maxHeight: 540 }}>
                <Table stickyHeader aria-label="sticky table">
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
                      {coupons.map((row) => (
                        <TableRow hover tabIndex={-1} key={row.id}>
                          {columns.map((column) => {
                            const value = row[column.id];
                            const renderValue = () => {
                              switch (column.id) {
                                case "channels":
                                  return Array.isArray(value) ? value.join(", ") : value;
                                case "is_active":
                                  return value ? "YES" : "NO";
                                case "option":
                                  return (
                                    <NavigateId
                                      url={`${paths.coupons}/${row.id}`}
                                      id={row.id}
                                    />
                                  );
                                default:
                                  return value ?? "";
                              }
                            };
                            return (
                              <TableCell key={column.id} sx={{ paddingY: 0 }}>
                                {renderValue()}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}

                      {(() => {
                        const emptyRowsCount = emptyRows(
                          paginateParams.page ?? 1,
                          paginateParams.per_page ?? 20,
                          coupons,
                        );
                        return emptyRowsCount > 0 ? (
                          <TableRow style={{ height: 53 * emptyRowsCount }}>
                            <TableCell colSpan={columns.length} />
                          </TableRow>
                        ) : null;
                      })()}
                    </TableBody>
                  )}
                </Table>
              </TableContainer>

              {total === 0 && <EmptyData />}

              {total !== 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={total}
                  rowsPerPage={paginateParams.per_page}
                  page={paginateParams.page - 1}
                  onPageChange={onPageChange}
                  onRowsPerPageChange={onRowPerPageChange}
                  ActionsComponent={TablePaginationActions}
                />
              )}
            </Paper>
          )}
        </Paper>
      </div>

      <AlertDialog
        title={"Delete Coupon?"}
        body={"Are you sure want to delete this coupon?"}
        onAgree={deleteData}
      />
    </>
  );
};

