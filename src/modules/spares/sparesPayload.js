export const sparePayload = {
    update: {
        name: "", 
        status: ""
    },
    store: {
        name: "", 
        status: ""
    },
    columnsName: 'counterColumns',
    columns: [
        { id: "id", label: "Id", minWidth: 60 },
        { id: "name", label: "Name", minWidth: 100 },
        { id: "status", label: "Status", minWidth: 100 },

        { id: "option", label: "Option", minWidth: 100 },
    ],
    paginateParams: {
        page: 1,
        per_page: 10,
        columns: "name,status",
        search: "",
        order: "id",
        sort: "ASC",
        value: "",
        start_date: "",
        end_date: "",
    },
};
