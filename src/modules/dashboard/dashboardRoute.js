import { DashboardList } from "./list/DashboardList";
import { paths } from "../../constants/paths";

export const dashboardRoutes = [
  {
    id: "/",
    path: paths.dashboard,
    element: <DashboardList />,
    loader: () => {
      return {
        breadcrumbs: [{ label: "Dashboard", url: paths.dashboard }],
        role: ["ADMINISTRATOR", "AGENT", "SALES"],
      };
    },
  },
];
