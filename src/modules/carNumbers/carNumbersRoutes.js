import { paths } from "../../constants/paths";
import { CarNumbersCreate } from "./entry/CarNumbersCreate";
import { CarNumbersUpdate } from "./entry/CarNumbersUpdate";
import { CarNumbersList } from "./list/CarNumbersList";




export const carNumbersRoutes = [
    {
        id: "carNumberss",
        path: paths.carNumbers,
        element: <CarNumbersList />,
        loader: () => {
            return {
                breadcrumbs: [
                    { label: "Dashboard", url: paths.dashboard },
                    { label: null, url: null, current: "CarNumbers" },
                ],
                role: ["ADMINISTRATOR"],
            };
        },
    },
    {
        id: "carNumberssCreate",
        path: paths.carNumbersCreate,
        element: <CarNumbersCreate />,
        loader: () => {
            return {
                breadcrumbs: [
                    { label: "Dashboard", url: paths.dashboard },
                    { label: "CarNumbers", url: paths.carNumbers },
                    { label: null, url: null, current: "Create" },
                ],
                role: ["ADMINISTRATOR"],
            };
        },
    },
    {
        id: "carNumbersDetail",
        path: `/${paths.carNumbers}/:id`,
        element: <CarNumbersUpdate />,
        loader: () => {
            return {
                breadcrumbs: [
                    { label: "Dashboard", url: paths.dashboard },
                    { label: "CarNumbers", url: paths.carNumbers },
                    { label: null, url: null, current : "Update" },
                ]
            }
        }
    }
];
