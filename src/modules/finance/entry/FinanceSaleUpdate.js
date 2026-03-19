import {
  Button,
  Grid,
  InputLabel,
  OutlinedInput,
  Paper,
  Stack,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Breadcrumb } from "../../../shares/Breadcrumbs";
import { FinanceService } from "../FinanceService";
import { FinanceUserPayload } from "../FinanceUserPayload";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { formBuilder } from "../../../helpers/formBuilder";
import { paths } from "../../../constants/paths";
import { PermissionGate } from "../../../helpers/PermissionGate";

export const FinanceSaleUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(FinanceUserPayload.update);
  const financeUser = useSelector((state) => state.financeUser.user);
  const { paginateParams } = useSelector((state) => state.financeUser);
  const userRole = useSelector((state) => state.share.role);

  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (financeUser) {
      setPayload((prev) => ({
        ...prev,
        user_id: financeUser.user_id ?? null,
        start_date: paginateParams.start_date || "",
        end_date: paginateParams.end_date || "",
        name: financeUser.name ?? "",
        credit_amount: financeUser.credit_amount ?? 0,
        credit_balance: financeUser.credit_balance ?? 0,
        total_seats: financeUser.total_seats ?? 0,
        sales_amount: financeUser.total_purchased_amount ?? 0,
      }));
    }
  }, [financeUser]);

  const submitUser = async () => {
    setLoading(true);
    const formData = formBuilder(payload, FinanceUserPayload.update);
    const response = await FinanceService.update(dispatch, params.id, formData);
    if (response.status === 200) navigate(paths.financeSalesList);
    setLoading(false);
  };

  const handleSettlement = async () => {
    setLoading(true);
    const response = await FinanceService.settlement(
      dispatch,
      params.id,
      payload
    );
    if (response.status === 200) navigate(paths.financeSalesList);
    setLoading(false);
  };

  console.log("paginateParams >>", paginateParams);

  return (
    <div className="grid">
      <Breadcrumb />
      <br />
      <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
        <Grid container spacing={3}>
          {/* Counter Name */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Counter Name</InputLabel>
              <OutlinedInput
                type="text"
                value={payload.name || ""}
                onChange={(e) =>
                  setPayload((prev) => ({ ...prev, name: e.target.value }))
                }
                name="name"
                placeholder="Enter Counter Name"
              />
              <ValidationMessage field={"name"} />
            </Stack>
          </Grid>

          {/* Credit Amount */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Credit Amount</InputLabel>
              <OutlinedInput
                type="number"
                inputProps={{ min: 0 }}
                value={payload.credit_amount}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    credit_amount: Number(e.target.value),
                  }))
                }
                name="credit_amount"
                placeholder="Enter Credit Amount"
              />
              <ValidationMessage field={"credit_amount"} />
            </Stack>
          </Grid>

          {/* Credit Total Seats */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Credit Total Seats</InputLabel>
              <OutlinedInput
                type="number"
                inputProps={{ min: 0 }}
                value={payload.total_seats}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    total_seats: Number(e.target.value),
                  }))
                }
                name="total_seats"
                placeholder="Enter Total Seats"
              />
              <ValidationMessage field={"total_seats"} />
            </Stack>
          </Grid>

          {/* Credit Sales Amount */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Credit Sales Amount</InputLabel>
              <OutlinedInput
                type="number"
                inputProps={{ min: 0 }}
                value={payload.sales_amount}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    sales_amount: Number(e.target.value),
                  }))
                }
                name="sales_amount"
                placeholder="Enter Credit Sales Amount"
              />
              <ValidationMessage field={"sales_amount"} />
            </Stack>
          </Grid>

          {/* Credit Balance */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <InputLabel>Credit Balance</InputLabel>
              <OutlinedInput
                type="number"
                inputProps={{ min: 0 }}
                value={payload.credit_balance}
                onChange={(e) =>
                  setPayload((prev) => ({
                    ...prev,
                    credit_balance: Number(e.target.value),
                  }))
                }
                name="credit_balance"
                placeholder="Enter Credit Balance"
              />
              <ValidationMessage field={"credit_balance"} />
            </Stack>
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} md={12}>
            <Stack
              justifyContent="flex-end"
              alignItems="center"
              spacing={1}
              direction="row"
              useFlexGap
              flexWrap="wrap"
            >
              <Button
                disabled={loading}
                onClick={() => navigate(paths.financeSalesList)}
                size="large"
                variant="outlined"
              >
                Cancel
              </Button>
              <PermissionGate permission="Finance_Sale_Update">
                <Button
                  disabled={loading}
                  onClick={submitUser}
                  size="large"
                  variant="contained"
                  color="primary"
                >
                  Update
                </Button>
              </PermissionGate>
              <PermissionGate permission="Finance_Sale_Settlement">
                <Button
                  disabled={loading}
                  onClick={handleSettlement}
                  size="large"
                  variant="contained"
                  color="success"
                >
                  Settlement
                </Button>
              </PermissionGate>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};
