// Configurable via CRA env vars (recommended)
// - REACT_APP_API_BASE_URL (e.g. http://localhost:8000/api)
// - REACT_APP_IMAGE_URL (e.g. http://localhost:8000)
// - REACT_APP_LARAVEL_SECRET_KEY (Laravel APP_KEY base64 decoded string)
export const baseURL =
  process.env.REACT_APP_API_BASE_URL ??
  "https://uat-api.shweyokelayexpress.com/api";
export const imageURL =
  process.env.REACT_APP_IMAGE_URL ?? "https://uat-api.shweyokelayexpress.com";

// prod || uat default (must match backend APP_KEY without "base64:" prefix)
export const secretKey =
  process.env.REACT_APP_LARAVEL_SECRET_KEY ??
  "1GgK/5jB8t71Jgp6cFvQeMiGQh0g16gq07Z9mR4ob+c=";

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
