import { paths } from "../../constants/paths";
import { PromotionList } from "./list/PromotionList";
import { PromotionCreate } from "./entry/PromotionCreate";
import { PromotionUpdate } from "./entry/PromotionUpdate";

export const promotionRoutes = [
  {
    id: "promotions",
    path: paths.promotions,
    element: <PromotionList />,
    loader: () => ({
      breadcrumbs: [
        { label: "Dashboard", url: paths.dashboard },
        { label: null, url: null, current: "Promotions" },
      ],
      role: ["ADMINISTRATOR"],
    }),
  },
  {
    id: "promotionsCreate",
    path: paths.promotionsCreate,
    element: <PromotionCreate />,
    loader: () => ({
      breadcrumbs: [
        { label: "Dashboard", url: paths.dashboard },
        { label: "Promotions", url: paths.promotions },
        { label: null, url: null, current: "Create" },
      ],
      role: ["ADMINISTRATOR"],
    }),
  },
  {
    id: "promotionsDetail",
    path: `${paths.promotions}/:id`,
    element: <PromotionUpdate />,
    loader: () => ({
      breadcrumbs: [
        { label: "Dashboard", url: paths.dashboard },
        { label: "Promotions", url: paths.promotions },
        { label: null, url: null, current: "Update" },
      ],
    }),
  },
];

