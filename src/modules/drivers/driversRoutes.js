import { paths } from "../../constants/paths";
import { DriverCreate } from "./entry/DriversCreate";
import { DriverUpdate } from "./entry/DriversUpdate";
import { DriverList } from "./list/DriversList";


export const driverRoutes = [
    {
        id: "drivers",
        path: paths.drivers,
        element: <DriverList />,
        loader: () => {
            return {
                breadcrumbs: [
                    { label: "Dashboard", url: paths.dashboard },
                    { label: null, url: null, current: "Driver" },
                ],
                role: ["ADMINISTRATOR"],
            };
        },
    },
    {
        id: "driversCreate",
        path: paths.driversCreate,
        element: <DriverCreate />,
        loader: () => {
            return {
                breadcrumbs: [
                    { label: "Dashboard", url: paths.dashboard },
                    { label: "Driver", url: paths.drivers },
                    { label: null, url: null, current: "Create" },
                ],
                role: ["ADMINISTRATOR"],
            };
        },
    },
    {
        id: "driverDetail",
        path: `/${paths.drivers}/:id`,
        element: <DriverUpdate />,
        loader: () => {
            return {
                breadcrumbs: [
                    { label: "Dashboard", url: paths.dashboard },
                    { label: "Driver", url: paths.drivers },
                    { label: null, url: null, current : "Update" },
                ]
            }
        }
    }
];
