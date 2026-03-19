import { agentIndex, agentUpdate } from "./FinanceAgentSlice";
import {
  delRequest,
  featchGetRequest,
  getRequest,
  postRequest,
} from "../../helpers/api";
import { index, update } from "./FinanceUserSlice";

import { baseURL } from "../../constants/endpoints";
import { endpoints } from "../../constants/endpoints";
import { httpServiceHandler } from "../../helpers/handler";
import { memberIndex } from "./FinanceMemberSlice";
import { updateNotification } from "../../shares/shareSlice";

export const FinanceService = {
  index: async (dispatch, params) => {
    const response = await getRequest(endpoints.finance + "/sales", params);
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
  agentList: async (dispatch, params) => {
    const response = await getRequest(endpoints.finance + "/agents", params);
    // console.log("response.data >> ", response.data.data);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(
        agentIndex(response.data.data ? response.data.data : response.data)
      );
      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
    }
    return response;
  },
  memberList: async (dispatch, params) => {
    const response = await getRequest(endpoints.finance + "/members", params);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(
        memberIndex(response.data.data ? response.data.data : response.data)
      );
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
    const response = await postRequest(`${endpoints.user}/${id}`, payload);
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
  agentUpdate: async (dispatch, id, payload) => {
    const response = await postRequest(
      `${endpoints.financeMemberUpdate}/${id}`,
      payload
    );
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(agentUpdate(response.data));
      dispatch(
        updateNotification({
          variant: "success",
          message: response.message,
        })
      );
    }
    return response;
  },
  show: async (dispatch, id) => {
    const response = await getRequest(`${endpoints.user}/${id}`);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(update(response.data));
    }
    return response;
  },
  agentShow: async (dispatch, id) => {
    const response = await getRequest(`${endpoints.member}/${id}`);
    await httpServiceHandler(dispatch, response);

    if (response.status === 200) {
      dispatch(agentUpdate(response.data));
    }
    return response;
  },
  destory: async (dispatch, id) => {
    const response = await delRequest(`${endpoints.user}/${id}`);
    await httpServiceHandler(dispatch, response);
    return response;
  },
  exportexcel: async (dispatch, params) => {
    const response = await featchGetRequest(
      `${baseURL}/${endpoints.user}/exportexcel`,
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
      `${baseURL}/${endpoints.user}/exportexcelparams`,
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
      `${baseURL}/${endpoints.user}/exportpdf`,
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
      `${baseURL}/${endpoints.user}/exportpdfparams`,
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
    const response = await postRequest(`${endpoints.user}/import`, payload);
    await httpServiceHandler(dispatch, response);

    return response;
  },
  settlement: async (dispatch, id, payload) => {
    const response = await postRequest(
      `${endpoints.settlement}/${id}`,
      payload
    );
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
  agentSettlement: async (dispatch, id, payload) => {
    const response = await postRequest(
      `${endpoints.agentSettlement}/${id}`,
      payload
    );
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
};
