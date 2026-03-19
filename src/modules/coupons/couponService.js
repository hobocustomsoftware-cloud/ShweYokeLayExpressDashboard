import { delRequest, getRequest, postRequest } from "../../helpers/api";
import { endpoints } from "../../constants/endpoints";
import { httpServiceHandler } from "../../helpers/handler";
import { updateNotification } from "../../shares/shareSlice";
import { index, update } from "./couponSlice";

export const couponService = {
  generateCode: async (dispatch) => {
    const response = await getRequest(endpoints.couponGenerateCode);
    await httpServiceHandler(dispatch, response);
    return response;
  },
  bulkGenerate: async (dispatch, payload) => {
    const response = await postRequest(endpoints.couponBulkGenerate, payload);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(updateNotification({ variant: "success", message: response.message }));
    }
    return response;
  },
  store: async (payload, dispatch) => {
    const response = await postRequest(endpoints.coupons, payload);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(updateNotification({ variant: "success", message: response.message }));
    }
    return response;
  },
  index: async (dispatch, params) => {
    const response = await getRequest(endpoints.coupons, params);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(index(response.data.data ? response.data.data : response.data));
      dispatch(updateNotification({ variant: "success", message: response.message }));
    }
    return response;
  },
  show: async (dispatch, id) => {
    const response = await getRequest(`${endpoints.coupons}/${id}`);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(update(response.data));
    }
    return response;
  },
  update: async (dispatch, id, payload) => {
    const response = await postRequest(`${endpoints.coupons}/${id}`, payload);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(update(response.data));
      dispatch(updateNotification({ variant: "success", message: response.message }));
    }
    return response;
  },
  destory: async (dispatch, id) => {
    const response = await delRequest(`${endpoints.coupons}/${id}`);
    await httpServiceHandler(dispatch, response);
    return response;
  },
};

