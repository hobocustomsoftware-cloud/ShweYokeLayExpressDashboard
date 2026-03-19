import {
  delRequest,
  featchGetRequest,
  getRequest,
  postRequest,
} from "../../helpers/api";
import { index, summary, update } from "./SalesHistorySlice";

import { baseURL } from "../../constants/endpoints";
import { endpoints } from "../../constants/endpoints";
import { getData } from "../../helpers/localstorage";
import { httpServiceHandler } from "../../helpers/handler";
import { keys } from "../../constants/config";
import { updateNotification } from "../../shares/shareSlice";

export const SalesHistoryService = {
  index: async (dispatch, id, params) => {
    console.log(params);
    const response = await getRequest(
      `${endpoints.salesHistory}/user/${id}`,
      params
    );
    console.log("response ***", response);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      console.log("result >> >", response.data);
      dispatch(index(response.data ? response.data.histories.data : null));
      dispatch(summary(response.data ? response.data.summary : null));
      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
    }
    return response;
  },
  agentList: async (dispatch, id, params) => {
    console.log(params);
    const response = await getRequest(
      `${endpoints.salesHistory}/agent/${id}`,
      params
    );
    console.log("response ***", response);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      console.log("result >> >", response.data);
      dispatch(index(response.data ? response.data.histories.data : null));
      dispatch(summary(response.data ? response.data.summary : null));
      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
    }
    return response;
  },
  store: async (payload, dispatch) => {
    const response = await postRequest(endpoints.salesHistory, payload);
    await httpServiceHandler(dispatch, response);

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

  update: async (dispatch, id, payload) => {
    const response = await postRequest(
      `${endpoints.paymentHistory}/${id}`,
      payload
    );
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(update(response.data));
      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
    }
    return response;
  },
  show: async (dispatch, id, name) => {
    const response = await getRequest(
      `${endpoints.paymentHistory}/${name}/${id}`
    );
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(update(response.data));
    }

    return response;
  },
  destory: async (dispatch, id) => {
    const response = await delRequest(`${endpoints.paymentHistory}/${id}`);
    await httpServiceHandler(dispatch, response);
    return response;
  },
  exportexcel: async (dispatch, params) => {
    const response = await featchGetRequest(
      `${baseURL}/${endpoints.paymentHistory}/exportexcel`,
      params
    );

    if (response.status === 200) {
      dispatch(
        updateNotification({
          variant: "success",
          message: "Datas Export Success",
        })
      );
    }
    return response;
  },
  exportexcelparams: async (dispatch, params) => {
    const response = await featchGetRequest(
      `${baseURL}/${endpoints.paymentHistory}/exportexcelparams`,
      params
    );

    if (response.status === 200) {
      dispatch(
        updateNotification({
          variant: "success",
          message: "Datas Export Success",
        })
      );
    }
    return response;
  },
  exportpdf: async (dispatch, params) => {
    const response = await featchGetRequest(
      `${baseURL}/${endpoints.paymentHistory}/exportpdf`,
      params,
      "pdf"
    );

    if (response.status === 200) {
      dispatch(
        updateNotification({
          variant: "success",
          message: "Datas Export Success",
        })
      );
    }
    return response;
  },
  exportpdfparams: async (dispatch, params) => {
    const response = await featchGetRequest(
      `${baseURL}/${endpoints.paymentHistory}/exportpdfparams`,
      params,
      "pdf"
    );

    if (response.status === 200) {
      dispatch(
        updateNotification({
          variant: "success",
          message: "Datas Export Success",
        })
      );
    }
    return response;
  },
  import: async (payload, dispatch) => {
    const response = await postRequest(
      `${endpoints.paymentHistory}/import`,
      payload
    );
    await httpServiceHandler(dispatch, response);

    return response;
  },
};
