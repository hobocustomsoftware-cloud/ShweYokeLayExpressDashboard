import { agentStats, chartdata, totaldata } from "./dashboardSlice";

import { endpoints } from "../../constants/endpoints";
import { getRequest } from "../../helpers/api";
import { httpServiceHandler } from "../../helpers/handler";
import { playNotificationSound } from "../../shares/playNotificationSound";
import { toast } from "react-toastify";
import { updateNotification } from "../../shares/shareSlice";

export const dashboardService = {
  totaldata: async (dispatch) => {
    const response = await getRequest(endpoints.dashboard);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(totaldata(response.data.total_data));
      dispatch(chartdata(response.data.chart_data));
      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
      toast.success(response.message);
      playNotificationSound();
    }
    return response;
  },
  // index: async (dispatch, params) => {
  //   const response = await getRequest(endpoints.dashboard, params);
  //   await httpServiceHandler(dispatch, response);
  //   console.log(">>> ", response);
  //   if (response.status === 200) {

  //     dispatch(
  //       updateNotification({
  //         variant: "success",
  //         message: response.message,
  //       })
  //     );
  //   }
  //   return response;
  // },
  dashboardData: async (dispatch, paginateParams) => {
    const response = await getRequest(endpoints.dashboardData, paginateParams);
    await httpServiceHandler(dispatch, response);
    console.log(">>> ", response);
    if (response.status === 200) {
      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
    }
    return response;
  },
  userBalance: async (dispatch, paginateParams) => {
    const response = await getRequest(endpoints.userBalance, paginateParams);
    await httpServiceHandler(dispatch, response);
    console.log(">>> ", response);
    if (response.status === 200) {
      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
    }
    return response;
  },
  topAgent: async (dispatch, params) => {
    const response = await getRequest(endpoints.topAgent, params);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      // dispatch(
      //     index(response.data.data ? response.data.data : response.data)
      // );
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
