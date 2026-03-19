import { Outlet } from "react-router-dom";
// components/GlobalAuthWatcher.jsx
import React from "react";
import { useAuthWatcher } from "./useAuthWatcher";

const GlobalAuthWatcher = () => {
  useAuthWatcher(); // safe to use navigate here

  return <Outlet />; // render child routes
};

export default GlobalAuthWatcher;
