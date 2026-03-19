import { paths } from "../../constants/paths";
import { SpareCreate } from "./entry/SparesCreate";
import { SpareUpdate } from "./entry/SparesUpdate";
import { SpareList } from "./list/SparesList";



export const spareRoutes = [
    {
        id: "spares",
        path: paths.spares,
        element: <SpareList />,
        loader: () => {
            return {
                breadcrumbs: [
                    { label: "Dashboard", url: paths.dashboard },
                    { label: null, url: null, current: "Spare" },
                ],
                role: ["ADMINISTRATOR"],
            };
        },
    },
    {
        id: "sparesCreate",
        path: paths.sparesCreate,
        element: <SpareCreate />,
        loader: () => {
            return {
                breadcrumbs: [
                    { label: "Dashboard", url: paths.dashboard },
                    { label: "Spare", url: paths.spares },
                    { label: null, url: null, current: "Create" },
                ],
                role: ["ADMINISTRATOR"],
            };
        },
    },
    {
        id: "spareDetail",
        path: `/${paths.spares}/:id`,
        element: <SpareUpdate />,
        loader: () => {
            return {
                breadcrumbs: [
                    { label: "Dashboard", url: paths.dashboard },
                    { label: "Spare", url: paths.spares },
                    { label: null, url: null, current : "Update" },
                ]
            }
        }
    }
];
