import { delRequest, getRequest, postRequest } from "../../helpers/api";
import { endpoints } from "../../constants/endpoints";
import { httpServiceHandler } from "../../helpers/handler";
import { updateNotification } from "../../shares/shareSlice";

export const promotionService = {
  index: async (dispatch, params) => {
    const response = await getRequest(endpoints.promotions, params);
    await httpServiceHandler(dispatch, response);
    return response;
  },
  show: async (dispatch, id) => {
    const response = await getRequest(`${endpoints.promotions}/${id}`);
    await httpServiceHandler(dispatch, response);
    return response;
  },
  store: async (dispatch, payload) => {
    const response = await postRequest(endpoints.promotions, payload);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(updateNotification({ variant: "success", message: response.message }));
    }
    return response;
  },
  update: async (dispatch, id, payload) => {
    const response = await postRequest(`${endpoints.promotions}/${id}`, payload);
    await httpServiceHandler(dispatch, response);
    if (response.status === 200) {
      dispatch(updateNotification({ variant: "success", message: response.message }));
    }
    return response;
  },
  destory: async (dispatch, id) => {
    const response = await delRequest(`${endpoints.promotions}/${id}`);
    await httpServiceHandler(dispatch, response);
    return response;
  },
};

