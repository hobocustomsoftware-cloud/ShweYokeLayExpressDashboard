import { paths } from "../../constants/paths";
import { DiscountList } from "./list/DiscountList";
import { DiscountCreate } from "./entry/DiscountCreate";
import { DiscountUpdate } from "./entry/DiscountUpdate";

export const discountRoutes = [
  {
    id: "discounts",
    path: paths.discounts,
    element: <DiscountList />,
    loader: () => ({
      breadcrumbs: [
        { label: "Dashboard", url: paths.dashboard },
        { label: null, url: null, current: "Discounts" },
      ],
      role: ["ADMINISTRATOR"],
    }),
  },
  {
    id: "discountsCreate",
    path: paths.discountsCreate,
    element: <DiscountCreate />,
    loader: () => ({
      breadcrumbs: [
        { label: "Dashboard", url: paths.dashboard },
        { label: "Discounts", url: paths.discounts },
        { label: null, url: null, current: "Create" },
      ],
      role: ["ADMINISTRATOR"],
    }),
  },
  {
    id: "discountsDetail",
    path: `${paths.discounts}/:id`,
    element: <DiscountUpdate />,
    loader: () => ({
      breadcrumbs: [
        { label: "Dashboard", url: paths.dashboard },
        { label: "Discounts", url: paths.discounts },
        { label: null, url: null, current: "Update" },
      ],
    }),
  },
];

