import { AgentHistory } from "./list/AgentHistory";
import { FinanceAgentList } from "./list/FinanceAgentList";
import { FinanceAgentUpdate } from "./entry/FinanceAgentUpdate";
import { FinanceMemberList } from "./list/FinanceMemberList";
import { FinanceSaleUpdate } from "./entry/FinanceSaleUpdate";
import { FinanceUserList } from "./list/FinanceUserList";
import { SalesHistory } from "./list/SalesHistory";
// import { FinanceList } from "./list/FinanceList";
// import { FinanceUpdate } from "./entry/FinanceUpdate";
import { paths } from "../../constants/paths";

export const financeRoutes = [
  {
    id: "financeSalesList",
    path: paths.financeSalesList,
    element: <FinanceUserList />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: null, url: null, current: "Sales List" },
        ],
        role: ["ADMINISTRATOR"],
      };
    },
  },
  {
    id: "financeSalesDetail",
    path: `/${paths.salesHistory}/user/:id`,
    element: <SalesHistory />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: "Counters List", url: paths.financeSalesList },
          { label: null, url: null, current: "Sales Detail" },
        ],
      };
    },
  },
  {
    id: "financeSalesUpdate",
    path: `/${paths.financeSalesList}/:id`,
    element: <FinanceSaleUpdate />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: "Finance", url: paths.financeSalesList },
          { label: null, url: null, current: "Sales Update" },
        ],
      };
    },
  },
  // ----------- agents -----------
  {
    id: "financeAgentList",
    path: paths.financeAgentList,
    element: <FinanceAgentList />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: null, url: null, current: "Agents List" },
        ],
        role: ["ADMINISTRATOR"],
      };
    },
  },
  {
    id: "financeAgentDetail",
    path: `/${paths.agentHistory}/agent/:id`,
    element: <AgentHistory />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: "Agents List", url: paths.financeAgentList },
          { label: null, url: null, current: "Agent Detail" },
        ],
      };
    },
  },
  {
    id: "financeAgentUpdate",
    path: `/${paths.financeAgentList}/:id`,
    element: <FinanceAgentUpdate />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: "Agents", url: paths.financeAgentList },
          { label: null, url: null, current: "Agent Update" },
        ],
      };
    },
  },
  // ----------- agents -----------
  {
    id: "financeMemberList",
    path: paths.financeMemberList,
    element: <FinanceMemberList />,
    loader: () => {
      return {
        breadcrumbs: [
          { label: "Dashboard", url: paths.dashboard },
          { label: null, url: null, current: "Members List" },
        ],
        role: ["ADMINISTRATOR"],
      };
    },
  },
];
