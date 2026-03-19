import { BlankTemplate } from "./layouts/default/pages/BlankTemplate";
import { DefaultLayout } from "./layouts/default";
import { Login } from "./modules/auth/entry/Login";
import NotFound from "./layouts/default/pages/NotFound";
import { adminRoutes } from "./modules/admin/adminRoutes";
import { agentRoutes } from "./modules/agent/agentRoutes";
import { carNumbersRoutes } from "./modules/carNumbers/carNumbersRoutes";
import { contactRoutes } from "./modules/contact/contactRoutes";
import { counterRoutes } from "./modules/counter/counterRoutes";
import { createBrowserRouter } from "react-router-dom";
import { dailyRouteRoutes } from "./modules/dailyRoute/dailyRouteRoutes";
import { dashboardRoutes } from "./modules/dashboard/dashboardRoute";
import { driverRoutes } from "./modules/drivers/driversRoutes";
import { financeRoutes } from "./modules/finance/FinanceRoutes";
import { memberRoutes } from "./modules/member/memberRoutes";
import { paymentHistoryRoutes } from "./modules/paymentHistory/paymentHistoryRoutes";
import { paymentRoutes } from "./modules/payment/paymentRoutes";
import { couponRoutes } from "./modules/coupons/couponRoutes";
import { discountRoutes } from "./modules/discounts/discountRoutes";
import { promotionRoutes } from "./modules/promotions/promotionRoutes";
import { roleRoutes } from "./modules/role/roleRoutes";
import { routesRoutes } from "./modules/routes/routesRoutes";
import { saleCounterRoutes } from "./modules/saleCounter/SaleCounterRoutes";
import { spareRoutes } from "./modules/spares/sparesRoutes";
import { sroutesSroutes } from "./modules/sroutes/sroutesRoutes";
import { userRoutes } from "./modules/user/userRoutes";
import { vehiclesTypeRoutes } from "./modules/vehiclesType/vehiclesTypeRoutes";

export const routers = createBrowserRouter(
  [
    {
      path: "/",
      element: <DefaultLayout />,
      children: [
      ...dashboardRoutes,
      ...paymentHistoryRoutes,
      ...financeRoutes,
      ...routesRoutes,
      ...sroutesSroutes,
      ...vehiclesTypeRoutes,
      ...counterRoutes,
      ...memberRoutes,
      ...agentRoutes,
      ...userRoutes,
      ...roleRoutes,
      ...adminRoutes,
      ...paymentRoutes,
      ...couponRoutes,
      ...discountRoutes,
      ...promotionRoutes,
      ...dailyRouteRoutes,
      ...contactRoutes,
      ...saleCounterRoutes,
      ...driverRoutes,
      ...spareRoutes,
      ...carNumbersRoutes,
      ],
    },
    {
      path: "auth",
      element: <BlankTemplate />,
      children: [
        {
          path: "login",
          element: <Login />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  { future: { v7_startTransition: true } }
);
