import {
  Divider,
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
import FormMainAction from "../../../shares/FormMainAction";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { agentPayload } from "../agentPayload";
import { agentService } from "../agentService";
import { endpoints } from "../../../constants/endpoints";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";

export const AgentUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(agentPayload.update);
  const { agent } = useSelector((state) => state.agent);
  const userRole = useSelector((state) => state.share.role);
  const [isVip, setIsVip] = useState(false);
  const [counterOptions, setCounterOption] = useState([]);

  // console.log("userRole >> >", userRole);
  const params = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitAgent = async () => {
    setLoading(true);
    const formData = {
      ...payload,
      is_agent: Boolean(Number(payload.is_agent)), // normalize
      is_vip: Boolean(Number(payload.is_vip)),
    };
    // const formData = formBuilder(payload, agentPayload.update);
    const response = await agentService.update(dispatch, params.id, formData);
    if (response.status === 200) {
      navigate(paths.agent);
    }
    setLoading(false);
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    await agentService.show(dispatch, params.id);
    const result = await getRequest(`${endpoints.counter}`);
    if (result.status === 200) {
      setCounterOption(result.data);
    }
    setLoading(false);
  }, [dispatch, params.id]);

  useEffect(() => {
    loadingData();
  }, [loadingData]);

  useEffect(() => {
    if (agent) {
      const updatePayload = { ...agent };
      updatePayload.file_path = null;
      setPayload(updatePayload);
    }
  }, [agent]);
  console.log("payload.is_vip", payload.is_vip);
  useEffect(() => {
    setIsVip(payload.is_vip);
  }, [payload.is_vip]);

  return (
    <>
      <div className=" grid">
        <Breadcrumb />

        <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Business Name </InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.business_name ? payload.business_name : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "business_name",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="business_name"
                  placeholder="Enter Business Name"
                />
                <ValidationMessage field={"business_name"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Name (required)</InputLabel>
                <OutlinedInput
                  type="text"
                  value={payload.name ? payload.name : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "name",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="name"
                  placeholder="Enter Agent Name"
                />
                <ValidationMessage field={"name"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Choose Counter </InputLabel>
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
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Phone</InputLabel>
                <OutlinedInput
                  type="number"
                  value={payload.phone ? payload.phone : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "phone",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="phone"
                  placeholder="Enter Agent Phone"
                />
                <ValidationMessage field={"phone"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Business Phone </InputLabel>
                <OutlinedInput
                  type="number"
                  value={payload.business_phone ? payload.business_phone : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "business_phone",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="business_phone"
                  placeholder="Enter Business Phone"
                />
                <ValidationMessage field={"business_phone"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Email (required)</InputLabel>
                <OutlinedInput
                  type="email"
                  value={payload.email ? payload.email : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "email",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="email"
                  placeholder="Enter Agent Email"
                />
                <ValidationMessage field={"email"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Password (required)</InputLabel>
                <OutlinedInput
                  type="password"
                  value={payload.password ? payload.password : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "password",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="password"
                  placeholder="Enter Agent Password"
                />
                <ValidationMessage field={"password"} />
              </Stack>
            </Grid>
          </Grid>

          <Divider style={{ marginTop: 40, marginBottom: 20 }}>
            Balance Information
          </Divider>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Commission (required)</InputLabel>
                <OutlinedInput
                  type="number"
                  value={payload.commission ? payload.commission : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value === "" ? "" : Number(e.target.value),
                      "commission",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="commission"
                  placeholder="Enter Agent Commission"
                />
                <ValidationMessage field={"commission"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Fixed Deposit Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  readOnly={userRole !== "SUPER_ADMIN"}
                  value={
                    payload.fixed_deposit_amount
                      ? payload.fixed_deposit_amount
                      : ""
                  }
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value === "" ? "" : Number(e.target.value),
                      "fixed_deposit_amount",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="fixed_deposit_amount"
                  placeholder="Enter Fixed Deposit Amount"
                />
                <ValidationMessage field={"fixed_deposit_amount"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Deposit Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  readOnly={userRole !== "SUPER_ADMIN"}
                  value={payload.deposit_amount ? payload.deposit_amount : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value === "" ? "" : Number(e.target.value),
                      "deposit_amount",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="deposit_amount"
                  placeholder="Enter Deposit Amount"
                />
                <ValidationMessage field={"deposit_amount"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Deposit Balance </InputLabel>
                <OutlinedInput
                  type="number"
                  readOnly
                  value={payload.deposit_balance ? payload.deposit_balance : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value === "" ? "" : Number(e.target.value),
                      "deposit_balance",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="deposit_balance"
                  placeholder="Enter Deposit Balance"
                />
                <ValidationMessage field={"deposit_balance"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Credit Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  readOnly={userRole !== "SUPER_ADMIN"}
                  value={payload.credit_amount ? payload.credit_amount : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value === "" ? "" : Number(e.target.value),
                      "credit_amount",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="credit_amount"
                  placeholder="Enter Credit Amount"
                />
                <ValidationMessage field={"credit_amount"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Credit Balance </InputLabel>
                <OutlinedInput
                  type="number"
                  readOnly
                  value={payload.credit_balance ? payload.credit_balance : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value === "" ? "" : Number(e.target.value),
                      "credit_balance",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="credit_balance"
                  placeholder="Enter Credit Balance"
                />
                <ValidationMessage field={"credit_balance"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Top Up Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  value={payload.top_up_amount ?? ""} // cleaner null check
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value === "" ? "" : Number(e.target.value), // force number
                      "top_up_amount",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="top_up_amount"
                  placeholder="Enter Top Up Amount"
                />
                <ValidationMessage field={"top_up_amount"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> VIP Status </InputLabel>
                <Select
                  id="is_vip"
                  value={isVip}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value === "true", // 👈 force boolean
                      "is_vip",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="is_vip"
                >
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </Select>
                <ValidationMessage field={"is_vip"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Status (required)</InputLabel>
                <Select
                  id="status"
                  value={payload.status ? payload.status : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "status",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
                <ValidationMessage field={"status"} />
              </Stack>
            </Grid>

            <FormMainAction
              cancel="Cancle"
              cancelClick={() => navigate(paths.agent)}
              submit="Update"
              submitClick={submitAgent}
              loading={loading}
            />
          </Grid>
        </Paper>
      </div>
    </>
  );
};
