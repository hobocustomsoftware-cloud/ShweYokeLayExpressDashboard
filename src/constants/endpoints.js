// export const baseURL = "http://127.0.0.1:8000/api";
// export const imageURL = "http://127.0.0.1:8000";

// UAT
// export const baseURL = "https://uat-api.shweyokelayexpress.com/api";
// export const imageURL = "https://uat-api.shweyokelayexpress.com";

//  PROD
export const baseURL = "https://api.shweyokelayexpress.com/api";
export const imageURL = "https://api.shweyokelayexpress.com";

export const secretKey = "LVOiQ1Pk1d0srn3IJSBLrEqhoVKvODwyw+Fr/j9f0wU="; // prod
// export const secretKey = "bqCsWvUbiUeKS+Kwc4Ty/6GGOAxub3M386m37SJBbMc="; // local

export const endpoints = {
  dashboardData: "dashboardData",
  userBalance: "userBalance",
  agentStats: "dashboard/agent-stats",
  topAgent: "dashboard/top-agents",
  login: "auth/login",
  counter: "counter",
  user: "user",
  vehiclesType: "vehiclesType",
  member: "member",
  agent: "member",
  paymentHistory: "paymentHistory",
  memberPaymentHistory: "memberPaymentHistory",
  deleteSeat: "paymentHistory/deleteSeat",
  saleCounterRouteSearch: "adminRouteSearch",
  routeSearchForBlock: "routeSearchForBlock",
  route: "route",
  routes: "routes",
  adminRoutes: "routes/admin",
  sroutes: "routes",
  role: "role",
  permission: "permission",
  changepassword: "change-password",
  profile: "profile",
  payment: "payment",
  coupons: "coupons",
  couponGenerateCode: "coupons/generate-code",
  couponBulkGenerate: "coupons/bulk-generate",
  promotionConfig: "promotion-config",
  promotions: "promotions",
  discounts: "discounts",
  contact: "contact",
  dailyRoute: "dailyRoute",
  sylCounterSale: "sylCounterSale",
  bookToPaid: "bookToPaid",
  lockUnlock: "lockUnlock",
  agentSale: "agentSale",
  saleCheck: "saleCheck",
  blockSeats: "blockSeats",
  unblockSeats: "unblockSeats",
  buttonPermission: "button/permission",
  drivers: "drivers",
  spares: "spares",
  carNumbers: "carNumbers",
  finance: "finance",
  financeMemberUpdate: "finance/memberUpdate",
  settlement: "finance/settlement",
  agentSettlement: "finance/agentSettlement",
  salesHistory: "finance/salesHistory",
  // carNumbers: "carNumbers",
  // carNumbers: "carNumbers",

  image: `${imageURL}`,
};
