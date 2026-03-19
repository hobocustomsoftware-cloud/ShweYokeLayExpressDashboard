export const FinanceMemberPayload = {
  update: {
    name: "",
    counter: "",
    fixed_deposit_amount: 0,
    deposit_amount: 0,
    deposit_balance: 0,
    credit_amount: 0,
    total_seats: 0,
    total_amount: 0,
    credit_balance: 0,
    is_vip: false,
  },
  store: {
    name: "",
    fixed_deposit_amount: 0,
    deposit_amount: 0,
    counter: "",
    purchased_total_seats: 0,
    purchased_amount: 0,
    deposit_balance: 0,
    credit_amount: 0,
    credit_balance: 0,
    total_seats: 0,
    total_amount: 0,
  },
  columnsName: "financeMemberColumns",

  columns: [
    { id: "id", label: "Id", minWidth: 60 },
    { id: "name", label: "Name", minWidth: 100 },
    { id: "counter", label: "Counter", minWidth: 100 },
    {
      id: "fixed_deposit_amount",
      label: "Fixed Deposit Amount",
      minWidth: 100,
    },
    {
      id: "deposit_amount",
      label: "Deposit Amount",
      minWidth: 100,
    },
    {
      id: "purchased_total_seats",
      label: "Purchased Total Seats",
      minWidth: 100,
    },
    {
      id: "purchased_amount",
      label: "Purchased Amount",
      minWidth: 100,
    },
    {
      id: "deposit_balance",
      label: "Current Deposit Balance",
      minWidth: 100,
    },

    { id: "credit_amount", label: "Credit Amount", minWidth: 100 },
    { id: "total_seats", label: "Credit Total Seats", minWidth: 100 },
    { id: "total_amount", label: "Credit Purchased", minWidth: 100 },
    { id: "credit_balance", label: "Credit Balance", minWidth: 100 },

    { id: "created_by", label: "Created By", minWidth: 100 },
    { id: "updated_by", label: "Updated By", minWidth: 100 },
    { id: "created_at", label: "Created At", minWidth: 100 },
    { id: "updated_at", label: "Updated At", minWidth: 100 },

    { id: "option", label: "Option", minWidth: 100 },
  ],
  paginateParams: {
    page: 1,
    per_page: 10,
    columns:
      "name,counter,fixed_deposit_amount,deposit_amount,purchased_total_seats,purchased_amount,deposit_balance,credit_amount,total_seats,total_amount,credit_balance,created_at,updated_at,option",
    search: "",
    order: "id",
    sort: "ASC",
    value: "",
    start_date: "",
    end_date: "",
  },
};
