// AppRoot.jsx
import React from "react";
import { RouterProvider } from "react-router-dom";
import { routers } from "./routers";

const AppRoot = () => {
  return <RouterProvider router={routers} />;
};

export default AppRoot;
