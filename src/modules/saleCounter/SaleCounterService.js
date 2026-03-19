import {
  delRequest,
  featchGetRequest,
  getRequest,
  postRequest,
} from "../../helpers/api";
import { index, update } from "./SaleCounterSlice";

import { baseURL } from "../../constants/endpoints";
import { endpoints } from "../../constants/endpoints";
import { getData } from "../../helpers/localstorage";
import { httpServiceHandler } from "../../helpers/handler";
import { keys } from "../../constants/config";
import { updateNotification } from "../../shares/shareSlice";

export const SaleCounterService = {
  store: async (payload, dispatch) => {
    const response = await postRequest(endpoints.saleCounter, payload);
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
  index: async (dispatch, params) => {
    const response = await getRequest(endpoints.saleCounter, params);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(index(response.data.data ? response.data.data : response.data));
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
      `${endpoints.saleCounter}/${id}`,
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
    const response = await getRequest(`${endpoints.saleCounter}/${name}/${id}`);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(update(response.data));
    }

    return response;
  },
  check: async (dispatch, params) => {
    const response = await getRequest(endpoints.saleCheck, params);
    await httpServiceHandler(dispatch, response);

    return response;
  },
  destory: async (dispatch, id) => {
    const response = await delRequest(`${endpoints.saleCounter}/${id}`);
    await httpServiceHandler(dispatch, response);

    // if (response.status === 200) {
    //     dispatch(updateNotification({
    //         variant : 'success',
    //           message : response.message
    //     }))
    // }
    return response;
  },
  exportexcel: async (dispatch, params) => {
    const response = await featchGetRequest(
      `${baseURL}/${endpoints.saleCounter}/exportexcel`,
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
      `${baseURL}/${endpoints.saleCounter}/exportexcelparams`,
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
      `${baseURL}/${endpoints.saleCounter}/exportpdf`,
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
      `${baseURL}/${endpoints.saleCounter}/exportpdfparams`,
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
      `${endpoints.saleCounter}/import`,
      payload
    );
    await httpServiceHandler(dispatch, response);

    return response;
  },
  block: async (dispatch, payload) => {
    const response = await postRequest(`${endpoints.blockSeats}`, payload);
    await httpServiceHandler(dispatch, response);

    if (response.status === 201) {
      dispatch(update(response.data));
      console.log("response", response);
      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
    }
    return response;
  },
  unBlock: async (dispatch, payload) => {
    const response = await postRequest(`${endpoints.unblockSeats}`, payload);
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
};
