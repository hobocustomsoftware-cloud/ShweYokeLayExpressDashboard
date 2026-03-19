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

import { Breadcrumb } from "../../../shares/Breadcrumbs";
import FormMainAction from "../../../shares/FormMainAction";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { agentPayload } from "../agentPayload";
import { agentService } from "../agentService";
import { endpoints } from "../../../constants/endpoints";
import { formBuilder } from "../../../helpers/formBuilder";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const AgentCreate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(agentPayload.store);
  const [roles, setRoles] = useState([]);
  const [counterOptions, setCounterOption] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitAgent = async () => {
    setLoading(true);
    const formData = formBuilder(payload, agentPayload.store);
    const create = await agentService.store(formData, dispatch);
    if (create.status == 200) {
      navigate(paths.agent);
    }
    setLoading(false);
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    const roleResult = await getRequest(`${endpoints.role}`);
    if (roleResult.status === 200) {
      setRoles(roleResult.data);
    }
    const result = await getRequest(`${endpoints.counter}`);
    if (result.status === 200) {
      setCounterOption(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadingData();
  }, [loadingData]);

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
                  type="text"
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
                  type="text"
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

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Choose Role </InputLabel>
                <Select
                  id="role_names"
                  value={payload.role_names ? payload.role_names : ""}
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "role_names",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="role_names"
                >
                  {roles.map((value, index) => {
                    return (
                      <MenuItem key={`role_names${index}`} value={value.name}>
                        {" "}
                        {value.name}{" "}
                      </MenuItem>
                    );
                  })}
                </Select>
                <ValidationMessage field={"role_names"} />
              </Stack>
            </Grid>
          </Grid>

          <Divider style={{ marginTop: 40, marginBottom: 20 }}>
            Balance Information
          </Divider>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Fixed Deposit Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
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
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "deposit_amount",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="deposit_amount"
                  placeholder="Enter Max Deposit Amount"
                />
                <ValidationMessage field={"deposit_amount"} />
              </Stack>
            </Grid>

            {/* <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Deposit Balance </InputLabel>
                <OutlinedInput
                  type="number"
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "deposit_balance",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="deposit_balance"
                  placeholder="Enter Max Deposit Balance"
                />
                <ValidationMessage field={"deposit_balance"} />
              </Stack>
            </Grid> */}

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Credit Amount </InputLabel>
                <OutlinedInput
                  type="number"
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "credit_amount",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="credit_amount"
                  placeholder="Enter Max Credit Amount"
                />
                <ValidationMessage field={"credit_amount"} />
              </Stack>
            </Grid>

            {/* <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Credit Balance </InputLabel>
                <OutlinedInput
                  type="number"
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "credit_balance",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="credit_balance"
                  placeholder="Enter Max Credit Balance"
                />
                <ValidationMessage field={"credit_balance"} />
              </Stack>
            </Grid> */}

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Commission (required)</InputLabel>
                <OutlinedInput
                  type="number"
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
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
                <InputLabel> VIP Status </InputLabel>
                <Select
                  id="is_vip"
                  onChange={(e) =>
                    payloadHandler(
                      payload,
                      e.target.value,
                      "is_vip",
                      (updateValue) => {
                        setPayload(updateValue);
                      }
                    )
                  }
                  name="is_vip"
                  value={payload.is_vip}
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Yes</MenuItem>
                </Select>
                <ValidationMessage field={"is_vip"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Status (required)</InputLabel>
                <Select
                  id="status"
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
              submit="Create"
              submitClick={submitAgent}
              loading={loading}
            />
          </Grid>
        </Paper>
      </div>
    </>
  );
};
