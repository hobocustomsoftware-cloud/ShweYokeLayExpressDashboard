import {
  Button,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Breadcrumb } from "../../../shares/Breadcrumbs";
import { FinanceAgentPayload } from "../FinanceAgentPayload";
import { FinanceService } from "../FinanceService";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { endpoints } from "../../../constants/endpoints";
import { formBuilder } from "../../../helpers/formBuilder";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { PermissionGate } from "../../../helpers/PermissionGate";

export const FinanceAgentUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(FinanceAgentPayload.update);
  const financeAgent = useSelector((state) => state.financeAgent.agent);
  const { paginateParams } = useSelector((state) => state.financeAgent);
  const [counterOptions, setCounterOption] = useState([]);
  const userRole = useSelector((state) => state.share.role);

  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (financeAgent) {
      setPayload((prev) => ({
        ...prev,
        agent_id: financeAgent.agent_id ?? null,
        start_date: paginateParams.start_date || "",
        end_date: paginateParams.end_date || "",
        name: financeAgent.name ?? "",
        deposit_amount: financeAgent.deposit_amount ?? 0,
        deposit_balance: financeAgent.deposit_balance ?? 0,
        credit_amount: financeAgent.credit_amount ?? 0,
        credit_balance: financeAgent.credit_balance ?? 0,
        total_seats: financeAgent.total_seats ?? 0,
        sales_amount: financeAgent.total_purchased_amount ?? 0,
      }));
    }
  }, [financeAgent]);

  const submitUser = async () => {
    setLoading(true);
    const formData = formBuilder(payload, FinanceAgentPayload.update);
    const response = await FinanceService.agentUpdate(
      dispatch,
      params.id,
      formData,
    );
    if (response.status === 200) {
      navigate(paths.financeAgentList);
    }
    setLoading(false);
  };

  const handleSettlement = () => {
    setLoading(true);
    const response = FinanceService.agentSettlement(
      dispatch,
      params.id,
      payload,
    );
    if (response.status === 200) {
      navigate(paths.financeAgentList);
    }
    setLoading(false);
  };

  // const loadingData = useCallback(async () => {
  //   setLoading(true);
  //   await FinanceService.agentShow(dispatch, params.id);
  //   const result = await getRequest(`${endpoints.counter}`);
  //   if (result.status === 200) {
  //     setCounterOption(result.data);
  //   }
  //   setLoading(false);
  // }, [dispatch, params.id]);

  // useEffect(() => {
  //   loadingData();
  // }, [loadingData]);

  // useEffect(() => {
  //   if (financeAgent) {
  //     setPayload({ ...financeAgent });
  //   }
  // }, [financeAgent]);

  // const isVip =
  //   payload.is_vip === true || payload.is_vip === 1 || payload.is_vip === "1";

  return (
    <>
      <div className=" grid">
        <Breadcrumb />

        <br />
        <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Name</InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.name || ""}
                  onChange={(e) =>
                    setPayload((prev) => ({ ...prev, name: e.target.value }))
                  }
                  name="name"
                  placeholder="Enter Agent Name"
                />
                <ValidationMessage field={"name"} />
              </Stack>
            </Grid>

            {/* location */}
            {/* <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Location</InputLabel>
                <Select
                  id="counter"
                  value={payload.counter ? payload.counter : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "counter",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="counter"
                >
                  {counterOptions.map((value, index) => {
                    return (
                      <MenuItem key={`counter${index}`} value={value.name}>
                        {" "}
                        {value.name}{" "}
                      </MenuItem>
                    );
                  })}
                </Select>
                <ValidationMessage field={"counter"} />
              </Stack>
            </Grid> */}

            {/* fixed deposit amount */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Fixed Deposit Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 0 }}
                  readOnly={userRole !== "SUPER_ADMIN"}
                  value={payload.fixed_deposit_amount}
                  onChange={(e) =>
                    setPayload((prev) => ({
                      ...prev,
                      fixed_deposit_amount: Number(e.target.value),
                    }))
                  }
                  name="fixed_deposit_amount"
                  placeholder="Enter Deposit Amount"
                />
                <ValidationMessage field={"fixed_deposit_amount"} />
              </Stack>
            </Grid>

            {/* deposit amount */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Deposit Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 0 }}
                  readOnly={userRole !== "SUPER_ADMIN"}
                  value={payload.deposit_amount}
                  onChange={(e) =>
                    setPayload((prev) => ({
                      ...prev,
                      deposit_amount: Number(e.target.value),
                    }))
                  }
                  name="deposit_amount"
                  placeholder="Enter Deposit Amount"
                />
                <ValidationMessage field={"deposit_amount"} />
              </Stack>
            </Grid>

            {/* deposit balance */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Deposit Balance </InputLabel>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 0 }}
                  readOnly={userRole !== "SUPER_ADMIN"}
                  value={payload.deposit_balance}
                  onChange={(e) =>
                    setPayload((prev) => ({
                      ...prev,
                      deposit_balance: Number(e.target.value),
                    }))
                  }
                  name="deposit_balance"
                  placeholder="Enter Deposit Balance"
                />
                <ValidationMessage field={"deposit_balance"} />
              </Stack>
            </Grid>

            {/* Credit Amount */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Credit Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 0 }}
                  readOnly={userRole !== "SUPER_ADMIN"}
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

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Total Seat </InputLabel>
                <OutlinedInput
                  type="number"
                  readOnly={userRole !== "SUPER_ADMIN"}
                  value={payload.total_seats}
                  onChange={(e) =>
                    setPayload((prev) => ({
                      ...prev,
                      total_seats: Number(e.target.value),
                    }))
                  }
                  name="total_seats"
                  placeholder="Enter Credit Amount"
                />
                <ValidationMessage field={"total_seats"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Credit Purchased Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 0 }}
                  readOnly={userRole !== "SUPER_ADMIN"}
                  value={payload.sales_amount}
                  onChange={(e) =>
                    setPayload((prev) => ({
                      ...prev,
                      sales_amount: Number(e.target.value),
                    }))
                  }
                  name="sales_amount"
                  placeholder="Enter Credit Amount"
                />
                <ValidationMessage field={"sales_amount"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Credit Balance </InputLabel>
                <OutlinedInput
                  type="number"
                  inputProps={{ min: 0 }}
                  readOnly={userRole !== "SUPER_ADMIN"}
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
                  onClick={() => navigate(paths.financeAgentList)}
                  size="large"
                  type="submit"
                  variant="outlined"
                >
                  Cancle
                </Button>
                <PermissionGate permission="Finance_Agent_Update">
                  <Button
                    disabled={loading}
                    onClick={submitUser}
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Update
                  </Button>
                </PermissionGate>
                <PermissionGate permission="Finance_Agent_Settlement">
                  <Button
                    disabled={loading}
                    onClick={handleSettlement}
                    size="large"
                    type="submit"
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
    </>
  );
};
