import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FilledInput,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { updateNotification, updateRole, updateUser } from "../../../shares/shareSlice";

import { ValidationMessage } from "../../../shares/ValidationMessage";
import { authService } from "../authService";
import { keys, laravelDecrypt } from "../../../constants/config";
import { paths } from "../../../constants/paths";
import { payloadHandler } from "../../../helpers/handler";
import { setData } from "../../../helpers/localstorage";
import { updateAgent } from "../../agent/agentSlice";
import { updateBookingInformation } from "../../saleCounter/bookingInformationSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /**
   * Admin Login
   * Payload - [username, password]
   * @returns
   */
  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    const result = await authService.login(payload, dispatch);
    setLoading(false);

    if (result.status !== 200) return;

    const loginPayload = result?.data;
    if (loginPayload == null) {
      dispatch(
        updateNotification({
          variant: "error",
          message: result?.message || "Login failed. Invalid response.",
        })
      );
      return;
    }

    const decrypted =
      typeof loginPayload === "string"
        ? laravelDecrypt(loginPayload)
        : typeof loginPayload === "object"
        ? loginPayload
        : null;
    if (!decrypted?.user) {
      dispatch(
        updateNotification({
          variant: "error",
          message:
            "Login response decrypt မရပါ။ Dashboard `.env` ထဲက `REACT_APP_LARAVEL_SECRET_KEY` ကို API `.env` ထဲက `APP_KEY` နဲ့တူအောင် ပြန်ညှိပြီး dashboard dev server ကို restart လုပ်ပါ။",
        })
      );
      return;
    }

    // Persist encrypted payload + token for DefaultLayout auth bootstrap
    setData(
      keys.CODE,
      typeof loginPayload === "string" ? loginPayload : decrypted
    );
    setData(keys.API_TOKEN, decrypted?.token);

    dispatch(updateRole(decrypted?.role));
    dispatch(
      updateUser({
        id: decrypted.user.id,
        name: decrypted.user.name,
        email: decrypted.user.email,
        phone: decrypted.user.phone,
        agent_commission: decrypted.user.agent_commission,
        counter: decrypted.user.counter,
        role: decrypted.role,
        permissions: (decrypted.permissions || []).map((p) => p.name),
      })
    );
    const formattedPermission = (decrypted?.permissions || []).map((p) => p.name);
    dispatch(
      updateBookingInformation({
        role: decrypted.role,
        permissions: formattedPermission,
      })
    );

    if (decrypted.role === "AGENT") {
      dispatch(
        updateAgent({
          id: decrypted.user.id,
          name: decrypted.user.name,
          email: decrypted.user.email,
          phone: decrypted.user.phone,
          agent_commission: decrypted.user.agent_commission,
          is_super_agent: decrypted.user.is_super_agent,
          role: decrypted.role,
          permissions: (decrypted.permissions || []).map((p) => p.name),
        })
      );
    }
    navigate(paths.dashboard);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      component="form"
    >
      <Card
        sx={{
          width: { xs: "350px", sm: "350px", md: "350px" },
        }}
      >
        <CardContent>
          <Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
            <Typography>Shwe Yoke Lay</Typography>
          </Box>

          <FormControl
            sx={{ width: "100%", marginTop: "10px" }}
            variant="filled"
          >
            <InputLabel htmlFor="filled-adornment-email">Email</InputLabel>
            <FilledInput
              id="filled-adornment-email"
              type={"text"}
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
            />
            <ValidationMessage field={"email"} />
          </FormControl>

          <FormControl
            sx={{ width: "100%", marginTop: "10px" }}
            variant="filled"
          >
            <InputLabel htmlFor="filled-adornment-password">
              Password
            </InputLabel>
            <FilledInput
              id="filled-adornment-password"
              type={showPassword ? "text" : "password"}
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
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <ValidationMessage field={"password"} />
          </FormControl>

          <Box
            display="flex"
            justifyContent="end"
            alignItems="center"
            sx={{ marginTop: "10px" }}
          >
            <Button
              variant="contained"
              type="submit"
              onClick={submitLogin}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
