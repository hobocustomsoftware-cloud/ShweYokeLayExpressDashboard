import agentSlice from "./modules/agent/agentSlice";
import bookingInformationSlice from "./modules/saleCounter/bookingInformationSlice";
import carNumberSlice from "./modules/carNumbers/carNumbersSlice";
import closeSeatsSlice from "./modules/saleCounter/CloseSeatsSlice";
import { configureStore } from "@reduxjs/toolkit";
import contactSlice from "./modules/contact/contactSlice";
import countSlice from "./shares/countSlice";
import counterSlice from "./modules/counter/counterSlice";
import dailyRouteSlice from "./modules/dailyRoute/dailyRouteSlice";
import dashboardSlice from "./modules/dashboard/dashboardSlice";
import driversSlice from "./modules/drivers/driversSlice";
import financeAgentSlice from "./modules/finance/FinanceAgentSlice";
import financeUserSlice from "./modules/finance/FinanceUserSlice";
import memberSlice from "./modules/member/memberSlice";
import paymentHistorySlice from "./modules/paymentHistory/paymentHistorySlice";
import paymentSlice from "./modules/payment/paymentSlice";
import roleSlice from "./modules/role/roleSlice";
import routesSlice from "./modules/routes/routesSlice";
import salesHistorySlice from "./modules/finance/SalesHistorySlice";
import shareSlice from "./shares/shareSlice";
import sparesSlice from "./modules/spares/sparesSlice";
import sroutesSlice from "./modules/sroutes/sroutesSlice";
import userSlice from "./modules/user/userSlice";
import vehiclesTypeSlice from "./modules/vehiclesType/vehiclesTypeSlice";
import couponSlice from "./modules/coupons/couponSlice";
import discountSlice from "./modules/discounts/discountSlice";

export const stores = configureStore({
  reducer: {
    share: shareSlice,
    count: countSlice,
    user: userSlice,
    financeUser: financeUserSlice,
    financeAgent: financeAgentSlice,
    vehiclesType: vehiclesTypeSlice,
    dashboard: dashboardSlice,
    member: memberSlice,
    agent: agentSlice,
    paymentHistory: paymentHistorySlice,
    salesHistory: salesHistorySlice,
    counter: counterSlice,
    closeSeats: closeSeatsSlice,
    routes: routesSlice,
    sroutes: sroutesSlice,
    role: roleSlice,
    payment: paymentSlice,
    coupons: couponSlice,
    discounts: discountSlice,
    dailyRoute: dailyRouteSlice,
    contact: contactSlice,
    bookingInformation: bookingInformationSlice,
    drivers: driversSlice,
    spares: sparesSlice,
    carNumbers: carNumberSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
