import { AdminUpdate } from "./entry/AdminUpdate";
import { LogOut } from "../auth/entry/LogOut";
import { paths } from "../../constants/paths";

export const adminRoutes = [
  {
    id: "admin",
    path: paths.admin,
    element: <AdminUpdate />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: null, url: null, current: "Admin" },
        ],
      };
    },
  },
  {
    id: "logout",
    path: paths.logOut,
    element: <LogOut />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: null, url: null, current: "Log out" },
        ],
      };
    },
  },
];
