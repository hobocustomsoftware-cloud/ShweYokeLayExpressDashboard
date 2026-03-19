import React, { useEffect } from "react";

import { paths } from "../../../constants/paths";
import { removeAllData } from "../../../helpers/localstorage";
import { resetAgent } from "../../agent/agentSlice";
import { resetShareSlice } from "../../../shares/shareSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const LogOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logout = async () => {
    removeAllData();
    dispatch(resetShareSlice());
    dispatch(resetAgent());
    navigate(paths.adminLogout);
  };

  useEffect(() => {
    logout();
  }, []);
  return;
};
