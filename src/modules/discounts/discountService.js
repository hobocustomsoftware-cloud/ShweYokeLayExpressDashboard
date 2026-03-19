import { delRequest, getRequest, postRequest } from "../../helpers/api";
import { endpoints } from "../../constants/endpoints";
import { httpServiceHandler } from "../../helpers/handler";
import { updateNotification } from "../../shares/shareSlice";
import { index, update } from "./discountSlice";

export const discountService = {
  store: async (payload, dispatch) => {
    const response = await postRequest(endpoints.discounts, payload);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(updateNotification({ variant: "success", message: response.message }));
    }
    return response;
  },
  index: async (dispatch, params) => {
    const response = await getRequest(endpoints.discounts, params);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(index(response.data.data ? response.data.data : response.data));
      dispatch(updateNotification({ variant: "success", message: response.message }));
    }
    return response;
  },
  show: async (dispatch, id) => {
    const response = await getRequest(`${endpoints.discounts}/${id}`);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(update(response.data));
    }
    return response;
  },
  update: async (dispatch, id, payload) => {
    const response = await postRequest(`${endpoints.discounts}/${id}`, payload);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(update(response.data));
      dispatch(updateNotification({ variant: "success", message: response.message }));
    }
    return response;
  },
  destory: async (dispatch, id) => {
    const response = await delRequest(`${endpoints.discounts}/${id}`);
    await httpServiceHandler(dispatch, response);
    return response;
  },
};

