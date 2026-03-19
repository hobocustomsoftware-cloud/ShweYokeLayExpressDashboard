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
import { Profile } from "../../../shares/Profile";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { endpoints } from "../../../constants/endpoints";
import { formBuilder } from "../../../helpers/formBuilder";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { userPayload } from "../userPayload";
import { userService } from "../userService";

export const UserUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(userPayload.update);
  const [roles, setRoles] = useState([]);
  const [newPassword, setNewPassword] = useState([]);
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const [counterOptions, setCounterOption] = useState([]);
  const userRole = useSelector((state) => state.share.role);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitUser = async () => {
    setLoading(true);
    const formData = formBuilder(payload, userPayload.update);
    const response = await userService.update(dispatch, params.id, formData);
    if (response.status === 200) {
      navigate(paths.user);
    }
    setLoading(false);
  };

  const submitChange = async () => {
    setLoading(true);
    const response = await userService.changepassword(dispatch, params.id, {
      password: newPassword,
    });
    if (response.status === 200) {
      navigate(paths.user);
    }
    setLoading(false);
  };

  const loadingData = useCallback(async () => {
    setLoading(true);
    await userService.show(dispatch, params.id);

    const roleResult = await getRequest(`${endpoints.role}`);
    if (roleResult.status === 200) {
      setRoles(roleResult.data);
    }

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
    if (user) {
      const updatePayload = { ...user };
      setPayload(updatePayload);
    }
  }, [user]);

  return (
    <>
      <div className=" grid">
        <Breadcrumb />

        <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
          <Grid container spacing={3}>
            {/* <Grid item xs={12} md={12}>
              <Stack spacing={1} justifyContent="center" alignItems="center">
                <Profile
                  preview={payload.image ? payload.image : ""}
                  onSelect={(e) =>
                    payloadHandler(payload, e, "image", (updateValue) => {
                      setPayload(updateValue);
                    })
                  }
                />
                <ValidationMessage field={"image"} />
              </Stack>
            </Grid> */}

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
                  readOnly={userRole !== "SUPER_ADMIN"}
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
              cancelClick={() => navigate(paths.user)}
              submit="Update"
              submitClick={submitUser}
              loading={loading}
            />
          </Grid>

          <Divider sx={{ mt: 3, mb: 2 }}>Change Password</Divider>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  type="password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  name="password"
                  placeholder="Enter User Password"
                />
                <ValidationMessage field={"password"} />
              </Stack>
            </Grid>

            <FormMainAction
              cancel="Cancle"
              cancelClick={() => navigate(paths.user)}
              submit="Update"
              submitClick={submitChange}
              loading={loading}
            />
          </Grid>
        </Paper>

        {/* <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Password (required)</InputLabel>
                <OutlinedInput
                  type="password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  name="password"
                  placeholder="Enter User Password"
                />
                <ValidationMessage field={"password"} />
              </Stack>
            </Grid>

            <FormMainAction
              cancel="Cancle"
              cancelClick={() => navigate(paths.user)}
              submit="Submit"
              submitClick={submitChange}
              loading={loading}
            />
          </Grid>
        </Paper> */}
      </div>
    </>
  );
};
