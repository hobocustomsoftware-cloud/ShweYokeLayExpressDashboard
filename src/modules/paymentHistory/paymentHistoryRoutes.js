import { PaymentHistoryList } from "./list/PaymentHistoryList";
// import { PaymentHistoryCreate } from "./entry/PaymentHistoryCreate";
import { PaymentHistoryUpdate } from "./entry/PaymentHistoryUpdate";
import { paths } from "../../constants/paths";

export const paymentHistoryRoutes = [
  {
    id: "paymentHistory",
    path: paths.paymentHistory,
    element: <PaymentHistoryList />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: null, url: null, current: "PaymentHistory" },
        ],
        role: ["ADMINISTRATOR"],
      };
    },
  },
  // {
  //     id: "paymentHistoryCreate",
  //     path: paths.paymentHistoryCreate,
  //     element: <PaymentHistoryCreate />,
  //     loader: () => {
  //         return {
  //             breadcrumbs: [
  //                 { label: "Dashboard", url: paths.dashboard },
  //                 { label: "PaymentHistory", url: paths.paymentHistory },
  //                 { label: null, url: null, current: "Create" },
  //             ],
  //             role: ["ADMINISTRATOR"],
  //         };
  //     },
  // },
  {
    id: "paymentHistoryDetail",
    path: `/${paths.paymentHistory}/:id`,
    element: <PaymentHistoryUpdate />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: "PaymentHistory", url: paths.paymentHistory },
          { label: null, url: null, current: "Update" },
        ],
      };
    },
  },
];
