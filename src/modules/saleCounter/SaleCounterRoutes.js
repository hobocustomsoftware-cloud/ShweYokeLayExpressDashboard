import { CloseSeatsPage } from "./entry/CloseSeatsPage";
import { PaymentHistoryUpdate } from "./entry/PaymentHistoryUpdate";
import PrintTicket from "./entry/PrintTicket";
import { SaleCheckPage } from "./entry/SaleCheckPage";
import { SaleCounterCreate } from "./entry/SaleCounterCreate";
import SeatSelectionPage from "./entry/SeatSelectionPage";
import { paths } from "../../constants/paths";

export const saleCounterRoutes = [
  {
    id: "saleCounterCreate",
    path: paths.saleCounterCreate,
    element: <SaleCounterCreate />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: "Sale Counter", url: paths.saleCounterCreate },
          { label: null, url: null, current: "SaleCounter" },
        ],
        role: ["ADMINISTRATOR", "SUPER_ADMIN", "AGENT", "SALES"],
      };
    },
  },
  {
    id: "saleCheckPage",
    path: paths.ssaleCheckPage,
    element: <SaleCheckPage />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: null, url: null, current: "Sale Check" },
        ],
        role: ["ADMINISTRATOR", "AGENT", "SALES"],
      };
    },
  },
  {
    id: "blockSeats",
    path: paths.blockSeatsPage,
    element: <CloseSeatsPage />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: null, url: null, current: "Block Seats" },
        ],
        role: ["ADMINISTRATOR", "SALES"],
      };
    },
  },
  {
    id: "seatSelectionPage",
    path: paths.seatSelectionPage,
    element: <SeatSelectionPage />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: "Sale Counter", url: paths.saleCounter },
          { label: null, url: null, current: "Seat Selection" },
        ],
        role: ["ADMINISTRATOR", "AGENT", "SALES"],
      };
    },
  },
  {
    id: "printTicket",
    path: paths.printTicket,
    element: <PrintTicket />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: "Sale Counter", url: paths.saleCounter },
          { label: null, url: null, current: "Print Ticket" },
        ],
        role: ["ADMINISTRATOR", "AGENT", "SALES"],
      };
    },
  },
  {
    id: "saleCounterDetail",
    path: `/${paths.saleCounter}/:id`,
    element: <PaymentHistoryUpdate />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: "SaleCounter", url: paths.saleCounter },
          { label: null, url: null, current: "Update" },
        ],
      };
    },
  },
];
