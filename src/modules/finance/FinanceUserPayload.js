export const FinanceUserPayload = {
  // Counter Name	Location		Fixed Deposit		Current Deposit	Purchased Total Seats	Purchased Amount	Current Deposit Balance	Credit Amount	Credit Total Seats	Credit Sales Amount	Credit Balance

  update: {
    user_id: null,
    name: "",
    credit_amount: 0,
    credit_balance: 0,
    total_seats: 0,
    sales_amount: 0,
    start_date: "",
    end_date: "",
  },
  store: {
    name: "",
    email: "",
    phone: "",
    status: "",
    password: "",
    role_names: "",
    counter: "",
  },
  // search: {
  //   start_date: "",
  //   end_date: "",
  //   salesperson_id: "",
  // },
  columnsName: "financeUserColumns",
  columns: [
    { id: "user_id", label: "User ID", minWidth: 60 },
    { id: "name", label: "Counter Name", minWidth: 100 },
    { id: "total_seats", label: "Seats", minWidth: 100 },
    { id: "credit_amount", label: "Credit Amount", minWidth: 100 },
    { id: "total_purchased_amount", label: "Purchased Amount", minWidth: 100 },
    { id: "total_commission", label: "Commission", minWidth: 100 },
    { id: "credit_balance", label: "Credit Balance", minWidth: 100 },

    // { id: "created_by", label: "Created By", minWidth: 100 },
    // { id: "updated_by", label: "Updated By", minWidth: 100 },
    // { id: "created_at", label: "Created At", minWidth: 100 },
    // { id: "updated_at", label: "Updated At", minWidth: 100 },

    { id: "option", label: "Option", minWidth: 200 },
  ],
  paginateParams: {
    page: 1,
    per_page: 10,
    columns:
      "user_id,name,total_seats,credit_amount,total_purchased_amount,total_commission,credit_balance,role_names",
    search: "",
    order: "id",
    sort: "ASC",
    value: "",
    user_id: "",
    start_date: "",
    end_date: "",
  },
};
