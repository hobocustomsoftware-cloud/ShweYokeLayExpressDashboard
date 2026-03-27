import { keys, laravelDecrypt } from "../../constants/config";
import { endpoints } from "../../constants/endpoints";
import { postRequest } from "../../helpers/api";
import { httpServiceHandler } from "../../helpers/handler";
import { setData } from "../../helpers/localstorage";
import {
  updateMan,
  updateNotification,
  updatePermission,
  updateRole,
  updateUser,
} from "../../shares/shareSlice";

export const authService = {
  login: async (payload, dispatch) => {
    const response = await postRequest(endpoints.login, payload);

    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      const loginPayload = response?.data;
      const decryptData =
        loginPayload != null && typeof loginPayload === "string"
          ? laravelDecrypt(loginPayload)
          : loginPayload != null && typeof loginPayload === "object"
          ? loginPayload
          : null;

      if (!decryptData?.user) {
        dispatch(
          updateNotification({
            variant: "error",
            message:
              "Login response decrypt မရပါ။ Dashboard `.env` ထဲက `REACT_APP_LARAVEL_SECRET_KEY` ကို API `.env` ထဲက `APP_KEY` နဲ့တူအောင် ပြန်ညှိပြီး dashboard dev server ကို restart လုပ်ပါ။",
          })
        );
        return response;
      }

      setData(keys.API_TOKEN, decryptData?.token);
      setData(
        keys.CODE,
        typeof loginPayload === "string"
          ? loginPayload
          : decryptData
      );

      dispatch(updateRole(decryptData?.role));
      const permissionNames = decryptData?.permissions?.map((p) => p.name) || [];
      dispatch(updatePermission(permissionNames));

      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
    }

    return response;
  },
};
