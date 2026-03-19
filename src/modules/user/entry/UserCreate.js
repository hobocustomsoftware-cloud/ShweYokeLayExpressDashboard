import {
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
import { endpoints } from "../../../constants/endpoints";
import { formBuilder } from "../../../helpers/formBuilder";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userPayload } from "../userPayload";
import { userService } from "../userService";

export const UserCreate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(userPayload.store);
  const [roles, setRoles] = useState([]);
  const [counterOptions, setCounterOption] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitUser = async () => {
    setLoading(true);
    const formData = formBuilder(payload, userPayload.store);
    const create = await userService.store(formData, dispatch);
    if (create.status == 200) {
      navigate(paths.user);
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
                  placeholder="Enter User Name"
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
                  placeholder="Enter User Phone"
                />
                <ValidationMessage field={"phone"} />
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
                  placeholder="Enter User Email"
                />
                <ValidationMessage field={"email"} />
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
                  placeholder="Enter User Password"
                />
                <ValidationMessage field={"password"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel> Credit Amount (required)</InputLabel>
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

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Status (required)</InputLabel>
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
              cancelClick={() => navigate(paths.user)}
              submit="Create"
              submitClick={submitUser}
              loading={loading}
            />
          </Grid>
        </Paper>
      </div>
    </>
  );
};
