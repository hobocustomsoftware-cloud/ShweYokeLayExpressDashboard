import { paths } from "../../constants/paths";
import { CouponList } from "./list/CouponList";
import { CouponCreate } from "./entry/CouponCreate";
import { CouponUpdate } from "./entry/CouponUpdate";

export const couponRoutes = [
  {
    id: "coupons",
    path: paths.coupons,
    element: <CouponList />,
    loader: () => ({
      breadcrumbs: [
        { label: "Dashboard", url: paths.dashboard },
        { label: null, url: null, current: "Coupons" },
      ],
      role: ["ADMINISTRATOR"],
    }),
  },
  {
    id: "couponsCreate",
    path: paths.couponsCreate,
    element: <CouponCreate />,
    loader: () => ({
      breadcrumbs: [
        { label: "Dashboard", url: paths.dashboard },
        { label: "Coupons", url: paths.coupons },
        { label: null, url: null, current: "Create" },
      ],
      role: ["ADMINISTRATOR"],
    }),
  },
  {
    id: "couponsDetail",
    path: `${paths.coupons}/:id`,
    element: <CouponUpdate />,
    loader: () => ({
      breadcrumbs: [
        { label: "Dashboard", url: paths.dashboard },
        { label: "Coupons", url: paths.coupons },
        { label: null, url: null, current: "Update" },
      ],
    }),
  },
  ];

