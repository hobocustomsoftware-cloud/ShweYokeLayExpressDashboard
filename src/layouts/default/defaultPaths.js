import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BlockIcon from "@mui/icons-material/Block";
import ContactsIcon from "@mui/icons-material/Contacts";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HandshakeIcon from "@mui/icons-material/Handshake";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import { Print } from "@mui/icons-material";
import RouteIcon from "@mui/icons-material/Route";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TimelineIcon from "@mui/icons-material/Timeline";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import { paths } from "../../constants/paths";

export const items = [
  {
    key: "dashboard",
    label: "စာရင်းချုပ်",
    data: "Documents Folder",
    // roles: ["SUPER_ADMIN", "SALES", "USER", "AGENT"],
    icon: <InsertChartIcon />,
    url: "/",
    permission: "Dashboard_Sidebar",
  },
  {
    key: "dailyRoute",
    label: "ယာဉ်အချက်အလက်",
    data: "Daily Route",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <TimelineIcon />,
    url: paths.dailyRoute,
    permission: "Daily_Route_Sidebar",
    // children: [
    //   {
    //     key: "dailyRouteList",
    //     label: "List",
    // roles: ["SUPER_ADMIN", "USER"],
    //     icon: <FormatListBulletedIcon />,
    //     url: paths.dailyRoute,
    //   },
    // ],
  },
  {
    key: "paymentHistory",
    label: "လက်မှတ်စာရင်း",
    data: "Payment History",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <WorkHistoryIcon />,
    url: paths.paymentHistory,
    permission: "Payment_History_Sidebar",
    // children: [
    //   {
    //     key: "paymentHistoryList",
    //     label: "List",
    // roles: ["SUPER_ADMIN", "USER"],
    //     icon: <FormatListBulletedIcon />,
    //     url: paths.paymentHistory,
    //   },
    // ],
  },
  {
    key: "finance",
    label: "ငွေစာရင်း",
    data: "Finance",
    // roles: ["SUPER_ADMIN", "USER"],
    permission: "Finance_Sidebar",
    icon: <WorkHistoryIcon />,
    children: [
      {
        key: "financeSalesLst",
        label: "Counters List",
        // roles: ["SUPER_ADMIN", "FINANCE"],
        permission: "Finance_Counter_Detail",
        icon: <PointOfSaleIcon />,
        url: paths.financeSalesList,
      },
      {
        key: "financeAgentList",
        label: "Agent List",
        // roles: ["SUPER_ADMIN", "FINANCE"],
        permission: "Finance_Agent_Detail",
        icon: <HandshakeIcon />,
        url: paths.financeAgentList,
      },
      {
        key: "financeMemberLst",
        label: "Members List",
        // roles: ["SUPER_ADMIN", "FINANCE"],
        permission: "Finance_Member_Detail",
        icon: <Diversity3Icon />,
        url: paths.financeMemberList,
      },
    ],
  },
  {
    key: "saleCounter",
    label: "လက်မှတ်အရောင်း",
    data: "Sales",
    // roles: ["SUPER_ADMIN", "USER", "SALES", "AGENT"],
    permission: "Sale_Counter_Sidebar",
    icon: <PointOfSaleIcon />,
    children: [
      {
        key: "saleCounterCreate",
        label: "ရောင်းရန်",
        // roles: ["SUPER_ADMIN", "USER", "SALES", "AGENT"],
        permission: "Sale_Counter_Create",
        icon: <AddIcon />,
        url: paths.saleCounterCreate,
      },
      {
        key: "printTicket",
        label: "လက်မှတ်နမူနာ",
        // roles: ["SUPER_ADMIN", "USER", "SALES", "AGENT"],
        permission: "Sale_Counter_Print",
        icon: <Print />,
        url: paths.printTicket,
      },
    ],
  },
  {
    key: "saleCheck",
    label: "ခုံစစ်ရန်",
    data: "Sale Check",
    // roles: ["SUPER_ADMIN", "USER", "SALES", "AGENT"],
    permission: "Sale_Check_Sidebar",
    icon: <ManageSearchIcon />,
    url: paths.saleCheckPage,
  },
  {
    key: "blockSeats",
    label: "ခုံပိတ်ရန်",
    data: "Block Seats",
    // roles: ["SUPER_ADMIN", "SALES"],
    permission: "Block_Seats_Sidebar",
    icon: <BlockIcon />,
    url: paths.blockSeatsPage,
  },
  {
    key: "vehiclesType",
    label: "ကားအမျိုးအစား",
    data: "Vehicles Type",
    permission: "Vehicles_Type_Sidebar",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <DirectionsBusIcon />,
    children: [
      {
        key: "vehiclesTypeList",
        label: "ကားများ",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <FormatListBulletedIcon />,
        permission: "Vehicles_Type_List",
        url: paths.vehiclesType,
      },
      {
        key: "vehiclesTypeCreate",
        label: "အသစ်ထည့်ရန်",
        // roles: ["SUPER_ADMIN", "USER"],
        permission: "Vehicles_Type_Create",
        icon: <AddIcon />,
        url: paths.vehiclesTypeCreate,
      },
    ],
  },
  {
    key: "drivers",
    label: "ယာဉ်မောင်း",
    data: "Drivers",
    // roles: ["SUPER_ADMIN", "USER"],
    permission: "Driver_Sidebar",
    icon: <AssignmentIndOutlinedIcon />,
    children: [
      {
        key: "driversList",
        label: "ယာဉ်မောင်းများ",
        // roles: ["SUPER_ADMIN", "USER"],
        permission: "Driver_Detail",
        icon: <FormatListBulletedIcon />,
        url: paths.drivers,
      },
      {
        key: "driversCreate",
        label: "အသစ်ထည့်ရန်",
        // roles: ["SUPER_ADMIN", "USER"],
        permission: "Driver_Create",
        icon: <AddIcon />,
        url: paths.driversCreate,
      },
    ],
  },
  {
    key: "spares",
    label: "ယာဉ်နောက်လိုက်",
    data: "Spares",
    // roles: ["SUPER_ADMIN", "USER"],
    permission: "Spare_Sidebar",
    icon: <GroupOutlinedIcon />,
    children: [
      {
        key: "sparesList",
        label: "ယာဉ်နောက်လိုက်များ",
        permission: "Spare_Detail",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <FormatListBulletedIcon />,
        url: paths.spares,
      },
      {
        key: "sparesCreate",
        label: "အသစ်ထည့်ရန်",
        permission: "Spare_Create",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <AddIcon />,
        url: paths.sparesCreate,
      },
    ],
  },
  {
    key: "carNumbers",
    label: "ယာဉ်နံပါတ်",
    data: "CarNumbers",
    permission: "Car_Number_Sidebar",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <NumbersOutlinedIcon />,
    children: [
      {
        key: "carNumbersList",
        label: "ယာဉ်နံပါတ်များ",
        permission: "Car_Number_Detail",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <FormatListBulletedIcon />,
        url: paths.carNumbers,
      },
      {
        key: "carNumbersCreate",
        label: "အသစ်ထည့်ရန်",
        permission: "Car_Number_Create",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <AddIcon />,
        url: paths.carNumbersCreate,
      },
    ],
  },
  {
    key: "counter",
    label: "ကားဂိတ်",
    data: "Counter",
    permission: "Counter_Sidebar",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <StorefrontIcon />,
    children: [
      {
        key: "counterList",
        label: "ဂိတ်များ",
        // roles: ["SUPER_ADMIN", "USER"],
        permission: "Counter_Detail",
        icon: <FormatListBulletedIcon />,
        url: paths.counter,
      },
      {
        key: "counterCreate",
        label: "အသစ်ထည့်ရန်",
        permission: "Counter_Create",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <AddIcon />,
        url: paths.counterCreate,
      },
    ],
  },
  {
    key: "routes",
    label: "ခရီးစဉ်",
    data: "Routes",
    permission: "Route_Sidebar",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <RouteIcon />,
    children: [
      {
        key: "routesList",
        label: "ခရီးစဉ်များ",
        permission: "Route_Detail",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <FormatListBulletedIcon />,
        url: paths.routes,
      },
      {
        key: "routesCreate",
        label: "အသစ်ထည့်ရန်",
        permission: "Route_Create",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <AddIcon />,
        url: paths.routesCreate,
      },
    ],
  },
  {
    key: "specialRoutes",
    label: "အထူးခရီးစဉ်",
    data: "Special Routes",
    permission: "Special_Route_Sidebar",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <AltRouteIcon />,
    children: [
      {
        key: "specialRoutesList",
        label: "အထူးခရီးစဉ်များ",
        // roles: ["SUPER_ADMIN", "USER"],
        permission: "Special_Route_Detail",
        icon: <FormatListBulletedIcon />,
        url: paths.sroutes,
      },
      {
        key: "specialRoutesCreate",
        label: "အသစ်ထည့်ရန်",
        // roles: ["SUPER_ADMIN", "USER"],
        permission: "Special_Route_Create",
        icon: <AddIcon />,
        url: paths.sroutesCreate,
      },
    ],
  },
  {
    key: "payment",
    label: "ငွေပေးချေမှု",
    data: "Payment",
    permission: "Payment_Sidebar",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <PaymentIcon />,
    children: [
      {
        key: "paymentList",
        label: "ငွေပေးချေမှုများ",
        permission: "Payment_Detail",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <FormatListBulletedIcon />,
        url: paths.payment,
      },
      {
        key: "paymentCreate",
        label: "အသစ်ထည့်ရန်",
        permission: "Payment_Create",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <AddIcon />,
        url: paths.paymentCreate,
      },
      {
        key: "coupons",
        label: "Coupon",
        permission: "Payment_Create",
        icon: <LocalOfferIcon />,
        url: paths.coupons,
      },
      {
        key: "discounts",
        label: "Discount",
        permission: "Payment_Create",
        icon: <LocalOfferIcon />,
        url: paths.discounts,
      },
      {
        key: "promotions",
        label: "Promotions",
        permission: "Payment_Create",
        icon: <LocalOfferIcon />,
        url: paths.promotions,
      },
    ],
  },
  {
    key: "member",
    label: "အဖွဲ့ဝင်",
    data: "Member",
    // roles: ["SUPER_ADMIN", "USER"],
    permission: "Member_Sidebar",
    icon: <Diversity3Icon />,
    children: [
      {
        key: "memberList",
        label: "အဖွဲ့ဝင်များ",
        // roles: ["SUPER_ADMIN", "USER"],
        permission: "Member_Detail",
        icon: <FormatListBulletedIcon />,
        url: paths.member,
      },
      {
        key: "memberCreate",
        label: "အသစ်ထည့်ရန်",
        permission: "Member_Create",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <AddIcon />,
        url: paths.memberCreate,
      },
    ],
  },
  {
    key: "agent",
    label: "ကိုယ်စားလှယ်",
    data: "Agent",
    permission: "Agent_Sidebar",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <HandshakeIcon />,
    children: [
      {
        key: "agentList",
        label: "ကိုယ်စားလှယ်များ",
        permission: "Agent_Detail",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <FormatListBulletedIcon />,
        url: paths.agent,
      },
      {
        key: "agentCreate",
        label: "အသစ်ထည့်ရန်",
        permission: "Agent_Create",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <AddIcon />,
        url: paths.agentCreate,
      },
    ],
  },

  {
    key: "user",
    label: "ဝန်ထမ်း",
    data: "User",
    // roles: ["SUPER_ADMIN", "USER"],
    permission: "User_Sidebar",
    icon: <Diversity1Icon />,
    children: [
      {
        key: "userList",
        label: "ဝန်ထမ်းများ",
        // roles: ["SUPER_ADMIN", "USER"],
        permission: "User_Detail",
        icon: <FormatListBulletedIcon />,
        url: paths.user,
      },
      {
        key: "userCreate",
        label: "အသစ်ထည့်ရန်",
        // roles: ["SUPER_ADMIN", "USER"],
        permission: "User_Create",
        icon: <AddIcon />,
        url: paths.userCreate,
      },
    ],
  },
  {
    key: "role",
    label: "ခွင့်ပြုချက်",
    data: "Role",
    permission: "Role_Sidebar",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <VpnKeyIcon />,
    children: [
      {
        key: "roleList",
        label: "သတ်မှတ်ချက်များ",
        permission: "Role_Detail",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <FormatListBulletedIcon />,
        url: paths.role,
      },
      {
        key: "roleCreate",
        label: "အသစ်ထည့်ရန်",
        permission: "Role_Create",
        // roles: ["SUPER_ADMIN", "USER"],
        icon: <AddIcon />,
        url: paths.roleCreate,
      },
    ],
  },
  {
    key: "contact",
    label: "ပို့စာများ",
    data: "Contact",
    permission: "Contact_All",
    // roles: ["SUPER_ADMIN", "USER"],
    icon: <ContactsIcon />,
    url: paths.contact,
  },
  {
    key: "profile",
    label: "အကောင့်",
    data: "Profile",
    icon: <AccountCircleIcon />,
    // roles: ["SUPER_ADMIN", "USER", "SALES", "AGENT"],
    url: paths.admin,
  },
  {
    key: "logout",
    label: "ထွက်ရန်",
    data: "Log Out",
    icon: <LogoutIcon />,
    url: paths.logOut,
  },
];
