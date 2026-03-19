import {
  Button,
  Divider,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
} from "@mui/material";
import { getData, removeAllData } from "../../../helpers/localstorage";
import { keys, laravelDecrypt } from "../../../constants/config";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Breadcrumb } from "../../../shares/Breadcrumbs";
import FormMainAction from "../../../shares/FormMainAction";
import StackBars from "../../../shares/StackBars";
import { ValidationMessage } from "../../../shares/ValidationMessage";
import { endpoints } from "../../../constants/endpoints";
import { formBuilder } from "../../../helpers/formBuilder";
import { getRequest } from "../../../helpers/api";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { userPayload } from "../userPayload";
import { userService } from "../../user/userService";

export const AdminUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(userPayload.update);
  const [roles, setRoles] = useState([]);
  const [storeData, setStoreData] = useState({});
  const { user } = useSelector((state) => state.user);
  const userRole = useSelector((state) => state.share.role);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const submitUser = async () => {
    setLoading(true);
    const response = await userService.update(
      dispatch,
      storeData?.user?.id,
      payload
    );
    if (response.status === 200) {
      removeAllData();
      navigate(paths.adminLogout);
    }
    setLoading(false);
  };

  const loadingData = useCallback(
    async (e, agent) => {
      setLoading(true);
      const result = await userService.profile(dispatch, e, agent);
      if (result?.status === 200) {
        setPayload(result?.data);
      }
      // if (!agent) {
      //   const roleResult = await getRequest(`${endpoints.role}`);
      //   if (roleResult.status === 200) {
      //     setRoles(roleResult.data);
      //   }
      // }

      setLoading(false);
    },
    [dispatch, storeData]
  );

  useEffect(() => {
    if (user) {
      const updatePayload = { ...user };
      setPayload(updatePayload);
    }
  }, [user]);

  useEffect(() => {
    const storedd = laravelDecrypt(getData(keys.CODE));
    if (storedd == null) {
      removeAllData();
      navigate(paths.adminLogout);
    }
    setStoreData(storedd);
    if (storedd?.role == "AGENT") {
      loadingData(storedd?.user?.id, true);
    } else {
      loadingData(storedd?.user?.id, false);
    }
    console.log("storedd", storedd);
  }, []);
  console.log("payload", payload.role_names);
  return (
    <>
      <div className=" grid">
        <Breadcrumb />
        <div className="col-12"></div>

        {/* {userRole === "SUPER_ADMIN" && ( */}
        <Paper elevation={3} style={{ padding: 20, margin: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Name</InputLabel>
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
                  readOnly={storeData?.role !== "SUPER_ADMIN"}
                />
                <ValidationMessage field={"name"} />
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
                  readOnly={storeData?.role !== "SUPER_ADMIN"}
                />
                <ValidationMessage field={"phone"} />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Email</InputLabel>
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
                  readOnly={storeData?.role !== "SUPER_ADMIN"}
                />
                <ValidationMessage field={"email"} />
              </Stack>
            </Grid>

            {storeData?.role !== "SUPER_ADMIN" ? (
              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <InputLabel> Role </InputLabel>
                  <Select
                    id="role_names"
                    value={payload.role_names}
                    readOnly={storeData?.role !== "SUPER_ADMIN"}
                    // onChange={(e) =>
                    //     payloadHandler(
                    //     payload,
                    //     e.target.value,
                    //     "role_names",
                    //     (updateValue) => {
                    //         setPayload(updateValue);
                    //     }
                    //     )}
                    // name="role_names"
                  >
                    <MenuItem value={payload.role_names}>
                      {" "}
                      {payload.role_names}{" "}
                    </MenuItem>
                  </Select>
                  {/* <ValidationMessage field={"role_names"} /> */}
                </Stack>
              </Grid>
            ) : (
              ""
              // <Grid item xs={12} md={4}>
              //   <Stack spacing={1}>
              //     <InputLabel> Choose Role </InputLabel>
              //     <Select
              //       id="role_names"
              //       value={payload.role_names ? payload.role_names : ""}
              //       onChange={(e) =>
              //         payloadHandler(
              //           payload,
              //           e.target.value,
              //           "role_names",
              //           (updateValue) => {
              //             setPayload(updateValue);
              //           }
              //         )
              //       }
              //       name="role_names"
              //       readOnly
              //     >
              //       {roles.map((value, index) => {
              //         return (
              //           <MenuItem key={`role_names${index}`} value={value.name}>
              //             {" "}
              //             {value.name}{" "}
              //           </MenuItem>
              //         );
              //       })}
              //     </Select>
              //     <ValidationMessage field={"role_names"} />
              //   </Stack>
              // </Grid>
            )}

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Status</InputLabel>
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
                  readOnly={storeData?.role !== "SUPER_ADMIN"}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
                <ValidationMessage field={"status"} />
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ mt: 3, mb: 2 }}>Change Password</Divider>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <InputLabel>Password</InputLabel>
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
                  placeholder="Enter New Password"
                />
                <ValidationMessage field={"password"} />
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
                {/* <Button
                  disabled={loading}
                  onClick={() => navigate(paths.admin)}
                  size="large"
                  type="submit"
                  variant="outlined"
                >
                  Cancle
                </Button> */}
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
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        {/* )} */}
      </div>
    </>
  );
};
